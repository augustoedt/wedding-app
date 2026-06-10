import { describe, expect, it, mock } from "bun:test"
import { getTableColumns } from "drizzle-orm"

describe("better-auth admin integration", () => {
  it("registers the admin plugin in auth config", async () => {
    const adminPlugin = { id: "admin-plugin" }

    const adminMock = mock(() => adminPlugin)
    const betterAuthMock = mock((config: unknown) => ({
      __config: config,
      handler: {
        fetch: () => new Response(null, { status: 204 }),
      },
      api: {
        getSession: async () => null,
      },
    }))

    try {
      mock.module("better-auth/plugins", () => ({
        admin: adminMock,
      }))

      mock.module("better-auth", () => ({
        betterAuth: betterAuthMock,
      }))

      mock.module("../src/db", () => ({
        db: {},
      }))

      await import("../src/lib/auth")

      expect(adminMock).toHaveBeenCalledTimes(1)
      expect(betterAuthMock).toHaveBeenCalledTimes(1)

      const config = betterAuthMock.mock.calls[0]?.[0] as {
        emailAndPassword?: { enabled?: boolean }
        plugins?: unknown[]
      }

      expect(config.emailAndPassword?.enabled).toBe(true)
      expect(config.plugins).toEqual([adminPlugin])
    } finally {
      mock.restore()
    }
  })

  it("exposes admin-related fields in auth tables", async () => {
    const authSchema = await import("../src/db/schema/auth")
    const userColumnKeys = Object.keys(getTableColumns(authSchema.user))
    const sessionColumnKeys = Object.keys(getTableColumns(authSchema.session))

    expect(userColumnKeys).toContain("role")
    expect(userColumnKeys).toContain("banned")
    expect(userColumnKeys).toContain("banReason")
    expect(userColumnKeys).toContain("banExpires")
    expect(sessionColumnKeys).toContain("impersonatedBy")
  })
})