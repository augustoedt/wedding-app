import type { Database } from "../../db"
import { createPaymentsRepository } from "../payments/repository"
import { createWeddingsRepository } from "../weddings/repository"
import type { giftStatus } from "./model"
import { createGiftsRepository } from "./repository"

type GiftStatus = (typeof giftStatus)["static"]

function statusToFields(status: GiftStatus) {
  switch (status) {
    case "available":
      return { isActive: true, lockedAt: null }
    case "locked":
      return { isActive: false, lockedAt: new Date() }
    case "purchased":
      return { isActive: false, lockedAt: null }
  }
}

export function createGiftsService(database: Database) {
  const repo = createGiftsRepository(database)
  const paymentsRepo = createPaymentsRepository(database)
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
        status: GiftStatus
      }>
    ) {
      const gift = await repo.findById(giftId)
      if (!gift) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(gift.weddingId)
      if (!wedding || wedding.userId !== userId) return { error: "forbidden" as const }

      const { status, ...rest } = data
      const statusFields = status ? statusToFields(status) : {}

      const updated = await repo.update(giftId, { ...rest, ...statusFields })

      if (status && status !== "locked" && gift.lockedAt) {
        await paymentsRepo.expirePendingByGiftIds([giftId])
      }

      return { data: updated }
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
