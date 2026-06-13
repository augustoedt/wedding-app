import type { Database } from "../../db"
import { deleteImage, uploadImage } from "../../lib/storage"
import { createWeddingsRepository } from "../weddings/repository"
import { createImagesRepository } from "./repository"

function extensionFromFilename(filename: string) {
  const match = filename.match(/\.([a-zA-Z0-9]+)$/)
  return match ? match[1]!.toLowerCase() : "bin"
}

export function createImagesService(database: Database) {
  const repo = createImagesRepository(database)
  const weddingsRepo = createWeddingsRepository(database)

  return {
    async list(userId: string) {
      const wedding = await weddingsRepo.findByUserId(userId)
      if (!wedding) return { error: "no_wedding" as const }

      return { data: await repo.findByWeddingId(wedding.id) }
    },

    async upload(userId: string, file: File, description?: string) {
      const wedding = await weddingsRepo.findByUserId(userId)
      if (!wedding) return { error: "no_wedding" as const }

      const key = `wedding/${wedding.slug}/${crypto.randomUUID()}.${extensionFromFilename(file.name)}`
      const url = await uploadImage(key, file)

      return { data: await repo.create({ weddingId: wedding.id, url, description }) }
    },

    async delete(userId: string, imageId: string) {
      const image = await repo.findById(imageId)
      if (!image) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(image.weddingId)
      if (!wedding || wedding.userId !== userId) return { error: "forbidden" as const }

      const key = image.url.replace(`${process.env.B2_PUBLIC_URL}/`, "")
      try {
        await deleteImage(key)
      } catch (e) {
        console.error(`[images] failed to delete ${key} from storage:`, e)
      }

      await repo.delete(imageId)
      return { data: null }
    },
  }
}
