import type { Database } from "../../db"
import { createGiftsRepository } from "../gifts/repository"
import { createPaymentsRepository } from "../payments/repository"
import { createPublicRepository } from "./repository"

export function createPublicService(database: Database) {
  const repo = createPublicRepository(database)
  const giftsRepo = createGiftsRepository(database)
  const paymentsRepo = createPaymentsRepository(database)

  return {
    async getWedding(slug: string) {
      const wedding = await repo.findWeddingBySlug(slug)
      if (!wedding) return { error: "not_found" as const }
      return {
        data: {
          id: wedding.id,
          title: wedding.title,
          date: wedding.date,
          description: wedding.description,
          coverImage: wedding.coverImage,
        },
      }
    },

    async listGifts(slug: string, page: number, limit: number) {
      const wedding = await repo.findWeddingBySlug(slug)
      if (!wedding) return { error: "not_found" as const }
      const { items, total } = await repo.findGiftsByWeddingId(wedding.id, page, limit)
      return { data: { items, total, page, limit } }
    },

    async lockGift(
      slug: string,
      giftId: string,
      data: { buyerName: string; buyerEmail: string }
    ) {
      const wedding = await repo.findWeddingBySlug(slug)
      if (!wedding) return { error: "not_found" as const }

      const gift = await repo.findActiveGiftById(giftId, wedding.id)
      if (!gift) return { error: "unavailable" as const }

      await giftsRepo.lock(giftId)

      const payment = await paymentsRepo.create({
        giftId,
        weddingId: wedding.id,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        amount: gift.price,
        status: "pending_confirmation",
      })

      return {
        data: {
          paymentId: payment.id,
          paymentType: gift.paymentType,
          paymentValue: gift.paymentValue,
        },
      }
    },
  }
}
