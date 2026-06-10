import { Elysia } from "elysia"
import type { authGuard } from "../../lib/auth-guard"
import type { createGiftsService } from "./service"
import { createGiftBody, giftIdParams, updateGiftBody } from "./model"

export function createGiftsRoutes({
  service,
  guard,
}: {
  service: ReturnType<typeof createGiftsService>
  guard: typeof authGuard
}) {
  return new Elysia({ prefix: "/admin" })
    .use(guard)
    .get("/gifts", async ({ session, status }) => {
      const result = await service.listGifts(session!.user.id)
      if ("error" in result && result.error === "no_wedding")
        return status(404, { message: "No wedding found" })
      return (result as { data: unknown }).data
    })
    .post(
      "/gifts",
      async ({ session, body, status }) => {
        const result = await service.createGift(session!.user.id, body)
        if ("error" in result && result.error === "no_wedding")
          return status(404, { message: "No wedding found" })
        return new Response(JSON.stringify((result as { data: unknown }).data), {
          status: 201,
          headers: { "content-type": "application/json" },
        })
      },
      { body: createGiftBody }
    )
    .put(
      "/gifts/:id",
      async ({ session, params, body, status }) => {
        const result = await service.updateGift(session!.user.id, params.id, body)
        if ("error" in result) {
          if (result.error === "not_found") return status(404, { message: "Gift not found" })
          if (result.error === "forbidden") return status(403, { message: "Forbidden" })
        }
        return (result as { data: unknown }).data
      },
      { params: giftIdParams, body: updateGiftBody }
    )
    .delete(
      "/gifts/:id",
      async ({ session, params, status }) => {
        const result = await service.deleteGift(session!.user.id, params.id)
        if ("error" in result) {
          if (result.error === "not_found") return status(404, { message: "Gift not found" })
          if (result.error === "forbidden") return status(403, { message: "Forbidden" })
        }
        return new Response(null, { status: 204 })
      },
      { params: giftIdParams }
    )
}
