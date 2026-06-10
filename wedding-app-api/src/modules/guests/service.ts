import type { Database } from "../../db"
import { createWeddingsRepository } from "../weddings/repository"
import { createGuestsRepository } from "./repository"

export function createGuestsService(database: Database) {
  const repo = createGuestsRepository(database)
  const weddingsRepo = createWeddingsRepository(database)

  async function getWeddingForUser(userId: string) {
    return weddingsRepo.findByUserId(userId)
  }

  return {
    async getGuest(userId: string, guestId: string) {
      const guest = await repo.findById(guestId)
      if (!guest) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(guest.weddingId)
      if (!wedding || wedding.userId !== userId) return { error: "forbidden" as const }

      return { data: guest }
    },

    async listGuests(userId: string) {
      const wedding = await getWeddingForUser(userId)
      if (!wedding) return { error: "no_wedding" as const }
      return { data: await repo.findByWeddingId(wedding.id) }
    },

    async createGuest(
      userId: string,
      data: {
        name: string
        email?: string | null
        phone?: string | null
        plusOne?: number
      }
    ) {
      const wedding = await getWeddingForUser(userId)
      if (!wedding) return { error: "no_wedding" as const }
      return { data: await repo.create({ ...data, weddingId: wedding.id }) }
    },

    async updateGuest(
      userId: string,
      guestId: string,
      data: Partial<{
        name: string
        email: string | null
        phone: string | null
        rsvp: string
        plusOne: number
        inviteSent: boolean
      }>
    ) {
      const guest = await repo.findById(guestId)
      if (!guest) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(guest.weddingId)
      if (!wedding || wedding.userId !== userId) return { error: "forbidden" as const }

      return { data: await repo.update(guestId, data) }
    },

    async getGuestByToken(token: string) {
      const guest = await repo.findByRsvpToken(token)
      if (!guest) return { error: "not_found" as const }
      return { data: { name: guest.name, rsvp: guest.rsvp } }
    },

    async confirmRsvpByToken(token: string, rsvp: "confirmed" | "declined") {
      const guest = await repo.findByRsvpToken(token)
      if (!guest) return { error: "not_found" as const }
      return { data: await repo.update(guest.id, { rsvp }) }
    },

    async deleteGuest(userId: string, guestId: string) {
      const guest = await repo.findById(guestId)
      if (!guest) return { error: "not_found" as const }

      const wedding = await weddingsRepo.findById(guest.weddingId)
      if (!wedding || wedding.userId !== userId) return { error: "forbidden" as const }

      await repo.delete(guestId)
      return { data: null }
    },
  }
}
