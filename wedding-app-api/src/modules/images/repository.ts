import { asc, eq, max } from "drizzle-orm"
import type { Database } from "../../db"
import { images } from "../../db/schema"

export function createImagesRepository(database: Database) {
  return {
    async create(data: {
      weddingId: string
      url: string
      description?: string | null
      galleryId?: string | null
      sortOrder?: number
    }) {
      const rows = await database.insert(images).values(data).returning()
      return rows[0]!
    },

    async findByWeddingId(weddingId: string) {
      return database
        .select()
        .from(images)
        .where(eq(images.weddingId, weddingId))
    },

    async findByGalleryId(galleryId: string) {
      return database
        .select()
        .from(images)
        .where(eq(images.galleryId, galleryId))
        .orderBy(asc(images.sortOrder), asc(images.id))
    },

    async findMaxSortOrder(galleryId: string) {
      const rows = await database
        .select({ value: max(images.sortOrder) })
        .from(images)
        .where(eq(images.galleryId, galleryId))
      return rows[0]?.value ?? null
    },

    async findById(id: string) {
      const rows = await database
        .select()
        .from(images)
        .where(eq(images.id, id))
        .limit(1)
      return rows[0] ?? null
    },

    async update(
      id: string,
      data: Partial<{
        description: string | null
        galleryId: string | null
        sortOrder: number
      }>
    ) {
      const rows = await database
        .update(images)
        .set(data)
        .where(eq(images.id, id))
        .returning()
      return rows[0] ?? null
    },

    async delete(id: string) {
      await database.delete(images).where(eq(images.id, id))
    },

    async renumber(galleryId: string) {
      const ordered = await database
        .select({ id: images.id })
        .from(images)
        .where(eq(images.galleryId, galleryId))
        .orderBy(asc(images.sortOrder), asc(images.id))

      for (let i = 0; i < ordered.length; i++) {
        await database
          .update(images)
          .set({ sortOrder: (i + 1) * 1000 })
          .where(eq(images.id, ordered[i]!.id))
      }
    }
  }
}
