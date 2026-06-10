import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { gifts } from "./gifts"
import { weddings } from "./weddings"

export const giftPayments = pgTable("gift_payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  giftId: text("gift_id")
    .notNull()
    .references(() => gifts.id, { onDelete: "restrict" }),
  weddingId: text("wedding_id")
    .notNull()
    .references(() => weddings.id, { onDelete: "restrict" }),
  buyerName: text("buyer_name").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  mercadoPagoId: text("mercado_pago_id"),
  mercadoPagoPreferenceId: text("mercado_pago_preference_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
