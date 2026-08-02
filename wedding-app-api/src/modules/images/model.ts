import { t } from "elysia"

export const uploadImageBody = t.Object({
  file: t.File({
    type: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxSize: "8m"
  }),
  description: t.Optional(t.String()),
  galleryId: t.Optional(t.String())
})

export const updateImageBody = t.Object({
  description: t.Optional(t.Nullable(t.String())),
  galleryId: t.Optional(t.Nullable(t.String()))
})

export const reorderImageBody = t.Object({
  beforeId: t.Optional(t.String()),
  afterId: t.Optional(t.String())
})

export const imageIdParams = t.Object({
  id: t.String()
})
