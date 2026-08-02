import { Elysia } from "elysia"
import type { authGuard } from "../../lib/auth-guard"
import type { createGalleriesService } from "./service"
import {
  createGalleryBody,
  galleryIdParams,
  reorderGalleryBody,
  updateGalleryBody
} from "./model"

export function createGalleriesRoutes({
  service,
  guard
}: {
  service: ReturnType<typeof createGalleriesService>
  guard: typeof authGuard
}) {
  return new Elysia({ prefix: "/admin" })
    .use(guard)
    .get("/galleries", async ({ session, status }) => {
      const result = await service.listGalleries(session!.user.id)
      if ("error" in result && result.error === "no_wedding")
        return status(404, { message: "No wedding found" })
      return (result as { data: unknown }).data
    })
    .post(
      "/galleries",
      async ({ session, body, status }) => {
        const result = await service.createGallery(session!.user.id, body.title)
        if ("error" in result && result.error === "no_wedding")
          return status(404, { message: "No wedding found" })
        return new Response(
          JSON.stringify((result as { data: unknown }).data),
          {
            status: 201,
            headers: { "content-type": "application/json" }
          }
        )
      },
      { body: createGalleryBody }
    )
    .put(
      "/galleries/:id",
      async ({ session, params, body, status }) => {
        const result = await service.updateGallery(
          session!.user.id,
          params.id,
          body
        )
        if ("error" in result) {
          if (result.error === "not_found")
            return status(404, { message: "Gallery not found" })
          if (result.error === "forbidden")
            return status(403, { message: "Forbidden" })
        }
        return (result as { data: unknown }).data
      },
      { params: galleryIdParams, body: updateGalleryBody }
    )
    .delete(
      "/galleries/:id",
      async ({ session, params, status }) => {
        const result = await service.deleteGallery(session!.user.id, params.id)
        if ("error" in result) {
          if (result.error === "not_found")
            return status(404, { message: "Gallery not found" })
          if (result.error === "forbidden")
            return status(403, { message: "Forbidden" })
        }
        return new Response(null, { status: 204 })
      },
      { params: galleryIdParams }
    )
    .post(
      "/galleries/:id/reorder",
      async ({ session, params, body, status }) => {
        const result = await service.reorderGallery(
          session!.user.id,
          params.id,
          body
        )
        if ("error" in result) {
          if (result.error === "not_found")
            return status(404, { message: "Gallery not found" })
          if (result.error === "forbidden")
            return status(403, { message: "Forbidden" })
          if (result.error === "invalid_target")
            return status(422, { message: "Provide beforeId and/or afterId" })
        }
        return (result as { data: unknown }).data
      },
      { params: galleryIdParams, body: reorderGalleryBody }
    )
}
