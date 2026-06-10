import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { weddings } from "./weddings"

export const gifts = pgTable("gifts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weddingId: text("wedding_id")
    .notNull()
    .references(() => weddings.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  paymentType: text("payment_type"),
  paymentValue: text("payment_value"),
  isActive: boolean("is_active").notNull().default(true),
  lockedAt: timestamp("locked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
