CREATE TABLE "guest_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"wedding_id" text NOT NULL,
	"payment_id" text NOT NULL,
	"sender_name" text NOT NULL,
	"message" text NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gift_payments" ADD COLUMN "message" text;--> statement-breakpoint
ALTER TABLE "guest_messages" ADD CONSTRAINT "guest_messages_wedding_id_weddings_id_fk" FOREIGN KEY ("wedding_id") REFERENCES "public"."weddings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_messages" ADD CONSTRAINT "guest_messages_payment_id_gift_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."gift_payments"("id") ON DELETE cascade ON UPDATE no action;