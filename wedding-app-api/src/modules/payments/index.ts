import { Elysia } from "elysia"
import type { authGuard } from "../../lib/auth-guard"
import type { createPaymentsService } from "./service"
import { paymentIdParams, paymentsQueryParams } from "./model"

export function createPaymentsRoutes({
  service,
  guard,
}: {
  service: ReturnType<typeof createPaymentsService>
  guard: typeof authGuard
}) {
  return new Elysia({ prefix: "/admin" })
    .use(guard)
    .get(
      "/payments",
      async ({ session, query, status }) => {
        const result = await service.listPayments(session!.user.id, query)
        if ("error" in result && result.error === "no_wedding")
          return status(404, { message: "No wedding found" })
        return (result as { data: unknown }).data
      },
      { query: paymentsQueryParams }
    )
    .put(
      "/payments/:id/confirm",
      async ({ session, params, status }) => {
        const result = await service.confirmPayment(session!.user.id, params.id)
        if ("error" in result) {
          if (result.error === "not_found") return status(404, { message: "Payment not found" })
          if (result.error === "forbidden") return status(403, { message: "Forbidden" })
          if (result.error === "invalid_status") return status(409, { message: "Payment cannot be confirmed in its current status" })
        }
        return (result as { data: unknown }).data
      },
      { params: paymentIdParams }
    )
}
