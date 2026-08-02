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
      },
    ) {
      const wedding = await getWeddingForUser(userId)
      if (!wedding) return { error: "no_wedding" as const }

      const maxSortOrder = await repo.findMaxSortOrder(wedding.id)
      const sortOrder = (maxSortOrder ?? 0) + 1000

      return {
        data: await repo.create({ ...data, weddingId: wedding.id, sortOrder }),
      }
    },

    async reorderGift(
      userId: string,
      giftId: string,
      target: { beforeId?: string; afterId?: string },
    ) {
      const gift = await repo.findById(giftId)
      if (!gift) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(gift.weddingId)
      if (!wedding || wedding.userId !== userId)
        return { error: "forbidden" as const }

      const before = target.beforeId
        ? await repo.findById(target.beforeId)
        : null
      const after = target.afterId ? await repo.findById(target.afterId) : null

      if (target.beforeId && (!before || before.weddingId !== wedding.id))
        return { error: "forbidden" as const }
      if (target.afterId && (!after || after.weddingId !== wedding.id))
        return { error: "forbidden" as const }
      if (!before && !after) return { error: "invalid_target" as const }

      let sortOrder: number
      if (before && after) {
        sortOrder = Math.floor((before.sortOrder + after.sortOrder) / 2)
        const noRoomLeft =
          sortOrder <= before.sortOrder || sortOrder >= after.sortOrder
        if (noRoomLeft) {
          await repo.renumber(wedding.id)
          const refreshedBefore = await repo.findById(before.id)
          const refreshedAfter = await repo.findById(after.id)
          sortOrder = Math.floor(
            ((refreshedBefore?.sortOrder ?? 0) +
              (refreshedAfter?.sortOrder ?? 0)) /
              2,
          )
        }
      } else if (before) {
        sortOrder = before.sortOrder + 1000
      } else {
        sortOrder = after!.sortOrder - 1000
      }

      await repo.update(gift.id, { sortOrder })

      return { data: await repo.findByWeddingId(wedding.id) }
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
      }>,
    ) {
      const gift = await repo.findById(giftId)
      if (!gift) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(gift.weddingId)
      if (!wedding || wedding.userId !== userId)
        return { error: "forbidden" as const }

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
      if (!wedding || wedding.userId !== userId)
        return { error: "forbidden" as const }

      await repo.delete(giftId)
      return { data: null }
    },
  }
}
