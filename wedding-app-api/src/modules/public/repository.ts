import { and, asc, count, eq } from "drizzle-orm"
import type { Database } from "../../db"
import { galleries, gifts, images, weddings } from "../../db/schema"

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
          .orderBy(asc(gifts.sortOrder), asc(gifts.id))
          .limit(limit)
          .offset((page - 1) * limit),
        database
          .select({ total: count() })
          .from(gifts)
          .where(eq(gifts.weddingId, weddingId))
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

    async findGalleriesByWeddingId(weddingId: string) {
      const [galleryRows, imageRows] = await Promise.all([
        database
          .select()
          .from(galleries)
          .where(eq(galleries.weddingId, weddingId))
          .orderBy(asc(galleries.sortOrder), asc(galleries.id)),
        database
          .select()
          .from(images)
          .where(eq(images.weddingId, weddingId))
          .orderBy(asc(images.sortOrder), asc(images.id))
      ])

      return galleryRows
        .map((gallery) => ({
          id: gallery.id,
          title: gallery.title,
          images: imageRows
            .filter((image) => image.galleryId === gallery.id)
            .map((image) => ({
              id: image.id,
              url: image.url,
              description: image.description
            }))
        }))
        .filter((gallery) => gallery.images.length > 0)
    }
  }
}
