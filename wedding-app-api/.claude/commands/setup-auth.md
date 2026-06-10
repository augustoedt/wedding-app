Configure autenticação nesta API usando Better Auth.

## O que configurar: $ARGUMENTS

---

## Visão geral do Better Auth

Better Auth é uma biblioteca de autenticação full-stack para TypeScript. Ela expõe rotas HTTP prontas, gerencia sessões e fornece um cliente tipado para o frontend. Não reimplemente o que ela já oferece.

Documentação: https://www.better-auth.com/docs

---

## Instalação

```bash
bun add better-auth
```

---

## Configuração do servidor

Crie a instância do Better Auth uma única vez e exporte-a:

```ts
// src/lib/auth.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
  },
  // plugins opcionais: organization, twoFactor, magicLink etc.
})

export type Session = typeof auth.$Infer.Session
```

---

## Schema do banco

Better Auth precisa de tabelas próprias. Gere-as com:

```bash
bunx @better-auth/cli generate
```

Isso cria um arquivo de schema com as tabelas `user`, `session`, `account`, `verification`. Integre-o ao schema do seu ORM sem modificar a estrutura gerada.

Após integrar, gere e aplique a migration normalmente:
```bash
bun run db:generate && bun run db:migrate
```

---

## Rotas nativas (não reimplementar)

O Better Auth monta automaticamente as rotas abaixo em `/api/auth/...`:

| Rota | Descrição |
|---|---|
| `POST /api/auth/sign-up/email` | Cadastro com email e senha |
| `POST /api/auth/sign-in/email` | Login com email e senha |
| `POST /api/auth/sign-out` | Logout |
| `GET /api/auth/get-session` | Sessão atual |

Monte essas rotas no handler HTTP do framework:

```ts
// Elysia
app.all("/api/auth/*", ({ request }) => auth.handler(request))

// Hono
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))

// Express
app.use("/api/auth", toNodeHandler(auth))
```

---

## Protegendo rotas

### Verificação manual (qualquer framework)

```ts
const session = await auth.api.getSession({ headers: request.headers })
if (!session) return new Response("Unauthorized", { status: 401 })
const userId = session.user.id
```

### Macro/plugin (Elysia)

Crie um plugin reutilizável para injetar o usuário no contexto:

```ts
// src/plugins/auth-macro.ts
import Elysia from "elysia"
import { auth } from "../lib/auth"

export const authMacroPlugin = new Elysia({ name: "auth-macro" })
  .macro({
    auth: {
      async resolve({ request, error }) {
        const session = await auth.api.getSession({ headers: request.headers })
        if (!session) return error(401, "Unauthorized")
        return { user: session.user }
      }
    }
  })

// Uso na rota:
app.get("/me", ({ user }) => user, { auth: true })
```

---

## Sessão por cookie vs. token

O Better Auth usa cookie de sessão por padrão (`better-auth.session_token`). Para APIs que precisam de token no header (mobile, CLI), habilite:

```ts
betterAuth({
  // ...
  session: {
    cookieCache: { enabled: true },
  },
  plugins: [bearer()] // habilita Authorization: Bearer <token>
})
```

---

## Cliente tipado (frontend / integração)

```ts
import { createAuthClient } from "better-auth/client"

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
})

// Uso
await authClient.signIn.email({ email, password })
await authClient.signOut()
const session = await authClient.getSession()
```

---

## Plugins úteis

| Plugin | Quando usar |
|---|---|
| `organization()` | Multi-tenant com times e permissões |
| `twoFactor()` | 2FA via TOTP ou OTP por email |
| `magicLink()` | Login sem senha por email |
| `admin()` | Painel de gestão de usuários |
| `bearer()` | Autenticação via Bearer token |

Adicione plugins na instância do `betterAuth({ plugins: [...] })`.

---

## O que não fazer

- Não crie tabelas de sessão ou usuário manualmente — use as geradas pelo CLI
- Não reimplemente hashing de senha — o Better Auth já gerencia
- Não armazene senhas no banco — apenas hashes
- Não crie rotas de sign-in/sign-up próprias — use as nativas
- Não confie em IDs de usuário vindos do body — use sempre a sessão autenticada

---

## Passos

1. Instale o `better-auth`
2. Crie `src/lib/auth.ts` com a configuração base
3. Gere o schema com `bunx @better-auth/cli generate`
4. Integre o schema ao ORM e gere a migration
5. Monte as rotas `/api/auth/*` no framework
6. Crie o plugin/macro de autenticação para proteger rotas
7. Teste com `POST /api/auth/sign-up/email` e `GET /api/auth/get-session`
