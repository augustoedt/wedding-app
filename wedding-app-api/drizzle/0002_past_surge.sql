ALTER TABLE "guests" ADD COLUMN "invite_sent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "weddings" ADD COLUMN "invite_message" text;