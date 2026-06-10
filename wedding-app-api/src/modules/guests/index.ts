import { Elysia } from "elysia"
import type { authGuard } from "../../lib/auth-guard"
import type { createGuestsService } from "./service"
import { createGuestBody, guestIdParams, updateGuestBody } from "./model"

export function createGuestsRoutes({
  service,
  guard,
}: {
  service: ReturnType<typeof createGuestsService>
  guard: typeof authGuard
}) {
  return new Elysia({ prefix: "/admin" })
    .use(guard)
    .get("/guests/:id", async ({ session, params, status }) => {
      const result = await service.getGuest(session!.user.id, params.id)
      if ("error" in result) {
        if (result.error === "not_found") return status(404, { message: "Guest not found" })
        if (result.error === "forbidden") return status(403, { message: "Forbidden" })
      }
      return (result as { data: unknown }).data
    }, { params: guestIdParams })
    .get("/guests", async ({ session, status }) => {
      const result = await service.listGuests(session!.user.id)
      if ("error" in result && result.error === "no_wedding")
        return status(404, { message: "No wedding found" })
      return (result as { data: unknown }).data
    })
    .post(
      "/guests",
      async ({ session, body, status }) => {
        const result = await service.createGuest(session!.user.id, body)
        if ("error" in result && result.error === "no_wedding")
          return status(404, { message: "No wedding found" })
        return new Response(JSON.stringify((result as { data: unknown }).data), {
          status: 201,
          headers: { "content-type": "application/json" },
        })
      },
      { body: createGuestBody }
    )
    .put(
      "/guests/:id",
      async ({ session, params, body, status }) => {
        const result = await service.updateGuest(session!.user.id, params.id, body)
        if ("error" in result) {
          if (result.error === "not_found") return status(404, { message: "Guest not found" })
          if (result.error === "forbidden") return status(403, { message: "Forbidden" })
        }
        return (result as { data: unknown }).data
      },
      { params: guestIdParams, body: updateGuestBody }
    )
    .delete(
      "/guests/:id",
      async ({ session, params, status }) => {
        const result = await service.deleteGuest(session!.user.id, params.id)
        if ("error" in result) {
          if (result.error === "not_found") return status(404, { message: "Guest not found" })
          if (result.error === "forbidden") return status(403, { message: "Forbidden" })
        }
        return new Response(null, { status: 204 })
      },
      { params: guestIdParams }
    )
}
