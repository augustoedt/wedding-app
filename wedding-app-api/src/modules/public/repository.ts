import { and, count, eq } from "drizzle-orm"
import type { Database } from "../../db"
import { gifts, weddings } from "../../db/schema"

export function createPublicRepository(database: Database) {
  return {
    async findWeddingBySlug(slug: string) {
      const rows = await database
        .select()
        .from(weddings)
        .where(and(eq(weddings.slug, slug), eq(weddings.isPublished, true)))
        .limit(1)
      return rows[0] ?? null
    },

    async findGiftsByWeddingId(weddingId: string, page: number, limit: number) {
      const [items, [{ total }]] = await Promise.all([
        database
          .select()
          .from(gifts)
          .where(eq(gifts.weddingId, weddingId))
          .limit(limit)
          .offset((page - 1) * limit),
        database
          .select({ total: count() })
          .from(gifts)
          .where(eq(gifts.weddingId, weddingId)),
      ])
      return { items, total }
    },

    async findActiveGiftById(giftId: string, weddingId: string) {
      const rows = await database
        .select()
        .from(gifts)
        .where(
          and(
            eq(gifts.id, giftId),
            eq(gifts.weddingId, weddingId),
            eq(gifts.isActive, true)
          )
        )
        .limit(1)
      return rows[0] ?? null
    },

  }
}
