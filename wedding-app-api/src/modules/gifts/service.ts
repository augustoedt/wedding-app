import type { Database } from "../../db"
import { createWeddingsRepository } from "../weddings/repository"
import { createGiftsRepository } from "./repository"

export function createGiftsService(database: Database) {
  const repo = createGiftsRepository(database)
  const weddingsRepo = createWeddingsRepository(database)

  async function getWeddingForUser(userId: string) {
    return weddingsRepo.findByUserId(userId)
  }

  return {
    async listGifts(userId: string) {
      const wedding = await getWeddingForUser(userId)
      if (!wedding) return { error: "no_wedding" as const }
      return { data: await repo.findByWeddingId(wedding.id) }
    },

    async createGift(
      userId: string,
      data: {
        name: string
        description?: string | null
        price: number
        imageUrl?: string | null
        paymentType?: string | null
        paymentValue?: string | null
      }
    ) {
      const wedding = await getWeddingForUser(userId)
      if (!wedding) return { error: "no_wedding" as const }
      return { data: await repo.create({ ...data, weddingId: wedding.id }) }
    },

    async updateGift(
      userId: string,
      giftId: string,
      data: Partial<{
        name: string
        description: string | null
        price: number
        imageUrl: string | null
        paymentType: string | null
        paymentValue: string | null
        isActive: boolean
      }>
    ) {
      const gift = await repo.findById(giftId)
      if (!gift) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(gift.weddingId)
      if (!wedding || wedding.userId !== userId) return { error: "forbidden" as const }

      return { data: await repo.update(giftId, data) }
    },

    async deleteGift(userId: string, giftId: string) {
      const gift = await repo.findById(giftId)
      if (!gift) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(gift.weddingId)
      if (!wedding || wedding.userId !== userId) return { error: "forbidden" as const }

      await repo.delete(giftId)
      return { data: null }
    },
  }
}
