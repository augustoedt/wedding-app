import { and, eq, isNotNull, lt } from "drizzle-orm"
import type { Database } from "../../db"
import { gifts } from "../../db/schema"

export function createGiftsRepository(database: Database) {
  return {
    async findByWeddingId(weddingId: string) {
      return database.select().from(gifts).where(eq(gifts.weddingId, weddingId))
    },

    async findById(id: string) {
      const rows = await database
        .select()
        .from(gifts)
        .where(eq(gifts.id, id))
        .limit(1)
      return rows[0] ?? null
    },

    async create(data: {
      weddingId: string
      name: string
      description?: string | null
      price: number
      imageUrl?: string | null
      paymentType?: string | null
      paymentValue?: string | null
    }) {
      const rows = await database.insert(gifts).values(data).returning()
      return rows[0]!
    },

    async update(
      id: string,
      data: Partial<{
        name: string
        description: string | null
        price: number
        imageUrl: string | null
        paymentType: string | null
        paymentValue: string | null
        isActive: boolean
      }>
    ) {
      const rows = await database
        .update(gifts)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(gifts.id, id))
        .returning()
      return rows[0] ?? null
    },

    async delete(id: string) {
      await database.delete(gifts).where(eq(gifts.id, id))
    },

    async lock(id: string) {
      const rows = await database
        .update(gifts)
        .set({ isActive: false, lockedAt: new Date(), updatedAt: new Date() })
        .where(eq(gifts.id, id))
        .returning()
      return rows[0] ?? null
    },

    async reactivate(id: string) {
      await database
        .update(gifts)
        .set({ isActive: true, lockedAt: null, updatedAt: new Date() })
        .where(eq(gifts.id, id))
    },

    async confirmPurchase(id: string) {
      await database
        .update(gifts)
        .set({ lockedAt: null, updatedAt: new Date() })
        .where(eq(gifts.id, id))
    },

    async findExpiredLocks(cutoff: Date) {
      return database
        .select()
        .from(gifts)
        .where(
          and(
            eq(gifts.isActive, false),
            isNotNull(gifts.lockedAt),
            lt(gifts.lockedAt, cutoff)
          )
        )
    },
  }
}
