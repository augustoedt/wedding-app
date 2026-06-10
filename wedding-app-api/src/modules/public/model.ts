import { t } from "elysia"

export const slugParams = t.Object({
  slug: t.String(),
})

export const rsvpTokenParams = t.Object({
  token: t.String(),
})

export const rsvpTokenBody = t.Object({
  rsvp: t.Union([t.Literal("confirmed"), t.Literal("declined")]),
})

export const giftsQuery = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1, maximum: 100, default: 20 })),
})

export const giftLockParams = t.Object({
  slug: t.String(),
  giftId: t.String(),
})

export const lockGiftBody = t.Object({
  buyerName: t.String({ minLength: 1 }),
  buyerEmail: t.String({ format: "email" }),
})
