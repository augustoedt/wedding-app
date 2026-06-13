import { describe, expect, it } from "bun:test"
import { Elysia } from "elysia"
import { authGuard } from "../src/lib/auth-guard"
import { createGiftsRoutes } from "../src/modules/gifts"
import { createGiftsService } from "../src/modules/gifts/service"
import { createGuestsRoutes } from "../src/modules/guests"
import { createGuestsService } from "../src/modules/guests/service"
import { createImagesRoutes } from "../src/modules/images"
import { createImagesService } from "../src/modules/images/service"
import { createPublicRoutes } from "../src/modules/public"
import { createPublicService } from "../src/modules/public/service"
import { createWeddingsRoutes } from "../src/modules/weddings"
import { createWeddingsService } from "../src/modules/weddings/service"

function createAuthenticatedGuard() {
  return new Elysia({ name: "test-auth-guard" }).derive({ as: "scoped" }, () => ({
    session: {
      user: {
        id: "user-1",
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

describe("weddings routes", () => {
  it("returns 404 when current user has no wedding", async () => {
    const app = new Elysia().use(
      createWeddingsRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          getMyWedding: async () => null,
          createWedding: async () => ({ error: "already_exists" as const }),
          updateWedding: async () => ({ error: "not_found" as const }),
        } as unknown as ReturnType<typeof createWeddingsService>,
      })
    )

    const response = await app.handle(new Request("http://localhost/admin/wedding/me"))

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: "Wedding not found" })
  })

  it("returns 201 on wedding creation", async () => {
    const app = new Elysia().use(
      createWeddingsRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          getMyWedding: async () => null,
          createWedding: async () => ({
            data: {
              id: "w-1",
              userId: "user-1",
              title: "Meu Casamento",
              slug: "meu-casamento",
            },
          }),
          updateWedding: async () => ({ error: "not_found" as const }),
        } as unknown as ReturnType<typeof createWeddingsService>,
      })
    )

    const response = await app.handle(
      jsonRequest("http://localhost/admin/wedding", "POST", {
        title: "Meu Casamento",
        slug: "meu-casamento",
      })
    )

    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({
      id: "w-1",
      slug: "meu-casamento",
    })
  })

  it("validates create wedding payload with 422", async () => {
    const app = new Elysia().use(
      createWeddingsRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          getMyWedding: async () => null,
          createWedding: async () => ({ data: { id: "w-1" } }),
          updateWedding: async () => ({ error: "not_found" as const }),
        } as unknown as ReturnType<typeof createWeddingsService>,
      })
    )

    const response = await app.handle(
      jsonRequest("http://localhost/admin/wedding", "POST", {
        title: "Meu Casamento",
        slug: "Slug Com Espaco",
      })
    )

    expect(response.status).toBe(422)
  })

  it("maps forbidden update to 403", async () => {
    const app = new Elysia().use(
      createWeddingsRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          getMyWedding: async () => null,
          createWedding: async () => ({ error: "already_exists" as const }),
          updateWedding: async () => ({ error: "forbidden" as const }),
        } as unknown as ReturnType<typeof createWeddingsService>,
      })
    )

    const response = await app.handle(
      jsonRequest("http://localhost/admin/wedding/w-1", "PUT", {
        title: "Novo titulo",
      })
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ message: "Forbidden" })
  })
})

describe("gifts routes", () => {
  it("returns 404 when no wedding exists", async () => {
    const app = new Elysia().use(
      createGiftsRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          listGifts: async () => ({ error: "no_wedding" as const }),
          createGift: async () => ({ error: "no_wedding" as const }),
          updateGift: async () => ({ error: "not_found" as const }),
          deleteGift: async () => ({ error: "not_found" as const }),
        } as unknown as ReturnType<typeof createGiftsService>,
      })
    )

    const response = await app.handle(new Request("http://localhost/admin/gifts"))

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: "No wedding found" })
  })

  it("returns 201 when creating a gift", async () => {
    const app = new Elysia().use(
      createGiftsRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          listGifts: async () => ({ data: [] }),
          createGift: async () => ({
            data: {
              id: "g-1",
              name: "Jogo de pratos",
              price: 5000,
              paymentType: "pix",
              paymentValue: "contato@email.com",
            },
          }),
          updateGift: async () => ({ error: "not_found" as const }),
          deleteGift: async () => ({ error: "not_found" as const }),
        } as unknown as ReturnType<typeof createGiftsService>,
      })
    )

    const response = await app.handle(
      jsonRequest("http://localhost/admin/gifts", "POST", {
        name: "Jogo de pratos",
        price: 5000,
        paymentType: "pix",
        paymentValue: "contato@email.com",
      })
    )

    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({ id: "g-1", paymentType: "pix" })
  })
})

describe("guests routes", () => {
  it("maps not found to 404 on update", async () => {
    const app = new Elysia().use(
      createGuestsRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          listGuests: async () => ({ data: [] }),
          createGuest: async () => ({ data: { id: "guest-1" } }),
          updateGuest: async () => ({ error: "not_found" as const }),
          deleteGuest: async () => ({ data: null }),
          confirmRsvpByToken: async () => ({ error: "not_found" as const }),
        } as unknown as ReturnType<typeof createGuestsService>,
      })
    )

    const response = await app.handle(
      jsonRequest("http://localhost/admin/guests/guest-1", "PUT", {
        name: "Convidado",
      })
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: "Guest not found" })
  })

  it("returns 404 when deleting a guest that does not exist", async () => {
    const app = new Elysia().use(
      createGuestsRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          deleteGuest: async () => ({ error: "not_found" as const }),
        } as unknown as ReturnType<typeof createGuestsService>,
      })
    )

    const response = await app.handle(
      new Request("http://localhost/admin/guests/guest-1", { method: "DELETE" })
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: "Guest not found" })
  })

  it("returns 403 when deleting a guest from another user's wedding", async () => {
    const app = new Elysia().use(
      createGuestsRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          deleteGuest: async () => ({ error: "forbidden" as const }),
        } as unknown as ReturnType<typeof createGuestsService>,
      })
    )

    const response = await app.handle(
      new Request("http://localhost/admin/guests/guest-1", { method: "DELETE" })
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ message: "Forbidden" })
  })

  it("returns 204 when a guest is deleted", async () => {
    const app = new Elysia().use(
      createGuestsRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          deleteGuest: async () => ({ data: null }),
        } as unknown as ReturnType<typeof createGuestsService>,
      })
    )

    const response = await app.handle(
      new Request("http://localhost/admin/guests/guest-1", { method: "DELETE" })
    )

    expect(response.status).toBe(204)
  })
})

describe("public routes", () => {
  const mockPublicService = {
    getWedding: async () => ({ error: "not_found" as const }),
    submitRsvp: async () => ({ error: "not_found" as const }),
    listGifts: async () => ({ error: "not_found" as const }),
  } as unknown as ReturnType<typeof createPublicService>

  const mockGuestsService = {
    confirmRsvpByToken: async () => ({ data: { id: "g-1", rsvp: "confirmed" } }),
  } as unknown as ReturnType<typeof createGuestsService>

  it("returns 404 when wedding slug does not exist", async () => {
    const app = new Elysia().use(
      createPublicRoutes({ service: mockPublicService, guestsService: mockGuestsService })
    )

    const response = await app.handle(
      new Request("http://localhost/public/weddings/inexistente")
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: "Wedding not found" })
  })

  it("validates RSVP body with 422", async () => {
    const app = new Elysia().use(
      createPublicRoutes({
        service: {
          getWedding: async () => ({
            data: { id: "w-1", title: "Wedding", date: null, description: null, coverImage: null },
          }),
          submitRsvp: async () => ({ data: { id: "r-1" } }),
          listGifts: async () => ({ data: [] }),
        } as unknown as ReturnType<typeof createPublicService>,
        guestsService: mockGuestsService,
      })
    )

    const response = await app.handle(
      jsonRequest("http://localhost/public/weddings/meu-casamento/rsvp", "POST", {
        name: "Joao",
        rsvp: "maybe",
      })
    )

    expect(response.status).toBe(422)
  })

  it("returns 404 when rsvp token is invalid", async () => {
    const app = new Elysia().use(
      createPublicRoutes({
        service: mockPublicService,
        guestsService: {
          confirmRsvpByToken: async () => ({ error: "not_found" as const }),
        } as unknown as ReturnType<typeof createGuestsService>,
      })
    )

    const response = await app.handle(
      jsonRequest("http://localhost/public/rsvp/invalid-token", "POST", { rsvp: "confirmed" })
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: "Invalid or expired RSVP link" })
  })

  it("confirms rsvp by token", async () => {
    const guest = { id: "g-1", name: "João", rsvp: "confirmed" }
    const app = new Elysia().use(
      createPublicRoutes({
        service: mockPublicService,
        guestsService: {
          confirmRsvpByToken: async () => ({ data: guest }),
        } as unknown as ReturnType<typeof createGuestsService>,
      })
    )

    const response = await app.handle(
      jsonRequest("http://localhost/public/rsvp/valid-token", "POST", { rsvp: "confirmed" })
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ rsvp: "confirmed" })
  })
})

describe("images routes", () => {
  function uploadForm() {
    // PNG signature + minimal IHDR chunk, required for file-type content sniffing
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // signature
      0x00, 0x00, 0x00, 0x0d, // IHDR length = 13
      0x49, 0x48, 0x44, 0x52, // "IHDR"
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // IHDR data (13 bytes)
      0, 0, 0, 0, // CRC
    ])
    const form = new FormData()
    form.append("file", new File([pngBytes], "photo.png", { type: "image/png" }))
    form.append("description", "Foto de capa")
    return form
  }

  it("returns 404 when listing images for a user with no wedding", async () => {
    const app = new Elysia().use(
      createImagesRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          list: async () => ({ error: "no_wedding" as const }),
          upload: async () => ({ error: "no_wedding" as const }),
        } as unknown as ReturnType<typeof createImagesService>,
      })
    )

    const response = await app.handle(new Request("http://localhost/admin/images"))

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: "No wedding found" })
  })

  it("returns 200 with the list of images", async () => {
    const image = {
      id: "img-1",
      weddingId: "w-1",
      url: "https://f005.backblazeb2.com/file/bucket/wedding/slug/img-1.png",
      description: "Foto de capa",
      createdAt: new Date().toISOString(),
    }
    const app = new Elysia().use(
      createImagesRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          list: async () => ({ data: [image] }),
          upload: async () => ({ error: "no_wedding" as const }),
        } as unknown as ReturnType<typeof createImagesService>,
      })
    )

    const response = await app.handle(new Request("http://localhost/admin/images"))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([image])
  })

  it("returns 404 when current user has no wedding", async () => {
    const app = new Elysia().use(
      createImagesRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          list: async () => ({ data: [] }),
          upload: async () => ({ error: "no_wedding" as const }),
        } as unknown as ReturnType<typeof createImagesService>,
      })
    )

    const response = await app.handle(
      new Request("http://localhost/admin/images", { method: "POST", body: uploadForm() })
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: "No wedding found" })
  })

  it("returns 201 with the uploaded image on success", async () => {
    const image = {
      id: "img-1",
      weddingId: "w-1",
      url: "https://f005.backblazeb2.com/file/bucket/wedding/slug/img-1.png",
      description: "Foto de capa",
      createdAt: new Date().toISOString(),
    }
    const app = new Elysia().use(
      createImagesRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          upload: async () => ({ data: image }),
        } as unknown as ReturnType<typeof createImagesService>,
      })
    )

    const response = await app.handle(
      new Request("http://localhost/admin/images", { method: "POST", body: uploadForm() })
    )

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual(image)
  })

  it("returns 404 when deleting an image that does not exist", async () => {
    const app = new Elysia().use(
      createImagesRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          delete: async () => ({ error: "not_found" as const }),
        } as unknown as ReturnType<typeof createImagesService>,
      })
    )

    const response = await app.handle(
      new Request("http://localhost/admin/images/img-1", { method: "DELETE" })
    )

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: "Image not found" })
  })

  it("returns 403 when deleting an image from another user's wedding", async () => {
    const app = new Elysia().use(
      createImagesRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          delete: async () => ({ error: "forbidden" as const }),
        } as unknown as ReturnType<typeof createImagesService>,
      })
    )

    const response = await app.handle(
      new Request("http://localhost/admin/images/img-1", { method: "DELETE" })
    )

    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ message: "Forbidden" })
  })

  it("returns 204 when an image is deleted", async () => {
    const app = new Elysia().use(
      createImagesRoutes({
        guard: createAuthenticatedGuard() as unknown as typeof authGuard,
        service: {
          delete: async () => ({ data: null }),
        } as unknown as ReturnType<typeof createImagesService>,
      })
    )

    const response = await app.handle(
      new Request("http://localhost/admin/images/img-1", { method: "DELETE" })
    )

    expect(response.status).toBe(204)
  })
})
