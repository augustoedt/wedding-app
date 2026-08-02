import { beforeAll, afterAll, beforeEach, describe, expect, it } from "bun:test"
import { Elysia } from "elysia"
import { eq } from "drizzle-orm"
import { authGuard } from "../src/lib/auth-guard"
import {
  giftPayments,
  guestMessages,
  guests,
  gifts,
  user,
  weddings,
} from "../src/db/schema"
import { createGiftsRoutes } from "../src/modules/gifts"
import { createGiftsService } from "../src/modules/gifts/service"
import { createGuestsRoutes } from "../src/modules/guests"
import { createGuestsService } from "../src/modules/guests/service"
import { createMessagesRoutes } from "../src/modules/messages"
import { createMessagesService } from "../src/modules/messages/service"
import { createPaymentsRoutes } from "../src/modules/payments"
import { createPaymentsService } from "../src/modules/payments/service"
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
  return new Elysia({ name: "test-auth-guard" }).derive(
    { as: "scoped" },
    () => ({
      session: {
        user: {
          id: userId,
        },
      },
    }),
  )
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
  lockedAt = null,
}: {
  id: string
  weddingId: string
  active?: boolean
  lockedAt?: Date | null
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
    lockedAt,
    createdAt: now,
    updatedAt: now,
  })
}

async function seedGiftPayment({
  id,
  giftId,
  weddingId,
  status = "pending_confirmation",
  message,
}: {
  id: string
  giftId: string
  weddingId: string
  status?: string
  message?: string
}) {
  await testDb.insert(giftPayments).values({
    id,
    giftId,
    weddingId,
    buyerName: "Buyer",
    buyerEmail: "buyer@example.com",
    amount: 1000,
    status,
    message,
    createdAt: now,
    updatedAt: now,
  })
}

async function seedGuestMessage({
  id,
  weddingId,
  paymentId,
  senderName = "Buyer",
  message = "Parabéns!",
  isVisible = true,
}: {
  id: string
  weddingId: string
  paymentId: string
  senderName?: string
  message?: string
  isVisible?: boolean
}) {
  await testDb.insert(guestMessages).values({
    id,
    weddingId,
    paymentId,
    senderName,
    message,
    isVisible,
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
      error,
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
    expect("data" in result && result.data.paymentValue).toBe(
      "contato@email.com",
    )
  })

  it("gifts service marks a gift as purchased via status update", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-1" })
    await seedGift({ id: "g-1", weddingId: "w-1", active: true })

    const service = createGiftsService(testDb)
    const result = await service.updateGift("u-1", "g-1", {
      status: "purchased",
    })

    expect("data" in result && result.data?.isActive).toBe(false)
    expect("data" in result && result.data?.lockedAt).toBeNull()
  })

  it("gifts service unlocks a gift and expires its pending payment", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-1" })
    await seedGift({
      id: "g-1",
      weddingId: "w-1",
      active: false,
      lockedAt: now,
    })
    await seedGiftPayment({ id: "p-1", giftId: "g-1", weddingId: "w-1" })

    const service = createGiftsService(testDb)
    const result = await service.updateGift("u-1", "g-1", {
      status: "available",
    })

    expect("data" in result && result.data?.isActive).toBe(true)
    expect("data" in result && result.data?.lockedAt).toBeNull()

    const [payment] = await testDb
      .select()
      .from(giftPayments)
      .where(eq(giftPayments.id, "p-1"))
    expect(payment?.status).toBe("expired")
  })

  it("gifts service assigns increasing sortOrder 1000 apart to new gifts", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-sort" })

    const service = createGiftsService(testDb)
    const first = await service.createGift("u-1", {
      name: "Primeiro",
      price: 1000,
    })
    const second = await service.createGift("u-1", {
      name: "Segundo",
      price: 1000,
    })
    const third = await service.createGift("u-1", {
      name: "Terceiro",
      price: 1000,
    })

    expect("data" in first && first.data?.sortOrder).toBe(1000)
    expect("data" in second && second.data?.sortOrder).toBe(2000)
    expect("data" in third && third.data?.sortOrder).toBe(3000)

    const list = await service.listGifts("u-1")
    expect("data" in list && list.data?.map((g) => g.name)).toEqual([
      "Primeiro",
      "Segundo",
      "Terceiro",
    ])
  })

  it("gifts service keeps sortOrder independent per wedding", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedUser("u-2")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-sort-a" })
    await seedWedding({ id: "w-2", userId: "u-2", slug: "slug-sort-b" })

    const serviceA = createGiftsService(testDb)
    const first = await serviceA.createGift("u-1", { name: "A1", price: 1000 })
    const serviceB = createGiftsService(testDb)
    const other = await serviceB.createGift("u-2", { name: "B1", price: 1000 })

    expect("data" in first && first.data?.sortOrder).toBe(1000)
    expect("data" in other && other.data?.sortOrder).toBe(1000)
  })

  it("gifts service moves a gift between two others via beforeId/afterId", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-reorder" })

    const service = createGiftsService(testDb)
    const first = await service.createGift("u-1", {
      name: "Primeiro",
      price: 1000,
    })
    const second = await service.createGift("u-1", {
      name: "Segundo",
      price: 1000,
    })
    const third = await service.createGift("u-1", {
      name: "Terceiro",
      price: 1000,
    })
    const firstId = "data" in first && first.data ? first.data.id : ""
    const secondId = "data" in second && second.data ? second.data.id : ""
    const thirdId = "data" in third && third.data ? third.data.id : ""

    // Move "Terceiro" between "Primeiro" and "Segundo".
    const moved = await service.reorderGift("u-1", thirdId, {
      afterId: firstId,
      beforeId: secondId,
    })
    expect("data" in moved && moved.data?.map((g) => g.name)).toEqual([
      "Primeiro",
      "Terceiro",
      "Segundo",
    ])
  })

  it("gifts service moves a gift to the start and end of the list", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-reorder-edges" })

    const service = createGiftsService(testDb)
    const first = await service.createGift("u-1", {
      name: "Primeiro",
      price: 1000,
    })
    const second = await service.createGift("u-1", {
      name: "Segundo",
      price: 1000,
    })
    const secondId = "data" in second && second.data ? second.data.id : ""
    const firstId = "data" in first && first.data ? first.data.id : ""

    const toStart = await service.reorderGift("u-1", secondId, {
      afterId: firstId,
    })
    expect("data" in toStart && toStart.data?.map((g) => g.name)).toEqual([
      "Segundo",
      "Primeiro",
    ])

    const toEnd = await service.reorderGift("u-1", secondId, {
      beforeId: firstId,
    })
    expect("data" in toEnd && toEnd.data?.map((g) => g.name)).toEqual([
      "Primeiro",
      "Segundo",
    ])
  })

  it("gifts service renumbers when there is no room between neighbors", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({
      id: "w-1",
      userId: "u-1",
      slug: "slug-reorder-renumber",
    })
    await seedGift({ id: "g-a", weddingId: "w-1" })
    await seedGift({ id: "g-b", weddingId: "w-1" })
    await seedGift({ id: "g-c", weddingId: "w-1" })

    await testDb
      .update(gifts)
      .set({ sortOrder: 1000 })
      .where(eq(gifts.id, "g-a"))
    await testDb
      .update(gifts)
      .set({ sortOrder: 1001 })
      .where(eq(gifts.id, "g-b"))
    await testDb
      .update(gifts)
      .set({ sortOrder: 2000 })
      .where(eq(gifts.id, "g-c"))

    const service = createGiftsService(testDb)
    const result = await service.reorderGift("u-1", "g-c", {
      afterId: "g-a",
      beforeId: "g-b",
    })

    expect("data" in result && result.data?.map((g) => g.id)).toEqual([
      "g-a",
      "g-c",
      "g-b",
    ])

    const rows = await testDb
      .select()
      .from(gifts)
      .where(eq(gifts.weddingId, "w-1"))
    const sortOrders = rows.map((g) => g.sortOrder)
    expect(new Set(sortOrders).size).toBe(3)
  })

  it("gifts service blocks reorder by non-owner", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-owner")
    await seedUser("u-other")
    await seedWedding({
      id: "w-1",
      userId: "u-owner",
      slug: "slug-reorder-forbidden",
    })
    await seedGift({ id: "g-1", weddingId: "w-1" })
    await seedGift({ id: "g-2", weddingId: "w-1" })

    const service = createGiftsService(testDb)
    const result = await service.reorderGift("u-other", "g-1", {
      afterId: "g-2",
    })

    expect(result).toEqual({ error: "forbidden" })
  })

  it("gifts service blocks reorder against a gift from another wedding", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedUser("u-2")
    await seedWedding({
      id: "w-1",
      userId: "u-1",
      slug: "slug-reorder-cross-a",
    })
    await seedWedding({
      id: "w-2",
      userId: "u-2",
      slug: "slug-reorder-cross-b",
    })
    await seedGift({ id: "g-mine", weddingId: "w-1" })
    await seedGift({ id: "g-other", weddingId: "w-2" })

    const service = createGiftsService(testDb)
    const result = await service.reorderGift("u-1", "g-mine", {
      afterId: "g-other",
    })

    expect(result).toEqual({ error: "forbidden" })
  })
})

describe("routes integration", () => {
  it("creates and reads wedding via admin routes", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-admin")

    const app = new Elysia().use(
      createWeddingsRoutes({
        service: createWeddingsService(testDb),
        guard: createAuthenticatedGuard(
          "u-admin",
        ) as unknown as typeof authGuard,
      }),
    )

    const createResponse = await app.handle(
      jsonRequest("http://localhost/admin/wedding", "POST", {
        title: "Casamento",
        slug: "casamento-admin",
      }),
    )

    expect(createResponse.status).toBe(201)

    const meResponse = await app.handle(
      new Request("http://localhost/admin/wedding/me"),
    )
    expect(meResponse.status).toBe(200)

    const payload = await meResponse.json()
    expect(payload.slug).toBe("casamento-admin")
  })

  it("returns 409 when slug is already taken", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedUser("u-2")
    await seedWedding({
      id: "w-existing",
      userId: "u-2",
      slug: "slug-ocupado",
    })

    const guard = createAuthenticatedGuard("u-1") as unknown as typeof authGuard
    const app = new Elysia().use(
      createWeddingsRoutes({ service: createWeddingsService(testDb), guard }),
    )

    const res = await app.handle(
      jsonRequest("http://localhost/admin/wedding", "POST", {
        title: "Outro Casamento",
        slug: "slug-ocupado",
      }),
    )
    expect(res.status).toBe(409)
  })

  it("returns 409 when user already has a wedding", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "meu-slug" })

    const guard = createAuthenticatedGuard("u-1") as unknown as typeof authGuard
    const app = new Elysia().use(
      createWeddingsRoutes({ service: createWeddingsService(testDb), guard }),
    )

    const res = await app.handle(
      jsonRequest("http://localhost/admin/wedding", "POST", {
        title: "Segundo Casamento",
        slug: "outro-slug",
      }),
    )
    expect(res.status).toBe(409)
  })

  it("updates wedding fields via PUT /admin/wedding/:id", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-original" })

    const guard = createAuthenticatedGuard("u-1") as unknown as typeof authGuard
    const app = new Elysia().use(
      createWeddingsRoutes({ service: createWeddingsService(testDb), guard }),
    )

    const res = await app.handle(
      jsonRequest("http://localhost/admin/wedding/w-1", "PUT", {
        title: "Título Atualizado",
        isPublished: true,
        venueName: "Espaço Jardim",
        venueCep: "01310-100",
        dressCodeGuests: "Traje social esporte fino",
        ogImage: "https://example.com/og.jpg",
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.title).toBe("Título Atualizado")
    expect(body.isPublished).toBe(true)
    expect(body.venueName).toBe("Espaço Jardim")
    expect(body.venueCep).toBe("01310-100")
    expect(body.dressCodeGuests).toBe("Traje social esporte fino")
    expect(body.ogImage).toBe("https://example.com/og.jpg")
  })

  it("returns 403 when user tries to update another user's wedding", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-owner")
    await seedUser("u-other")
    await seedWedding({ id: "w-1", userId: "u-owner", slug: "owner-slug" })

    const guard = createAuthenticatedGuard(
      "u-other",
    ) as unknown as typeof authGuard
    const app = new Elysia().use(
      createWeddingsRoutes({ service: createWeddingsService(testDb), guard }),
    )

    const res = await app.handle(
      jsonRequest("http://localhost/admin/wedding/w-1", "PUT", {
        title: "Invasão",
      }),
    )
    expect(res.status).toBe(403)
  })

  it("lists gifts for authenticated owner", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "w-1-slug" })
    await seedGift({ id: "g-1", weddingId: "w-1" })

    const guard = createAuthenticatedGuard("u-1") as unknown as typeof authGuard
    const app = new Elysia().use(
      createGiftsRoutes({ service: createGiftsService(testDb), guard }),
    )

    const giftsResponse = await app.handle(
      new Request("http://localhost/admin/gifts"),
    )
    expect(giftsResponse.status).toBe(200)
    const giftsPayload = await giftsResponse.json()
    expect(giftsPayload).toHaveLength(1)
  })

  it("creates gift with paymentType and paymentValue via admin routes", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "w-1-slug" })

    const guard = createAuthenticatedGuard("u-1") as unknown as typeof authGuard
    const app = new Elysia().use(
      createGiftsRoutes({ service: createGiftsService(testDb), guard }),
    )

    const res = await app.handle(
      jsonRequest("http://localhost/admin/gifts", "POST", {
        name: "Fritadeira",
        price: 45000,
        paymentType: "url",
        paymentValue: "https://loja.com/fritadeira",
      }),
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.paymentType).toBe("url")
    expect(body.paymentValue).toBe("https://loja.com/fritadeira")
  })

  it("handles public wedding and RSVP flow", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-public")
    await seedWedding({
      id: "w-public",
      userId: "u-public",
      slug: "public-slug",
      published: true,
    })

    const app = new Elysia().use(
      createPublicRoutes({
        service: createPublicService(testDb),
        guestsService: createGuestsService(testDb),
      }),
    )

    const weddingResponse = await app.handle(
      new Request("http://localhost/public/weddings/public-slug"),
    )
    expect(weddingResponse.status).toBe(200)
    const weddingBody = await weddingResponse.json()
    expect(weddingBody.venueName).toBeNull()
    expect(weddingBody.dressCodeGuests).toBeNull()
    expect(weddingBody.ogImage).toBeNull()

    const rsvpResponse = await app.handle(
      jsonRequest("http://localhost/public/weddings/public-slug/rsvp", "POST", {
        name: "Guest",
        rsvp: "confirmed",
      }),
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
    await seedWedding({
      id: "w-1",
      userId: "u-1",
      slug: "privado",
      published: false,
    })

    const app = new Elysia().use(
      createPublicRoutes({
        service: createPublicService(testDb),
        guestsService: createGuestsService(testDb),
      }),
    )

    const res = await app.handle(
      new Request("http://localhost/public/weddings/privado"),
    )
    expect(res.status).toBe(404)
  })

  it("confirms rsvp via token", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-1" })

    const guestsService = createGuestsService(testDb)
    const createResult = await guestsService.createGuest("u-1", {
      name: "Maria",
    })
    const guest = "data" in createResult ? createResult.data : null
    if (!guest) throw new Error("Expected guest data")

    const app = new Elysia().use(
      createPublicRoutes({
        service: createPublicService(testDb),
        guestsService,
      }),
    )

    const res = await app.handle(
      jsonRequest(`http://localhost/public/rsvp/${guest.rsvpToken}`, "POST", {
        rsvp: "confirmed",
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.rsvp).toBe("confirmed")
  })

  it("confirms rsvp with companions within the allowed limit", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-companions" })

    const guestsService = createGuestsService(testDb)
    const createResult = await guestsService.createGuest("u-1", {
      name: "Maria",
      plusOne: 3,
    })
    const guest = "data" in createResult ? createResult.data : null
    if (!guest) throw new Error("Expected guest data")

    const app = new Elysia().use(
      createPublicRoutes({
        service: createPublicService(testDb),
        guestsService,
      }),
    )

    const res = await app.handle(
      jsonRequest(`http://localhost/public/rsvp/${guest.rsvpToken}`, "POST", {
        rsvp: "confirmed",
        companions: 1,
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.rsvp).toBe("confirmed")
    expect(body.confirmedCompanions).toBe(1)
  })

  it("rejects confirmation when companions exceed the allowed limit", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-over-limit" })

    const guestsService = createGuestsService(testDb)
    const createResult = await guestsService.createGuest("u-1", {
      name: "Maria",
      plusOne: 2,
    })
    const guest = "data" in createResult ? createResult.data : null
    if (!guest) throw new Error("Expected guest data")

    const app = new Elysia().use(
      createPublicRoutes({
        service: createPublicService(testDb),
        guestsService,
      }),
    )

    const res = await app.handle(
      jsonRequest(`http://localhost/public/rsvp/${guest.rsvpToken}`, "POST", {
        rsvp: "confirmed",
        companions: 3,
      }),
    )
    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.message).toBe(
      "Você pode confirmar no máximo 2 acompanhante(s).",
    )

    const rows = await testDb
      .select()
      .from(guests)
      .where(eq(guests.id, guest.id))
    expect(rows[0]?.rsvp).toBe("pending")
    expect(rows[0]?.confirmedCompanions).toBe(0)
  })

  it("rejects negative and fractional companions at the schema level", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({
      id: "w-1",
      userId: "u-1",
      slug: "slug-invalid-companions",
    })

    const guestsService = createGuestsService(testDb)
    const createResult = await guestsService.createGuest("u-1", {
      name: "Maria",
      plusOne: 2,
    })
    const guest = "data" in createResult ? createResult.data : null
    if (!guest) throw new Error("Expected guest data")

    const app = new Elysia().use(
      createPublicRoutes({
        service: createPublicService(testDb),
        guestsService,
      }),
    )

    const negative = await app.handle(
      jsonRequest(`http://localhost/public/rsvp/${guest.rsvpToken}`, "POST", {
        rsvp: "confirmed",
        companions: -1,
      }),
    )
    expect(negative.status).toBe(422)

    const fractional = await app.handle(
      jsonRequest(`http://localhost/public/rsvp/${guest.rsvpToken}`, "POST", {
        rsvp: "confirmed",
        companions: 1.5,
      }),
    )
    expect(fractional.status).toBe(422)

    const notNumeric = await app.handle(
      jsonRequest(`http://localhost/public/rsvp/${guest.rsvpToken}`, "POST", {
        rsvp: "confirmed",
        companions: "two",
      }),
    )
    expect(notNumeric.status).toBe(422)
  })

  it("resets confirmedCompanions to zero when the guest declines", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-decline" })

    const guestsService = createGuestsService(testDb)
    const createResult = await guestsService.createGuest("u-1", {
      name: "Maria",
      plusOne: 2,
    })
    const guest = "data" in createResult ? createResult.data : null
    if (!guest) throw new Error("Expected guest data")

    const app = new Elysia().use(
      createPublicRoutes({
        service: createPublicService(testDb),
        guestsService,
      }),
    )

    await app.handle(
      jsonRequest(`http://localhost/public/rsvp/${guest.rsvpToken}`, "POST", {
        rsvp: "confirmed",
        companions: 2,
      }),
    )

    const declineRes = await app.handle(
      jsonRequest(`http://localhost/public/rsvp/${guest.rsvpToken}`, "POST", {
        rsvp: "declined",
      }),
    )
    expect(declineRes.status).toBe(200)
    const body = await declineRes.json()
    expect(body.rsvp).toBe("declined")
    expect(body.confirmedCompanions).toBe(0)
  })

  it("admin updateGuest clears confirmedCompanions when rsvp moves away from confirmed", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-admin-reset" })

    const guestsService = createGuestsService(testDb)
    const createResult = await guestsService.createGuest("u-1", {
      name: "Maria",
      plusOne: 2,
    })
    const guest = "data" in createResult ? createResult.data : null
    if (!guest) throw new Error("Expected guest data")

    await guestsService.confirmRsvpByToken(guest.rsvpToken!, "confirmed", 2)

    const updateResult = await guestsService.updateGuest("u-1", guest.id, {
      rsvp: "pending",
    })
    const updated = "data" in updateResult ? updateResult.data : null
    expect(updated?.rsvp).toBe("pending")
    expect(updated?.confirmedCompanions).toBe(0)
  })
})

describe("guest messages integration", () => {
  it("confirmPayment creates a guest message when payment has a message", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-1" })
    await seedGift({
      id: "g-1",
      weddingId: "w-1",
      active: false,
      lockedAt: now,
    })
    await seedGiftPayment({
      id: "p-1",
      giftId: "g-1",
      weddingId: "w-1",
      message: "Parabéns aos noivos!",
    })

    const guard = createAuthenticatedGuard("u-1") as unknown as typeof authGuard
    const app = new Elysia().use(
      createPaymentsRoutes({ service: createPaymentsService(testDb), guard }),
    )

    const res = await app.handle(
      new Request("http://localhost/admin/payments/p-1/confirm", {
        method: "PUT",
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe("approved")
    expect(body.message?.senderName).toBe("Buyer")
    expect(body.message?.message).toBe("Parabéns aos noivos!")
    expect(body.message?.isVisible).toBe(true)

    const rows = await testDb
      .select()
      .from(guestMessages)
      .where(eq(guestMessages.weddingId, "w-1"))
    expect(rows).toHaveLength(1)
    expect(rows[0]?.message).toBe("Parabéns aos noivos!")
  })

  it("confirmPayment does not create a guest message when payment has no message", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({ id: "w-1", userId: "u-1", slug: "slug-1" })
    await seedGift({
      id: "g-1",
      weddingId: "w-1",
      active: false,
      lockedAt: now,
    })
    await seedGiftPayment({ id: "p-1", giftId: "g-1", weddingId: "w-1" })

    const guard = createAuthenticatedGuard("u-1") as unknown as typeof authGuard
    const app = new Elysia().use(
      createPaymentsRoutes({ service: createPaymentsService(testDb), guard }),
    )

    const res = await app.handle(
      new Request("http://localhost/admin/payments/p-1/confirm", {
        method: "PUT",
      }),
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.message).toBeNull()

    const rows = await testDb
      .select()
      .from(guestMessages)
      .where(eq(guestMessages.weddingId, "w-1"))
    expect(rows).toHaveLength(0)
  })

  it("messages service blocks setVisibility by non-owner", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-owner")
    await seedUser("u-other")
    await seedWedding({ id: "w-1", userId: "u-owner", slug: "owner-slug" })
    await seedGift({ id: "g-1", weddingId: "w-1" })
    await seedGiftPayment({
      id: "p-1",
      giftId: "g-1",
      weddingId: "w-1",
      status: "approved",
    })
    await seedGuestMessage({ id: "m-1", weddingId: "w-1", paymentId: "p-1" })

    const service = createMessagesService(testDb)
    const result = await service.setVisibility("u-other", "m-1", false)

    expect(result).toEqual({ error: "forbidden" })
  })

  it("public listMessages returns only visible messages", async () => {
    if (!integrationDbAvailable) return

    await seedUser("u-1")
    await seedWedding({
      id: "w-1",
      userId: "u-1",
      slug: "public-slug",
      published: true,
    })
    await seedGift({ id: "g-1", weddingId: "w-1" })
    await seedGiftPayment({
      id: "p-1",
      giftId: "g-1",
      weddingId: "w-1",
      status: "approved",
    })
    await seedGiftPayment({
      id: "p-2",
      giftId: "g-1",
      weddingId: "w-1",
      status: "approved",
    })
    await seedGuestMessage({
      id: "m-1",
      weddingId: "w-1",
      paymentId: "p-1",
      senderName: "Visível",
      message: "Mensagem visível",
      isVisible: true,
    })
    await seedGuestMessage({
      id: "m-2",
      weddingId: "w-1",
      paymentId: "p-2",
      senderName: "Oculto",
      message: "Mensagem oculta",
      isVisible: false,
    })

    const app = new Elysia().use(
      createPublicRoutes({
        service: createPublicService(testDb),
        guestsService: createGuestsService(testDb),
      }),
    )

    const res = await app.handle(
      new Request("http://localhost/public/weddings/public-slug/messages"),
    )
    expect(res.status).toBe(200)
    const messages = await res.json()
    expect(messages).toHaveLength(1)
    expect(messages[0]?.senderName).toBe("Visível")
    expect(messages[0]?.message).toBe("Mensagem visível")
  })
})
