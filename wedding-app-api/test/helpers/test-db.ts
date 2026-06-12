import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "../../src/db/schema"

const testDatabaseUrl =
  process.env.DATABASE_TEST_URL ??
  "postgresql://user:password@localhost:5432/wedding_app_test"

const sql = postgres(testDatabaseUrl, {
  max: 1,
  onnotice: () => {},
})

export const testDb = drizzle(sql, { schema })

async function runMigrations() {
  const migrationsDir = path.resolve(import.meta.dir, "../../drizzle")
  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort()

  for (const file of files) {
    const migrationPath = path.join(migrationsDir, file)
    const content = await readFile(migrationPath, "utf-8")
    const statements = content
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean)

    for (const statement of statements) {
      await sql.unsafe(statement)
    }
  }
}

export async function setupTestDatabase() {
  await sql.unsafe("DROP SCHEMA IF EXISTS public CASCADE;")
  await sql.unsafe("CREATE SCHEMA public;")

  await runMigrations()
}

export async function resetTestDatabase() {
  await sql.unsafe(`
    TRUNCATE TABLE
      "images",
      "gifts",
      "guests",
      "weddings",
      "account",
      "session",
      "verification",
      "user"
    RESTART IDENTITY CASCADE;
  `)
}

export async function closeTestDatabase() {
  await sql.end()
}
