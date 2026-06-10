import { Elysia } from "elysia"
import type { createGuestsService } from "../guests/service"
import type { createPublicService } from "./service"
import { giftLockParams, giftsQuery, lockGiftBody, rsvpTokenBody, rsvpTokenParams, slugParams } from "./model"

export function createPublicRoutes({
  service,
  guestsService,
}: {
  service: ReturnType<typeof createPublicService>
  guestsService: ReturnType<typeof createGuestsService>
}) {
  return new Elysia({ prefix: "/public" })
    .get(
      "/weddings/:slug",
      async ({ params, status }) => {
        const result = await service.getWedding(params.slug)
        if ("error" in result) return status(404, { message: "Wedding not found" })
        return (result as { data: unknown }).data
      },
      { params: slugParams }
    )
    .get(
      "/weddings/:slug/gifts",
      async ({ params, query, status }) => {
        const page = query.page ?? 1
        const limit = query.limit ?? 20
        const result = await service.listGifts(params.slug, page, limit)
        if ("error" in result) return status(404, { message: "Wedding not found" })
        return (result as { data: unknown }).data
      },
      { params: slugParams, query: giftsQuery }
    )
    .post(
      "/weddings/:slug/gifts/:giftId/lock",
      async ({ params, body, status }) => {
        const result = await service.lockGift(params.slug, params.giftId, body)
        if ("error" in result) {
          if (result.error === "not_found") return status(404, { message: "Wedding not found" })
          if (result.error === "unavailable") return status(409, { message: "Gift is not available" })
        }
        return new Response(JSON.stringify((result as { data: unknown }).data), {
          status: 201,
          headers: { "content-type": "application/json" },
        })
      },
      { params: giftLockParams, body: lockGiftBody }
    )
    .get(
      "/rsvp/:token",
      async ({ params, status }) => {
        const result = await guestsService.getGuestByToken(params.token)
        if ("error" in result) return status(404, { message: "Invalid or expired RSVP link" })
        return (result as { data: unknown }).data
      },
      { params: rsvpTokenParams }
    )
    .post(
      "/rsvp/:token",
      async ({ params, body, status }) => {
        const result = await guestsService.confirmRsvpByToken(params.token, body.rsvp)
        if ("error" in result) return status(404, { message: "Invalid or expired RSVP link" })
        return (result as { data: unknown }).data
      },
      { params: rsvpTokenParams, body: rsvpTokenBody }
    )
}
