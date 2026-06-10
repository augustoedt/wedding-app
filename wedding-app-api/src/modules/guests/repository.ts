import { eq } from "drizzle-orm"
import type { Database } from "../../db"
import { guests } from "../../db/schema"

export function createGuestsRepository(database: Database) {
  return {
    async findByWeddingId(weddingId: string) {
      return database
        .select()
        .from(guests)
        .where(eq(guests.weddingId, weddingId))
    },

    async findById(id: string) {
      const rows = await database
        .select()
        .from(guests)
        .where(eq(guests.id, id))
        .limit(1)
      return rows[0] ?? null
    },

    async create(data: {
      weddingId: string
      name: string
      email?: string | null
      phone?: string | null
      plusOne?: number
    }) {
      const rows = await database
        .insert(guests)
        .values({ ...data, rsvpToken: crypto.randomUUID() })
        .returning()
      return rows[0]!
    },

    async findByRsvpToken(token: string) {
      const rows = await database
        .select()
        .from(guests)
        .where(eq(guests.rsvpToken, token))
        .limit(1)
      return rows[0] ?? null
    },

    async update(
      id: string,
      data: Partial<{
        name: string
        email: string | null
        phone: string | null
        rsvp: string
        plusOne: number
        inviteSent: boolean
      }>
    ) {
      const rows = await database
        .update(guests)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(guests.id, id))
        .returning()
      return rows[0] ?? null
    },

    async delete(id: string) {
      await database.delete(guests).where(eq(guests.id, id))
    },
  }
}
