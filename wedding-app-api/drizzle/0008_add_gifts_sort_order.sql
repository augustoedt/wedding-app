ALTER TABLE "gifts" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
UPDATE "gifts" AS g
SET "sort_order" = ranked.rn * 1000
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "wedding_id" ORDER BY "created_at", "id") AS rn
  FROM "gifts"
) AS ranked
WHERE g."id" = ranked."id";