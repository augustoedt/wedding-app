import { t } from "elysia"

export const uploadImageBody = t.Object({
  file: t.File({
    type: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxSize: "8m",
  }),
  description: t.Optional(t.String()),
})

export const imageIdParams = t.Object({
  id: t.String(),
})
