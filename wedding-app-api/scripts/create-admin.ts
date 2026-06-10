import { auth } from "../src/lib/auth"
import { db } from "../src/db"
import { user } from "../src/db/schema/auth"
import { eq } from "drizzle-orm"

const args = process.argv.slice(2)

function getArg(name: string): string | undefined {
  const flag = `--${name}=`
  const match = args.find((a) => a.startsWith(flag))
  return match?.slice(flag.length)
}

async function prompt(question: string, hidden = false): Promise<string> {
  process.stdout.write(question)
  if (hidden) process.stdout.write("\x1b[8m") // hide input
  const value = await new Promise<string>((resolve) => {
    process.stdin.resume()
    process.stdin.setEncoding("utf8")
    process.stdin.once("data", (data) => {
      process.stdin.pause()
      resolve(String(data).trim())
    })
  })
  if (hidden) process.stdout.write("\x1b[0m\n")
  return value
}

async function main() {
  const email = getArg("email") ?? ((await prompt("Email [local@demo.com]: ")) || "local@demo.com")
  const name = getArg("name") ?? ((await prompt("Nome [Local Demo]: ")) || "Local Demo")
  const password = getArg("password") ?? ((await prompt("Senha [Password123!]: ", true)) || "Password123!")

  if (!email || !name || !password) {
    console.error("email, nome e senha são obrigatórios")
    process.exit(1)
  }

  const existing = await db.select().from(user).where(eq(user.email, email)).limit(1)
  if (existing.length > 0) {
    console.error(`Usuário com email ${email} já existe`)
    process.exit(1)
  }

  const result = await auth.api.signUpEmail({
    body: { email, name, password },
  })

  await db.update(user).set({ role: "admin" }).where(eq(user.id, result.user.id))

  console.log(`Admin criado com sucesso: ${result.user.email} (id: ${result.user.id})`)
  process.exit(0)
}

main().catch((err) => {
  console.error("Erro ao criar admin:", err.message ?? err)
  process.exit(1)
})
