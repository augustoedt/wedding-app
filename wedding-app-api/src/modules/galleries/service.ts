import type { Database } from "../../db"
import { createWeddingsRepository } from "../weddings/repository"
import { createGalleriesRepository } from "./repository"

export function createGalleriesService(database: Database) {
  const repo = createGalleriesRepository(database)
  const weddingsRepo = createWeddingsRepository(database)

  return {
    async listGalleries(userId: string) {
      const wedding = await weddingsRepo.findByUserId(userId)
      if (!wedding) return { error: "no_wedding" as const }
      return { data: await repo.findByWeddingId(wedding.id) }
    },

    async createGallery(userId: string, title: string) {
      const wedding = await weddingsRepo.findByUserId(userId)
      if (!wedding) return { error: "no_wedding" as const }

      const maxSortOrder = await repo.findMaxSortOrder(wedding.id)
      const sortOrder = (maxSortOrder ?? 0) + 1000

      return {
        data: await repo.create({ weddingId: wedding.id, title, sortOrder })
      }
    },

    async updateGallery(
      userId: string,
      galleryId: string,
      data: { title?: string }
    ) {
      const gallery = await repo.findById(galleryId)
      if (!gallery) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(gallery.weddingId)
      if (!wedding || wedding.userId !== userId)
        return { error: "forbidden" as const }

      return { data: await repo.update(galleryId, data) }
    },

    async deleteGallery(userId: string, galleryId: string) {
      const gallery = await repo.findById(galleryId)
      if (!gallery) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(gallery.weddingId)
      if (!wedding || wedding.userId !== userId)
        return { error: "forbidden" as const }

      await repo.delete(galleryId)
      return { data: null }
    },

    async reorderGallery(
      userId: string,
      galleryId: string,
      target: { beforeId?: string; afterId?: string }
    ) {
      const gallery = await repo.findById(galleryId)
      if (!gallery) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(gallery.weddingId)
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
              2
          )
        }
      } else if (before) {
        sortOrder = before.sortOrder + 1000
      } else {
        sortOrder = after!.sortOrder - 1000
      }

      await repo.update(gallery.id, { sortOrder })

      return { data: await repo.findByWeddingId(wedding.id) }
    }
  }
}
