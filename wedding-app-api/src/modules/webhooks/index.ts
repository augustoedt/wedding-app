import { createHmac } from "crypto"
import { Elysia, t } from "elysia"
import type { Database } from "../../db"
import { createPaymentsRepository } from "../payments/repository"

const MP_STATUS_MAP: Record<string, string> = {
  approved: "approved",
  rejected: "rejected",
  cancelled: "cancelled",
  pending: "pending",
  in_process: "pending",
  refunded: "cancelled",
  charged_back: "cancelled",
}

function verifySignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string
): boolean {
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${xSignature.split(";")[0]?.split("=")[1]};`
  const ts = xSignature.split(";")[0]?.split("=")[1] ?? ""
  const v1 = xSignature.split(";")[1]?.split("=")[1] ?? ""

  const hmac = createHmac("sha256", secret)
  hmac.update(`ts=${ts};${manifest}`)
  const computed = hmac.digest("hex")
  return computed === v1
}

export function createWebhooksRoutes({ database }: { database: Database }) {
  const paymentsRepo = createPaymentsRepository(database)

  return new Elysia({ prefix: "/webhooks" }).post(
    "/mercado-pago",
    async ({ request, body, status }) => {
      const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET

      if (secret) {
        const xSignature = request.headers.get("x-signature") ?? ""
        const xRequestId = request.headers.get("x-request-id") ?? ""
        const dataId = (body as { data?: { id?: string } }).data?.id ?? ""

        if (!verifySignature(xSignature, xRequestId, dataId, secret)) {
          return status(401, { message: "Invalid signature" })
        }
      }

      const notification = body as {
        action?: string
        type?: string
        data?: { id?: string }
      }

      if (notification.type !== "payment" || !notification.data?.id) {
        return { received: true }
      }

      const mpPaymentId = notification.data.id

      const payment = await paymentsRepo.findByMercadoPagoId(mpPaymentId)

      if (!payment) {
        const allByExternalRef = await paymentsRepo.findById(mpPaymentId)
        if (!allByExternalRef) return { received: true }

        const mpStatus = notification.action?.includes("approved")
          ? "approved"
          : "pending"
        await paymentsRepo.updateStatus(
          allByExternalRef.id,
          mpStatus,
          mpPaymentId
        )
        return { received: true }
      }

      const rawStatus = notification.action ?? ""
      const mappedStatus =
        MP_STATUS_MAP[rawStatus.replace("payment.", "")] ?? "pending"
      await paymentsRepo.updateStatus(payment.id, mappedStatus, mpPaymentId)

      return { received: true }
    },
    {
      body: t.Any(),
    }
  )
}
