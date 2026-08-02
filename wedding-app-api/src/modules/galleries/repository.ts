import { asc, eq, max } from "drizzle-orm"
import type { Database } from "../../db"
import { galleries } from "../../db/schema"

export function createGalleriesRepository(database: Database) {
  return {
    async findByWeddingId(weddingId: string) {
      return database
        .select()
        .from(galleries)
        .where(eq(galleries.weddingId, weddingId))
        .orderBy(asc(galleries.sortOrder), asc(galleries.id))
    },

    async findMaxSortOrder(weddingId: string) {
      const rows = await database
        .select({ value: max(galleries.sortOrder) })
        .from(galleries)
        .where(eq(galleries.weddingId, weddingId))
      return rows[0]?.value ?? null
    },

    async findById(id: string) {
      const rows = await database
        .select()
        .from(galleries)
        .where(eq(galleries.id, id))
        .limit(1)
      return rows[0] ?? null
    },

    async create(data: {
      weddingId: string
      title: string
      sortOrder: number
    }) {
      const rows = await database.insert(galleries).values(data).returning()
      return rows[0]!
    },

    async update(
      id: string,
      data: Partial<{ title: string; sortOrder: number }>
    ) {
      const rows = await database
        .update(galleries)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(galleries.id, id))
        .returning()
      return rows[0] ?? null
    },

    async delete(id: string) {
      await database.delete(galleries).where(eq(galleries.id, id))
    },

    async renumber(weddingId: string) {
      const ordered = await database
        .select({ id: galleries.id })
        .from(galleries)
        .where(eq(galleries.weddingId, weddingId))
        .orderBy(asc(galleries.sortOrder), asc(galleries.id))

      for (let i = 0; i < ordered.length; i++) {
        await database
          .update(galleries)
          .set({ sortOrder: (i + 1) * 1000, updatedAt: new Date() })
          .where(eq(galleries.id, ordered[i]!.id))
      }
    }
  }
}
