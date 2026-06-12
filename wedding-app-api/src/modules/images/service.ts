import type { Database } from "../../db"
import { uploadImage } from "../../lib/storage"
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
  }
}
