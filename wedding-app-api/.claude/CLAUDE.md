# Guia de Desenvolvimento

Antes de qualquer tarefa, leia os arquivos relevantes. Nunca assuma padrões — derive-os do código existente.

---

## Stack

Identifique e siga a stack real do projeto:
- **Runtime / Framework HTTP**
- **Banco de dados + ORM**
- **Autenticação**
- **Validação de schemas**

---

## Arquitetura em camadas

Este projeto segue separação estrita de responsabilidades:

| Camada | Responsabilidade |
|---|---|
| `model.ts` | Schemas de validação (input e output) |
| `repository.ts` | Acesso ao banco — sem conhecimento de HTTP |
| `service.ts` | Regra de negócio — orquestra repositories |
| `index.ts` | Rotas HTTP — valida, chama service, traduz para status |

### Regras rígidas

- Rotas não fazem queries diretamente no banco
- Services não importam tipos HTTP (Request, Response, status codes)
- Repositories retornam `null` ou dados puros — nunca lançam erros HTTP
- Lógica de negócio fica no service, não espalhada na rota

---

## Padrão de factories

Todo módulo exporta factories, nunca instâncias diretas:

```ts
export function createXRepository(database: Database) { ... }
export function createXService(database: Database) { ... }
export function createXRoutes({ service, authPlugin } = {}) { ... }
export const xService = createXService(db) // singleton de produção
```

---

## Estrutura de módulos

```
src/modules/<nome>/
  model.ts
  repository.ts
  service.ts
  index.ts
```

Cada módulo é autocontido. Registre no bootstrap principal ao criar.

---

## Tradução de erros HTTP

Mapeie retornos do service para status codes na rota:

```
null                  → 404 Not Found
acesso negado         → 403 Forbidden
erro de domínio       → 400 Bad Request
conflito/duplicidade  → 409 Conflict
```

Nunca vaze stack traces ou detalhes internos para o cliente.

---

## Autenticação com Better Auth

### Configuração

```ts
// src/lib/auth.ts
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: /* adapter do ORM */,
  emailAndPassword: { enabled: true },
})
```

### Rotas nativas — não reimplementar

```
POST /api/auth/sign-up/email
POST /api/auth/sign-in/email
POST /api/auth/sign-out
GET  /api/auth/get-session
```

Monte todas via `auth.handler(request)` no framework.

### Protegendo rotas

```ts
const session = await auth.api.getSession({ headers: request.headers })
if (!session) return error(401)
const userId = session.user.id
```

Ou use um macro/plugin reutilizável que injeta o usuário no contexto da rota.

### Regras

- Nunca crie tabelas de usuário ou sessão manualmente — use `bunx @better-auth/cli generate`
- ID do usuário vem sempre da sessão autenticada, nunca do body da requisição
- Não reimplemente hashing de senha
- Não crie rotas de login/cadastro próprias

---

## Banco de dados

- Schemas organizados por domínio em arquivos separados
- Novas tabelas: declare no ORM → gere migration → aplique → atualize testes
- Evite `db:push` em ambientes compartilhados — use o fluxo de migration
- Nenhuma query SQL raw dentro de rotas ou services

---

## Validação

- Todo input validado via schema antes de chegar ao service
- Schemas declarados em `model.ts`, nunca inline na rota
- Tipos inferidos dos schemas usados nas camadas internas

---

## Controle de acesso

- Valide permissão antes de qualquer mutação
- Retorne 403 (não 404) quando o recurso existe mas o usuário não tem acesso
- Não exponha a existência de um recurso para quem não tem permissão

---

## Operações assíncronas

Para imports e processamentos em lote:

```
POST  /recurso/import  → 202 { importId, status: "accepted", totalRows }
GET   /recurso/import/:importId → { status: "pending" | "processing" | "done" | "failed" }
```

---

## Testes

- Testes de integração usam banco real — não mocke o banco
- Ao adicionar tabela: atualize o schema de teste e a função de limpeza entre testes
- Padrão: crie a app com banco temporário e faça requests reais via `app.handle(request)`

---

## O que evitar

- Auth fora do Better Auth
- Query SQL dentro de rotas ou services
- Lógica de negócio fora do service
- Refatoração estrutural misturada com feature nova
- Validação inline na rota
- Depender de IDs vindos do cliente para identificar o usuário autenticado
- Comentários que apenas repetem o que o código já diz
- Adicionar error handling para cenários que não podem acontecer

---

## Comandos disponíveis

| Comando | Uso |
|---|---|
| `/new-module` | Criar módulo completo do zero |
| `/new-route` | Adicionar rota a módulo existente |
| `/new-migration` | Adicionar ou alterar tabela no banco |
| `/review-module` | Revisar conformidade com a arquitetura |
| `/setup-auth` | Configurar Better Auth do zero |
