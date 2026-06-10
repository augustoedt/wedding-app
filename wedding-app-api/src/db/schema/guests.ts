import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { weddings } from "./weddings"

export const guests = pgTable("guests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  weddingId: text("wedding_id")
    .notNull()
    .references(() => weddings.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  rsvp: text("rsvp").notNull().default("pending"),
  plusOne: integer("plus_one").notNull().default(0),
  inviteSent: boolean("invite_sent").notNull().default(false),
  rsvpToken: text("rsvp_token").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
