import type { Database } from "../../db"
import { createGiftsRepository } from "../gifts/repository"
import { createWeddingsRepository } from "../weddings/repository"
import { createPaymentsRepository } from "./repository"

export function createPaymentsService(database: Database) {
  const repo = createPaymentsRepository(database)
  const weddingsRepo = createWeddingsRepository(database)
  const giftsRepo = createGiftsRepository(database)

  return {
    async listPayments(
      userId: string,
      filters: { status?: string; giftId?: string } = {}
    ) {
      const wedding = await weddingsRepo.findByUserId(userId)
      if (!wedding) return { error: "no_wedding" as const }
      return { data: await repo.findByWeddingId(wedding.id, filters) }
    },

    async getPaymentSummary(userId: string) {
      const wedding = await weddingsRepo.findByUserId(userId)
      if (!wedding) return { error: "no_wedding" as const }

      const payments = await repo.findByWeddingId(wedding.id, { status: "approved" })
      const total = payments.reduce((sum, p) => sum + p.amount, 0)
      const recent = payments.slice(0, 5)

      return { data: { total, recent } }
    },

    async confirmPayment(userId: string, paymentId: string) {
      const payment = await repo.findById(paymentId)
      if (!payment) return { error: "not_found" as const }

      if (payment.status !== "pending_confirmation")
        return { error: "invalid_status" as const }

      const wedding = await weddingsRepo.findById(payment.weddingId)
      if (!wedding || wedding.userId !== userId) return { error: "forbidden" as const }

      await repo.updateStatus(paymentId, "approved")
      await giftsRepo.confirmPurchase(payment.giftId)

      return { data: { id: paymentId, status: "approved" } }
    },
  }
}
