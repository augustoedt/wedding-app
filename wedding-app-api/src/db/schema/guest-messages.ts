import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { giftPayments } from "./gift-payments"
import { weddings } from "./weddings"

export const guestMessages = pgTable("guest_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weddingId: text("wedding_id")
    .notNull()
    .references(() => weddings.id, { onDelete: "cascade" }),
  paymentId: text("payment_id")
    .notNull()
    .references(() => giftPayments.id, { onDelete: "cascade" }),
  senderName: text("sender_name").notNull(),
  message: text("message").notNull(),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
