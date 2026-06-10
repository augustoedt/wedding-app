import { t } from "elysia"

export const paymentsQueryParams = t.Object({
  status: t.Optional(t.String()),
  giftId: t.Optional(t.String()),
})

export const paymentIdParams = t.Object({
  id: t.String(),
})
