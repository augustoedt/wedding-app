import { t } from "elysia"

export const createGuestBody = t.Object({
  name: t.String({ minLength: 1 }),
  email: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  plusOne: t.Optional(t.Integer({ minimum: 0 })),
})

export const updateGuestBody = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  email: t.Optional(t.Nullable(t.String())),
  phone: t.Optional(t.Nullable(t.String())),
  rsvp: t.Optional(t.Union([t.Literal("pending"), t.Literal("confirmed"), t.Literal("declined")])),
  plusOne: t.Optional(t.Integer({ minimum: 0 })),
  inviteSent: t.Optional(t.Boolean()),
})

export const guestIdParams = t.Object({
  id: t.String(),
})
