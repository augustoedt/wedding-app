import type { Database } from "../../db"
import { deleteImage, uploadImage } from "../../lib/storage"
import { createGalleriesRepository } from "../galleries/repository"
import { createWeddingsRepository } from "../weddings/repository"
import { createImagesRepository } from "./repository"

function extensionFromFilename(filename: string) {
  const match = filename.match(/\.([a-zA-Z0-9]+)$/)
  return match ? match[1]!.toLowerCase() : "bin"
}

export function createImagesService(database: Database) {
  const repo = createImagesRepository(database)
  const weddingsRepo = createWeddingsRepository(database)
  const galleriesRepo = createGalleriesRepository(database)

  return {
    async list(userId: string) {
      const wedding = await weddingsRepo.findByUserId(userId)
      if (!wedding) return { error: "no_wedding" as const }

      return { data: await repo.findByWeddingId(wedding.id) }
    },

    async upload(
      userId: string,
      file: File,
      description?: string,
      galleryId?: string
    ) {
      const wedding = await weddingsRepo.findByUserId(userId)
      if (!wedding) return { error: "no_wedding" as const }

      if (galleryId) {
        const gallery = await galleriesRepo.findById(galleryId)
        if (!gallery || gallery.weddingId !== wedding.id)
          return { error: "forbidden" as const }
      }

      const key = `wedding/${wedding.slug}/${crypto.randomUUID()}.${extensionFromFilename(file.name)}`
      const url = await uploadImage(key, file)

      const sortOrder = galleryId
        ? ((await repo.findMaxSortOrder(galleryId)) ?? 0) + 1000
        : 0

      return {
        data: await repo.create({
          weddingId: wedding.id,
          url,
          description,
          galleryId,
          sortOrder
        })
      }
    },

    async updateImage(
      userId: string,
      imageId: string,
      data: { description?: string | null; galleryId?: string | null }
    ) {
      const image = await repo.findById(imageId)
      if (!image) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(image.weddingId)
      if (!wedding || wedding.userId !== userId)
        return { error: "forbidden" as const }

      const updateData: Partial<{
        description: string | null
        galleryId: string | null
        sortOrder: number
      }> = {}

      if ("description" in data)
        updateData.description = data.description ?? null

      if ("galleryId" in data) {
        if (data.galleryId) {
          const gallery = await galleriesRepo.findById(data.galleryId)
          if (!gallery || gallery.weddingId !== wedding.id)
            return { error: "forbidden" as const }
          updateData.galleryId = data.galleryId
          updateData.sortOrder =
            ((await repo.findMaxSortOrder(data.galleryId)) ?? 0) + 1000
        } else {
          updateData.galleryId = null
          updateData.sortOrder = 0
        }
      }

      return { data: await repo.update(imageId, updateData) }
    },

    async reorderImage(
      userId: string,
      imageId: string,
      target: { beforeId?: string; afterId?: string }
    ) {
      const image = await repo.findById(imageId)
      if (!image || !image.galleryId) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(image.weddingId)
      if (!wedding || wedding.userId !== userId)
        return { error: "forbidden" as const }

      const before = target.beforeId
        ? await repo.findById(target.beforeId)
        : null
      const after = target.afterId ? await repo.findById(target.afterId) : null

      if (target.beforeId && (!before || before.galleryId !== image.galleryId))
        return { error: "forbidden" as const }
      if (target.afterId && (!after || after.galleryId !== image.galleryId))
        return { error: "forbidden" as const }
      if (!before && !after) return { error: "invalid_target" as const }

      let sortOrder: number
      if (before && after) {
        sortOrder = Math.floor((before.sortOrder + after.sortOrder) / 2)
        const noRoomLeft =
          sortOrder <= before.sortOrder || sortOrder >= after.sortOrder
        if (noRoomLeft) {
          await repo.renumber(image.galleryId)
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

      await repo.update(image.id, { sortOrder })

      return { data: await repo.findByGalleryId(image.galleryId) }
    },

    async delete(userId: string, imageId: string) {
      const image = await repo.findById(imageId)
      if (!image) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(image.weddingId)
      if (!wedding || wedding.userId !== userId)
        return { error: "forbidden" as const }

      const key = image.url.replace(`${process.env.B2_PUBLIC_URL}/`, "")
      try {
        await deleteImage(key)
      } catch (e) {
        console.error(`[images] failed to delete ${key} from storage:`, e)
      }

      await repo.delete(imageId)
      return { data: null }
    }
  }
}
