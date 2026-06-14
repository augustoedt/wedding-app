import { t } from "elysia"

export const createWeddingBody = t.Object({
  title: t.String({ minLength: 1 }),
  slug: t.String({ minLength: 1, pattern: "^[a-z0-9-]+$" }),
  siteUrl: t.Optional(t.String()),
  inviteMessage: t.Optional(t.String()),
  date: t.Optional(t.String()),
  description: t.Optional(t.String()),
  coverImage: t.Optional(t.String()),
  venueName: t.Optional(t.String()),
  venueCep: t.Optional(t.String()),
  venueAddress: t.Optional(t.String()),
  venueNumber: t.Optional(t.String()),
  venueNeighborhood: t.Optional(t.String()),
  venueCity: t.Optional(t.String()),
  venueState: t.Optional(t.String()),
  venueTime: t.Optional(t.String()),
  venueImage: t.Optional(t.String()),
  dressCodeGuests: t.Optional(t.String()),
  dressCodeGroomsmen: t.Optional(t.String()),
  ogImage: t.Optional(t.String()),
})

export const updateWeddingBody = t.Object({
  title: t.Optional(t.String({ minLength: 1 })),
  slug: t.Optional(t.String({ minLength: 1, pattern: "^[a-z0-9-]+$" })),
  siteUrl: t.Optional(t.Nullable(t.String())),
  inviteMessage: t.Optional(t.Nullable(t.String())),
  date: t.Optional(t.Nullable(t.String())),
  description: t.Optional(t.Nullable(t.String())),
  coverImage: t.Optional(t.Nullable(t.String())),
  venueName: t.Optional(t.Nullable(t.String())),
  venueCep: t.Optional(t.Nullable(t.String())),
  venueAddress: t.Optional(t.Nullable(t.String())),
  venueNumber: t.Optional(t.Nullable(t.String())),
  venueNeighborhood: t.Optional(t.Nullable(t.String())),
  venueCity: t.Optional(t.Nullable(t.String())),
  venueState: t.Optional(t.Nullable(t.String())),
  venueTime: t.Optional(t.Nullable(t.String())),
  venueImage: t.Optional(t.Nullable(t.String())),
  dressCodeGuests: t.Optional(t.Nullable(t.String())),
  dressCodeGroomsmen: t.Optional(t.Nullable(t.String())),
  ogImage: t.Optional(t.Nullable(t.String())),
  isPublished: t.Optional(t.Boolean()),
})

export const weddingIdParams = t.Object({
  id: t.String(),
})
