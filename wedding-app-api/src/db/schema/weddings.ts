import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { user } from "./auth"

export const weddings = pgTable("weddings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  date: text("date"),
  description: text("description"),
  coverImage: text("cover_image"),
  siteUrl: text("site_url"),
  inviteMessage: text("invite_message"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
