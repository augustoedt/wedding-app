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
  venueName: text("venue_name"),
  venueCep: text("venue_cep"),
  venueAddress: text("venue_address"),
  venueNumber: text("venue_number"),
  venueNeighborhood: text("venue_neighborhood"),
  venueCity: text("venue_city"),
  venueState: text("venue_state"),
  venueTime: text("venue_time"),
  venueImage: text("venue_image"),
  dressCodeGuests: text("dress_code_guests"),
  dressCodeGroomsmen: text("dress_code_groomsmen"),
  ogImage: text("og_image"),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})
