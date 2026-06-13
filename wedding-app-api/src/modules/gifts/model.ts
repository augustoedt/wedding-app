import { t } from "elysia"

const paymentType = t.Union([t.Literal("url"), t.Literal("pix")])

export const giftStatus = t.Union([
  t.Literal("available"),
  t.Literal("locked"),
  t.Literal("purchased"),
])

export const createGiftBody = t.Object({
  name: t.String({ minLength: 1 }),
  description: t.Optional(t.String()),
  price: t.Integer({ minimum: 1 }),
  imageUrl: t.Optional(t.String()),
  paymentType: t.Optional(paymentType),
  paymentValue: t.Optional(t.String({ minLength: 1 })),
})

export const updateGiftBody = t.Object({
  name: t.Optional(t.String({ minLength: 1 })),
  description: t.Optional(t.Nullable(t.String())),
  price: t.Optional(t.Integer({ minimum: 1 })),
  imageUrl: t.Optional(t.Nullable(t.String())),
  paymentType: t.Optional(t.Nullable(paymentType)),
  paymentValue: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
  isActive: t.Optional(t.Boolean()),
  status: t.Optional(giftStatus),
})

export const giftIdParams = t.Object({
  id: t.String(),
})
