import { Elysia } from "elysia"
import type { authGuard } from "../../lib/auth-guard"
import type { createWeddingsService } from "./service"
import { createWeddingBody, updateWeddingBody, weddingIdParams } from "./model"

export function createWeddingsRoutes({
  service,
  guard,
}: {
  service: ReturnType<typeof createWeddingsService>
  guard: typeof authGuard
}) {
  return new Elysia({ prefix: "/admin" })
    .use(guard)
    .get("/wedding/me", async ({ session, status }) => {
      const wedding = await service.getMyWedding(session!.user.id)
      if (!wedding) return status(404, { message: "Wedding not found" })
      return wedding
    })
    .post(
      "/wedding",
      async ({ session, body, status }) => {
        const result = await service.createWedding(session!.user.id, body)
        if ("error" in result) {
          if (result.error === "slug_taken")
            return status(409, { message: "Slug already taken" })
          if (result.error === "already_exists")
            return status(409, { message: "You already have a wedding" })
        }
        return new Response(JSON.stringify((result as { data: unknown }).data), {
          status: 201,
          headers: { "content-type": "application/json" },
        })
      },
      { body: createWeddingBody }
    )
    .put(
      "/wedding/:id",
      async ({ session, params, body, status }) => {
        const result = await service.updateWedding(
          session!.user.id,
          params.id,
          body
        )
        if ("error" in result) {
          if (result.error === "not_found")
            return status(404, { message: "Wedding not found" })
          if (result.error === "forbidden")
            return status(403, { message: "Forbidden" })
          if (result.error === "slug_taken")
            return status(409, { message: "Slug already taken" })
        }
        return (result as { data: unknown }).data
      },
      { params: weddingIdParams, body: updateWeddingBody }
    )
}
