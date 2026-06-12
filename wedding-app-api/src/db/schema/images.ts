import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { weddings } from "./weddings"

export const images = pgTable("images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weddingId: text("wedding_id")
    .notNull()
    .references(() => weddings.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
