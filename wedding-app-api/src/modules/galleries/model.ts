import { t } from "elysia"

export const createGalleryBody = t.Object({
  title: t.String({ minLength: 1 })
})

export const updateGalleryBody = t.Object({
  title: t.Optional(t.String({ minLength: 1 }))
})

export const galleryIdParams = t.Object({
  id: t.String()
})

export const reorderGalleryBody = t.Object({
  beforeId: t.Optional(t.String()),
  afterId: t.Optional(t.String())
})
