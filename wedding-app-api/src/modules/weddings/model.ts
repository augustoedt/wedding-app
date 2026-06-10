import { t } from "elysia"

export const createWeddingBody = t.Object({
  title: t.String({ minLength: 1 }),
  slug: t.String({ minLength: 1, pattern: "^[a-z0-9-]+$" }),
  siteUrl: t.Optional(t.String()),
  inviteMessage: t.Optional(t.String()),
  date: t.Optional(t.String()),
  description: t.Optional(t.String()),
  coverImage: t.Optional(t.String()),
})

export const updateWeddingBody = t.Object({
  title: t.Optional(t.String({ minLength: 1 })),
  slug: t.Optional(t.String({ minLength: 1, pattern: "^[a-z0-9-]+$" })),
  siteUrl: t.Optional(t.Nullable(t.String())),
  inviteMessage: t.Optional(t.Nullable(t.String())),
  date: t.Optional(t.Nullable(t.String())),
  description: t.Optional(t.Nullable(t.String())),
  coverImage: t.Optional(t.Nullable(t.String())),
  isPublished: t.Optional(t.Boolean()),
})

export const weddingIdParams = t.Object({
  id: t.String(),
})
