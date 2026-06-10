import { cron, Patterns } from "@elysia/cron"
import cors from "@elysiajs/cors"
import { Elysia } from "elysia"
import { db } from "./db"
import { auth } from "./lib/auth"
import { authGuard } from "./lib/auth-guard"
import { createGiftsRepository } from "./modules/gifts/repository"
import { createGiftsRoutes } from "./modules/gifts"
import { createGiftsService } from "./modules/gifts/service"
import { createGuestsRoutes } from "./modules/guests"
import { createGuestsService } from "./modules/guests/service"
import { createPaymentsRepository } from "./modules/payments/repository"
import { createPaymentsRoutes } from "./modules/payments"
import { createPaymentsService } from "./modules/payments/service"
import { createPublicRoutes } from "./modules/public"
import { createPublicService } from "./modules/public/service"
import { createWeddingsRoutes } from "./modules/weddings"
import { createWeddingsService } from "./modules/weddings/service"

async function expireGiftLocks() {
  const giftsRepo = createGiftsRepository(db)
  const paymentsRepo = createPaymentsRepository(db)

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const expired = await giftsRepo.findExpiredLocks(cutoff)

  if (expired.length === 0) return

  const giftIds = expired.map((g) => g.id)
  await paymentsRepo.expirePendingByGiftIds(giftIds)
  await Promise.all(giftIds.map((id) => giftsRepo.reactivate(id)))

  console.log(`[cron] Reactivated ${expired.length} expired gift lock(s)`)
}

const app = new Elysia()
  .use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") ?? ["http://localhost:5173"],
      credentials: true,
    })
  )
  .use(
    cron({
      name: "expireGiftLocks",
      pattern: Patterns.everyHours(1),
      run: expireGiftLocks,
    })
  )
  .mount(auth.handler)
  .use(
    createWeddingsRoutes({
      service: createWeddingsService(db),
      guard: authGuard,
    })
  )
  .use(
    createGuestsRoutes({
      service: createGuestsService(db),
      guard: authGuard,
    })
  )
  .use(
    createGiftsRoutes({
      service: createGiftsService(db),
      guard: authGuard,
    })
  )
  .use(
    createPaymentsRoutes({
      service: createPaymentsService(db),
      guard: authGuard,
    })
  )
  .use(createPublicRoutes({ service: createPublicService(db), guestsService: createGuestsService(db) }))
  .listen(process.env.PORT ?? 3000)

console.log(`API running at ${app.server?.hostname}:${app.server?.port}`)
