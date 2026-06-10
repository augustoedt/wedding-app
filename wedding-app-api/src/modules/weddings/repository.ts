import { eq } from "drizzle-orm"
import type { Database } from "../../db"
import { weddings } from "../../db/schema"

export function createWeddingsRepository(database: Database) {
  return {
    async findByUserId(userId: string) {
      const rows = await database
        .select()
        .from(weddings)
        .where(eq(weddings.userId, userId))
        .limit(1)
      return rows[0] ?? null
    },

    async findById(id: string) {
      const rows = await database
        .select()
        .from(weddings)
        .where(eq(weddings.id, id))
        .limit(1)
      return rows[0] ?? null
    },

    async findBySlug(slug: string) {
      const rows = await database
        .select()
        .from(weddings)
        .where(eq(weddings.slug, slug))
        .limit(1)
      return rows[0] ?? null
    },

    async create(data: {
      userId: string
      title: string
      slug: string
      siteUrl?: string | null
      inviteMessage?: string | null
      date?: string | null
      description?: string | null
      coverImage?: string | null
    }) {
      const rows = await database.insert(weddings).values(data).returning()
      return rows[0]!
    },

    async update(
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
      const rows = await database
        .update(weddings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(weddings.id, id))
        .returning()
      return rows[0] ?? null
    },
  }
}
