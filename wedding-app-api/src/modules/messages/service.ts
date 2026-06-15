import type { Database } from "../../db"
import { createWeddingsRepository } from "../weddings/repository"
import { createMessagesRepository } from "./repository"

export function createMessagesService(database: Database) {
  const repo = createMessagesRepository(database)
  const weddingsRepo = createWeddingsRepository(database)

  return {
    async listMessages(userId: string) {
      const wedding = await weddingsRepo.findByUserId(userId)
      if (!wedding) return { error: "no_wedding" as const }
      return { data: await repo.findByWeddingId(wedding.id) }
    },

    async setVisibility(userId: string, messageId: string, isVisible: boolean) {
      const message = await repo.findById(messageId)
      if (!message) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(message.weddingId)
      if (!wedding || wedding.userId !== userId) return { error: "forbidden" as const }

      const updated = await repo.updateVisibility(messageId, isVisible)
      return { data: updated }
    },
  }
}
