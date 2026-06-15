import { Elysia } from "elysia"
import type { authGuard } from "../../lib/auth-guard"
import type { createMessagesService } from "./service"
import { messageIdParams, setMessageVisibilityBody } from "./model"

export function createMessagesRoutes({
  service,
  guard,
}: {
  service: ReturnType<typeof createMessagesService>
  guard: typeof authGuard
}) {
  return new Elysia({ prefix: "/admin" })
    .use(guard)
    .get("/messages", async ({ session, status }) => {
      const result = await service.listMessages(session!.user.id)
      if ("error" in result && result.error === "no_wedding")
        return status(404, { message: "No wedding found" })
      return (result as { data: unknown }).data
    })
    .put(
      "/messages/:id/visibility",
      async ({ session, params, body, status }) => {
        const result = await service.setVisibility(session!.user.id, params.id, body.isVisible)
        if ("error" in result) {
          if (result.error === "not_found") return status(404, { message: "Message not found" })
          if (result.error === "forbidden") return status(403, { message: "Forbidden" })
        }
        return (result as { data: unknown }).data
      },
      { params: messageIdParams, body: setMessageVisibilityBody }
    )
}
