import { Elysia } from "elysia"
import { auth } from "./auth"

export const authGuard = new Elysia({ name: "auth-guard" })
  .derive({ as: "scoped" }, async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    return { session }
  })
  .onBeforeHandle({ as: "scoped" }, ({ session, status }) => {
    if (!session) return status(401, { message: "Unauthorized" })
  })
