import { t } from "elysia"

export const messageIdParams = t.Object({
  id: t.String(),
})

export const setMessageVisibilityBody = t.Object({
  isVisible: t.Boolean(),
})
