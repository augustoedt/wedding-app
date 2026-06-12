import { eq } from "drizzle-orm"
import type { Database } from "../../db"
import { images } from "../../db/schema"

export function createImagesRepository(database: Database) {
  return {
    async create(data: { weddingId: string; url: string; description?: string | null }) {
      const rows = await database.insert(images).values(data).returning()
      return rows[0]!
    },

    async findByWeddingId(weddingId: string) {
      return database.select().from(images).where(eq(images.weddingId, weddingId))
    },
  }
}
