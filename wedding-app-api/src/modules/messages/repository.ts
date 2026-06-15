import { and, desc, eq } from "drizzle-orm"
import type { Database } from "../../db"
import { guestMessages } from "../../db/schema"

export function createMessagesRepository(database: Database) {
  return {
    async findByWeddingId(weddingId: string) {
      return database
        .select()
        .from(guestMessages)
        .where(eq(guestMessages.weddingId, weddingId))
        .orderBy(desc(guestMessages.createdAt))
    },

    async findVisibleByWeddingId(weddingId: string) {
      return database
        .select()
        .from(guestMessages)
        .where(and(eq(guestMessages.weddingId, weddingId), eq(guestMessages.isVisible, true)))
        .orderBy(desc(guestMessages.createdAt))
    },

    async findById(id: string) {
      const rows = await database
        .select()
        .from(guestMessages)
        .where(eq(guestMessages.id, id))
        .limit(1)
      return rows[0] ?? null
    },

    async create(data: {
      weddingId: string
      paymentId: string
      senderName: string
      message: string
      isVisible?: boolean
    }) {
      const rows = await database.insert(guestMessages).values(data).returning()
      return rows[0]!
    },

    async updateVisibility(id: string, isVisible: boolean) {
      const rows = await database
        .update(guestMessages)
        .set({ isVisible, updatedAt: new Date() })
        .where(eq(guestMessages.id, id))
        .returning()
      return rows[0] ?? null
    },
  }
}
