import { beforeAll, afterAll, beforeEach, describe, expect, it } from "bun:test"
import { Elysia } from "elysia"
import { eq } from "drizzle-orm"
import { authGuard } from "../src/lib/auth-guard"
import { guests, gifts, user, weddings } from "../src/db/schema"
import { createGiftsRoutes } from "../src/modules/gifts"
import { createGiftsService } from "../src/modules/gifts/service"
import { createGuestsRoutes } from "../src/modules/guests"
import { createGuestsService } from "../src/modules/guests/service"
import { createPublicRoutes } from "../src/modules/public"
import { createPublicService } from "../src/modules/public/service"
import { createWeddingsRoutes } from "../src/modules/weddings"
import { createWeddingsService } from "../src/modules/weddings/service"
import {
  closeTestDatabase,
  resetTestDatabase,
  setupTestDatabase,
  testDb,
} from "./helpers/test-db"

const now = new Date()
let integrationDbAvailable = false

function createAuthenticatedGuard(userId: string) {
  return new Elysia({ name: "test-auth-guard" }).derive({ as: "scoped" }, () => ({
    session: {
      user: {
        id: userId,
      },
    },
  }))
}

function jsonRequest(url: string, method: string, body: unknown) {
  return new Request(url, {
    method,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  })
}

async function seedUser(id: string) {
  await testDb.insert(user).values({
    id,
    name: `User ${id}`,
    email: `${id}@example.com`,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  })
}

async function seedWedding({
  id,
  userId,
  slug,
  published = false,
}: {
  id: string
  userId: string
  slug: string
  published?: boolean
}) {
  await testDb.insert(weddings).values({
    id,
    userId,
    title: `Wedding ${id}`,
    slug,
    date: null,
    description: null,
    coverImage: null,
    isPublished: published,
    createdAt: now,
    updatedAt: now,
  })
}

async function seedGift({
  id,
  weddingId,
  active = true,
}: {
  id: string
  weddingId: string
  active?: boolean
}) {
  await testDb.insert(gifts).values({
    id,
    weddingId,
    name: `Gift ${id}`,
    description: null,
    price: 1000,
    imageUrl: null,
    paymentType: null,
    paymentValue: null,
    isActive: active,
    createdAt: now,
    updatedAt: now,
  })
}

beforeAll(async () => {
  try {
    await setupTestDatabase()
    integrationDbAvailable = true
  } catch (error) {
    console.warn(
      "Skipping db.integration.test.ts because test database is unavailable:",
      error
    )
  }
})

beforeEach(async () => {
  if (!integrationDbAvailable) return
  await resetTestDatabase()
})

afterAll(async () => {
  if (!integrationDbAvailable) return
  await closeTestDatabase()
})

describe("service integration", () => {
  it("weddings service returns slug_taken for duplicated slug", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedUser("u-2")
    await seedWedding({ id: "w-existing", userId: "u-2", slug: "same-slug" })

    const service = createWeddingsService(testDb)
    const result = await service.createWedding("u-1", {
      title: "My wedding",
      slug: "same-slug",
    })

    expect(result).toEqual({ error: "slug_taken" })
  })

  it("gifts service blocks update by non-owner", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-owner")
    await seedUser("u-other")
    await seedWedding({ id: "w-1", userId: "u-owner", slug: "owner-slug" })
    await seedGift({ id: "g-1", weddingId: "w-1" })

    const service = createGiftsService(testDb)
    const result = await service.updateGift("u-other", "g-1", { name: "new" })

    expect(result).toEqual({ error: "forbidden" })
  })

  it("gifts service stores paymentType and paymentValue", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-1" })

    const service = createGiftsService(testDb)
    const result = await service.createGift("u-1", {
      name: "Churraqueira",
      price: 80000,
      paymentType: "pix",
      paymentValue: "contato@email.com",
    })

    expect("data" in result && result.data.paymentType).toBe("pix")
    expect("data" in result && result.data.paymentValue).toBe("contato@email.com")
  })
})

describe("routes integration", () => {
  it("creates and reads wedding via admin routes", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-admin")

    const app = new Elysia().use(
      createWeddingsRoutes({
        service: createWeddingsService(testDb),
        guard: createAuthenticatedGuard("u-admin") as unknown as typeof authGuard,
      })
    )

    const createResponse = await app.handle(
      jsonRequest("http://localhost/admin/wedding", "POST", {
        title: "Casamento",
        slug: "casamento-admin",
      })
    )

    expect(createResponse.status).toBe(201)

    const meResponse = await app.handle(new Request("http://localhost/admin/wedding/me"))
    expect(meResponse.status).toBe(200)

    const payload = await meResponse.json()
    expect(payload.slug).toBe("casamento-admin")
  })

  it("returns 409 when slug is already taken", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedUser("u-2")
    await seedWedding({ id: "w-existing", userId: "u-2", slug: "slug-ocupado" })

    const guard = createAuthenticatedGuard("u-1") as unknown as typeof authGuard
    const app = new Elysia().use(
      createWeddingsRoutes({ service: createWeddingsService(testDb), guard })
    )

    const res = await app.handle(
      jsonRequest("http://localhost/admin/wedding", "POST", {
        title: "Outro Casamento",
        slug: "slug-ocupado",
      })
    )
    expect(res.status).toBe(409)
  })

  it("returns 409 when user already has a wedding", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "meu-slug" })

    const guard = createAuthenticatedGuard("u-1") as unknown as typeof authGuard
    const app = new Elysia().use(
      createWeddingsRoutes({ service: createWeddingsService(testDb), guard })
    )

    const res = await app.handle(
      jsonRequest("http://localhost/admin/wedding", "POST", {
        title: "Segundo Casamento",
        slug: "outro-slug",
      })
    )
    expect(res.status).toBe(409)
  })

  it("updates wedding fields via PUT /admin/wedding/:id", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-original" })

    const guard = createAuthenticatedGuard("u-1") as unknown as typeof authGuard
    const app = new Elysia().use(
      createWeddingsRoutes({ service: createWeddingsService(testDb), guard })
    )

    const res = await app.handle(
      jsonRequest("http://localhost/admin/wedding/w-1", "PUT", {
        title: "Título Atualizado",
        isPublished: true,
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe("Título Atualizado")
    expect(body.isPublished).toBe(true)
  })

  it("returns 403 when user tries to update another user's wedding", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-owner")
    await seedUser("u-other")
    await seedWedding({ id: "w-1", userId: "u-owner", slug: "owner-slug" })

    const guard = createAuthenticatedGuard("u-other") as unknown as typeof authGuard
    const app = new Elysia().use(
      createWeddingsRoutes({ service: createWeddingsService(testDb), guard })
    )

    const res = await app.handle(
      jsonRequest("http://localhost/admin/wedding/w-1", "PUT", { title: "Invasão" })
    )
    expect(res.status).toBe(403)
  })

  it("lists gifts for authenticated owner", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "w-1-slug" })
    await seedGift({ id: "g-1", weddingId: "w-1" })

    const guard = createAuthenticatedGuard("u-1") as unknown as typeof authGuard
    const app = new Elysia().use(createGiftsRoutes({ service: createGiftsService(testDb), guard }))

    const giftsResponse = await app.handle(new Request("http://localhost/admin/gifts"))
    expect(giftsResponse.status).toBe(200)
    const giftsPayload = await giftsResponse.json()
    expect(giftsPayload).toHaveLength(1)
  })

  it("creates gift with paymentType and paymentValue via admin routes", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "w-1-slug" })

    const guard = createAuthenticatedGuard("u-1") as unknown as typeof authGuard
    const app = new Elysia().use(createGiftsRoutes({ service: createGiftsService(testDb), guard }))

    const res = await app.handle(
      jsonRequest("http://localhost/admin/gifts", "POST", {
        name: "Fritadeira",
        price: 45000,
        paymentType: "url",
        paymentValue: "https://loja.com/fritadeira",
      })
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.paymentType).toBe("url")
    expect(body.paymentValue).toBe("https://loja.com/fritadeira")
  })

  it("handles public wedding and RSVP flow", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-public")
    await seedWedding({ id: "w-public", userId: "u-public", slug: "public-slug", published: true })

    const app = new Elysia().use(
      createPublicRoutes({
        service: createPublicService(testDb),
        guestsService: createGuestsService(testDb),
      })
    )

    const weddingResponse = await app.handle(
      new Request("http://localhost/public/weddings/public-slug")
    )
    expect(weddingResponse.status).toBe(200)

    const rsvpResponse = await app.handle(
      jsonRequest("http://localhost/public/weddings/public-slug/rsvp", "POST", {
        name: "Guest",
        rsvp: "confirmed",
      })
    )

    expect(rsvpResponse.status).toBe(201)

    const guestsRows = await testDb
      .select()
      .from(guests)
      .where(eq(guests.weddingId, "w-public"))

    expect(guestsRows).toHaveLength(1)
    expect(guestsRows[0]?.name).toBe("Guest")
  })

  it("returns unpublished wedding as 404 on public route", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "privado", published: false })

    const app = new Elysia().use(
      createPublicRoutes({
        service: createPublicService(testDb),
        guestsService: createGuestsService(testDb),
      })
    )

    const res = await app.handle(new Request("http://localhost/public/weddings/privado"))
    expect(res.status).toBe(404)
  })

  it("confirms rsvp via token", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-1" })

    const guestsService = createGuestsService(testDb)
    const createResult = await guestsService.createGuest("u-1", { name: "Maria" })
    const guest = "data" in createResult ? createResult.data : null
    if (!guest) throw new Error("Expected guest data")

    const app = new Elysia().use(
      createPublicRoutes({
        service: createPublicService(testDb),
        guestsService,
      })
    )

    const res = await app.handle(
      jsonRequest(`http://localhost/public/rsvp/${guest.rsvpToken}`, "POST", {
        rsvp: "confirmed",
      })
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.rsvp).toBe("confirmed")
  })
})
