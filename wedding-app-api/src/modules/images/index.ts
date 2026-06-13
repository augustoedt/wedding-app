import { Elysia } from "elysia"
import type { authGuard } from "../../lib/auth-guard"
import type { createImagesService } from "./service"
import { imageIdParams, uploadImageBody } from "./model"

export function createImagesRoutes({
  service,
  guard,
}: {
  service: ReturnType<typeof createImagesService>
  guard: typeof authGuard
}) {
  return new Elysia({ prefix: "/admin" })
    .use(guard)
    .get("/images", async ({ session, status }) => {
      const result = await service.list(session!.user.id)
      if ("error" in result && result.error === "no_wedding")
        return status(404, { message: "No wedding found" })
      return (result as { data: unknown }).data
    })
    .post(
      "/images",
      async ({ session, body, status }) => {
        console.log(
          `[images] upload start: user=${session!.user.id} file=${body.file.name} size=${body.file.size} type=${body.file.type}`
        )
        const result = await service.upload(session!.user.id, body.file, body.description)
        if ("error" in result && result.error === "no_wedding")
          return status(404, { message: "No wedding found" })
        console.log(`[images] upload done: id=${(result as { data: { id: string } }).data.id}`)
        return new Response(JSON.stringify((result as { data: unknown }).data), {
          status: 201,
          headers: { "content-type": "application/json" },
        })
      },
      { body: uploadImageBody }
    )
    .delete(
      "/images/:id",
      async ({ session, params, status }) => {
        const result = await service.delete(session!.user.id, params.id)
        if ("error" in result) {
          if (result.error === "not_found") return status(404, { message: "Image not found" })
          if (result.error === "forbidden") return status(403, { message: "Forbidden" })
        }
        return new Response(null, { status: 204 })
      },
      { params: imageIdParams }
    )
}
