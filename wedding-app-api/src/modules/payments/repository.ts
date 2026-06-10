import { and, desc, eq, inArray } from "drizzle-orm"
import type { Database } from "../../db"
import { giftPayments } from "../../db/schema"

export function createPaymentsRepository(database: Database) {
  return {
    async findByWeddingId(
      weddingId: string,
      filters: { status?: string; giftId?: string } = {}
    ) {
      const conditions = [eq(giftPayments.weddingId, weddingId)]

      if (filters.status) {
        conditions.push(eq(giftPayments.status, filters.status))
      }
      if (filters.giftId) {
        conditions.push(eq(giftPayments.giftId, filters.giftId))
      }

      return database
        .select()
        .from(giftPayments)
        .where(and(...conditions))
        .orderBy(desc(giftPayments.createdAt))
    },

    async findById(id: string) {
      const rows = await database
        .select()
        .from(giftPayments)
        .where(eq(giftPayments.id, id))
        .limit(1)
      return rows[0] ?? null
    },

    async findByMercadoPagoId(mercadoPagoId: string) {
      const rows = await database
        .select()
        .from(giftPayments)
        .where(eq(giftPayments.mercadoPagoId, mercadoPagoId))
        .limit(1)
      return rows[0] ?? null
    },

    async create(data: {
      giftId: string
      weddingId: string
      buyerName: string
      buyerEmail: string
      amount: number
      status?: string
      mercadoPagoPreferenceId?: string
    }) {
      const rows = await database.insert(giftPayments).values(data).returning()
      return rows[0]!
    },

    async updateStatus(
      id: string,
      status: string,
      mercadoPagoId?: string
    ) {
      const rows = await database
        .update(giftPayments)
        .set({ status, mercadoPagoId, updatedAt: new Date() })
        .where(eq(giftPayments.id, id))
        .returning()
      return rows[0] ?? null
    },

    async expirePendingByGiftIds(giftIds: string[]) {
      if (giftIds.length === 0) return
      await database
        .update(giftPayments)
        .set({ status: "expired", updatedAt: new Date() })
        .where(
          and(
            inArray(giftPayments.giftId, giftIds),
            eq(giftPayments.status, "pending_confirmation")
          )
        )
    },
  }
}
