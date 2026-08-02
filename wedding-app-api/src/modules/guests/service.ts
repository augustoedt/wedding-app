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

      // Confirmed companions only make sense while rsvp is "confirmed" — clear them on any other status.
      const normalized = data.rsvp && data.rsvp !== "confirmed" ? { ...data, confirmedCompanions: 0 } : data

      return { data: await repo.update(guestId, normalized) }
    },

    async getGuestByToken(token: string) {
      const guest = await repo.findByRsvpToken(token)
      if (!guest) return { error: "not_found" as const }
      return {
        data: {
          name: guest.name,
          rsvp: guest.rsvp,
          allowedCompanions: guest.plusOne,
          confirmedCompanions: guest.confirmedCompanions,
        },
      }
    },

    async confirmRsvpByToken(token: string, rsvp: "confirmed" | "declined", companions?: number) {
      const guest = await repo.findByRsvpToken(token)
      if (!guest) return { error: "not_found" as const }

      if (rsvp === "declined") {
        return { data: await repo.update(guest.id, { rsvp, confirmedCompanions: 0 }) }
      }

      const requested = companions ?? 0
      if (requested > guest.plusOne) {
        return { error: "companions_over_limit" as const, allowed: guest.plusOne }
      }

      return { data: await repo.update(guest.id, { rsvp, confirmedCompanions: requested }) }
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
