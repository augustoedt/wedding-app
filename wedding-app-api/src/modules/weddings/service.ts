import type { Database } from "../../db"
import { createWeddingsRepository } from "./repository"

export function createWeddingsService(database: Database) {
  const repo = createWeddingsRepository(database)

  return {
    async getMyWedding(userId: string) {
      return repo.findByUserId(userId)
    },

    async createWedding(
      userId: string,
      data: {
        title: string
        slug: string
        siteUrl?: string
        inviteMessage?: string
        date?: string
        description?: string
        coverImage?: string
      }
    ) {
      const existing = await repo.findBySlug(data.slug)
      if (existing) return { error: "slug_taken" as const }

      const userWedding = await repo.findByUserId(userId)
      if (userWedding) return { error: "already_exists" as const }

      return { data: await repo.create({ ...data, userId }) }
    },

    async updateWedding(
      userId: string,
      id: string,
      data: Partial<{
        title: string
        slug: string
        siteUrl: string | null
        inviteMessage: string | null
        date: string | null
        description: string | null
        coverImage: string | null
        isPublished: boolean
      }>
    ) {
      const wedding = await repo.findById(id)
      if (!wedding) return { error: "not_found" as const }
      if (wedding.userId !== userId) return { error: "forbidden" as const }

      if (data.slug && data.slug !== wedding.slug) {
        const existing = await repo.findBySlug(data.slug)
        if (existing) return { error: "slug_taken" as const }
      }

      return { data: await repo.update(id, data) }
    },
  }
}
