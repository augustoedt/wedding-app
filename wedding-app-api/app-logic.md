# App Logic

Este app é uma API em Elysia com quatro blocos principais de rotas:

## Autenticação

O app monta o Better Auth com `auth.handler` na aplicação Elysia, seguindo o padrão oficial da integração. Isso expõe as rotas nativas de autenticação sem precisar reimplementar login, cadastro, sessão ou logout manualmente.

Rotas nativas usadas pelo app:

- `POST /api/auth/sign-up/email`
	- body aceito: payload nativo do Better Auth para cadastro com e-mail/senha
	- retorno: usuário/sessão conforme contrato nativo do Better Auth
- `POST /api/auth/sign-in/email`
	- body aceito: payload nativo do Better Auth para login com e-mail/senha
	- retorno: sessão autenticada conforme contrato nativo do Better Auth
- `POST /api/auth/sign-out`
	- body aceito: sem payload obrigatório
	- retorno: confirmação de logout conforme contrato nativo do Better Auth
- `GET /api/auth/get-session`
	- query/body: não exige
	- retorno: sessão atual (ou ausência de sessão), conforme contrato nativo do Better Auth

Para proteger rotas, o app usa `auth.api.getSession({ headers })` dentro do `authGuard`, que injeta `session` no contexto e responde com `401` quando não há usuário autenticado.

---

## Site Admin — rotas utilizadas

Todas as rotas abaixo usam o prefixo `/admin` e exigem sessão autenticada via `authGuard`.

### Casamento

- `GET /admin/wedding/me`
	- retorno `200`: `Wedding`
	- erro comum: `404 { message: "Wedding not found" }`
- `POST /admin/wedding`
	- body aceito: `{ title: string; slug: string (^[a-z0-9-]+$); siteUrl?: string; inviteMessage?: string; date?: string; description?: string; coverImage?: string }`
	- retorno `201`: `Wedding`
	- erros comuns: `409` para slug duplicado ou casamento já existente
- `PUT /admin/wedding/:id`
	- params: `{ id: string }`
	- body aceito: `{ title?: string; slug?: string; siteUrl?: string | null; inviteMessage?: string | null; date?: string | null; description?: string | null; coverImage?: string | null; isPublished?: boolean }`
	- retorno `200`: `Wedding`
	- erros comuns: `403`, `404`, `409`

### Convidados

- `GET /admin/guests`
	- retorno `200`: `Guest[]`
	- erro comum: `404 { message: "No wedding found" }`
- `GET /admin/guests/:id`
	- params: `{ id: string }`
	- retorno `200`: `Guest`
	- erros comuns: `403`, `404`
- `POST /admin/guests`
	- body aceito: `{ name: string; email?: string; phone?: string; plusOne?: number (>= 0) }`
	- retorno `201`: `Guest` (inclui `rsvpToken` gerado automaticamente)
	- erro comum: `404 { message: "No wedding found" }`
- `PUT /admin/guests/:id`
	- params: `{ id: string }`
	- body aceito: `{ name?: string; email?: string | null; phone?: string | null; rsvp?: "pending" | "confirmed" | "declined"; plusOne?: number (>= 0); inviteSent?: boolean }`
	- retorno `200`: `Guest`
	- erros comuns: `403`, `404`
- `DELETE /admin/guests/:id`
	- params: `{ id: string }`
	- retorno `204`: sem body
	- erros comuns: `403`, `404`

### Presentes

- `GET /admin/gifts`
	- retorno `200`: `Gift[]`
	- erro comum: `404 { message: "No wedding found" }`
- `POST /admin/gifts`
	- body aceito: `{ name: string; description?: string; price: number (inteiro >= 1); imageUrl?: string; paymentType?: "url" | "pix"; paymentValue?: string }`
	- retorno `201`: `Gift`
	- erro comum: `404 { message: "No wedding found" }`
- `PUT /admin/gifts/:id`
	- params: `{ id: string }`
	- body aceito: `{ name?: string; description?: string | null; price?: number (inteiro >= 1); imageUrl?: string | null; paymentType?: "url" | "pix" | null; paymentValue?: string | null; isActive?: boolean }`
	- retorno `200`: `Gift`
	- erros comuns: `403`, `404`
- `DELETE /admin/gifts/:id`
	- params: `{ id: string }`
	- retorno `204`: sem body
	- erros comuns: `403`, `404`

### Pagamentos

- `GET /admin/payments`
	- query aceita: `{ status?: string; giftId?: string }`
	- retorno `200`: `GiftPayment[]` — lista todos os pagamentos do casamento, mais recentes primeiro
	- erro comum: `404 { message: "No wedding found" }`
- `PUT /admin/payments/:id/confirm`
	- params: `{ id: string }`
	- retorno `200`: `{ id: string; status: "approved" }`
	- erros comuns:
		- `404` — pagamento não encontrado
		- `403` — pagamento pertence a outro casamento
		- `409` — pagamento não está no status `pending_confirmation`
	- efeito colateral: marca o presente como comprado definitivamente (`isActive = false, lockedAt = null`)

### Imagens

- `POST /admin/images`
	- body aceito (`multipart/form-data`): `{ file: File (image/jpeg | image/png | image/webp | image/gif, máx 8MB); description?: string }`
	- retorno `201`: `Image`
	- erro comum: `404 { message: "No wedding found" }`
	- efeito: faz upload do arquivo para o bucket Backblaze B2, em `wedding/{slug-do-casamento}/{uuid}.{ext}`, e cria o registro `Image` com a URL pública resultante

---

## Site de convidados — rotas utilizadas

Essas rotas usam o prefixo `/public` e não exigem autenticação.

### Casamento

- `GET /public/weddings/:slug`
	- params: `{ slug: string }`
	- retorno `200`: dados públicos do casamento `{ id, title, date, description, coverImage }`
	- erro comum: `404 { message: "Wedding not found" }`

### RSVP

- `GET /public/rsvp/:token`
	- params: `{ token: string }` — UUID gerado na criação do convidado pelo admin
	- retorno `200`: `{ name: string; rsvp: "pending" | "confirmed" | "declined" }`
	- erro comum: `404 { message: "Invalid or expired RSVP link" }`
- `POST /public/rsvp/:token`
	- params: `{ token: string }` — UUID gerado na criação do convidado pelo admin
	- body aceito: `{ rsvp: "confirmed" | "declined" }`
	- retorno `200`: `Guest` atualizado
	- erro comum: `404 { message: "Invalid or expired RSVP link" }`

### Lista de presentes

- `GET /public/weddings/:slug/gifts`
	- params: `{ slug: string }`
	- query aceita: `{ page?: number (default 1); limit?: number (default 20, max 100) }`
	- retorno `200`: `{ items: Gift[]; total: number; page: number; limit: number }` — todos os presentes do casamento, paginados
	- erro comum: `404 { message: "Wedding not found" }`
- `POST /public/weddings/:slug/gifts/:giftId/lock`
	- params: `{ slug: string; giftId: string }`
	- body aceito: `{ buyerName: string; buyerEmail: string (formato e-mail) }`
	- retorno `201`: `{ paymentId: string; paymentType: "url" | "pix" | null; paymentValue: string | null }`
	- comportamento:
		- marca o presente como travado (`isActive = false, lockedAt = now()`)
		- cria um registro `GiftPayment` com `status = "pending_confirmation"`
		- retorna o tipo e valor de pagamento para o front exibir o link ou QR code
	- erros comuns:
		- `404` — casamento não encontrado
		- `409` — presente já travado ou comprado

---

## Fluxo de compra de presente

```
Convidado clica em "comprar"
    → POST /public/weddings/:slug/gifts/:giftId/lock
    → presente fica isActive=false, lockedAt=agora
    → pagamento criado com status=pending_confirmation
    → front exibe link de pagamento ou QR code pix

Admin vê o pagamento pendente em GET /admin/payments
    → confirma manualmente que o pagamento foi recebido
    → PUT /admin/payments/:id/confirm
    → pagamento fica approved, presente fica isActive=false, lockedAt=null (comprado)

Se o admin não confirmar em até 24h:
    → cron roda a cada hora
    → presentes com lockedAt < agora-24h são reativados (isActive=true, lockedAt=null)
    → pagamento associado fica com status=expired
```

### Estados do presente

| `isActive` | `lockedAt`  | Significado                              |
|------------|-------------|------------------------------------------|
| `true`     | `null`      | Disponível para compra                   |
| `false`    | timestamp   | Travado — aguardando confirmação do admin |
| `false`    | `null`      | Comprado — confirmado pelo admin          |

### Statuses de `GiftPayment`

| Status                  | Significado                                          |
|-------------------------|------------------------------------------------------|
| `pending_confirmation`  | Presente travado, aguardando admin confirmar          |
| `approved`              | Admin confirmou o recebimento do pagamento           |
| `expired`               | Cron expirou o lock após 24h sem confirmação         |

---

## Tipos de entidade

- `Wedding`: `{ id, userId, title, slug, siteUrl, inviteMessage, date, description, coverImage, isPublished, createdAt, updatedAt }`
- `Guest`: `{ id, weddingId, name, email, phone, rsvp, plusOne: number, inviteSent: boolean, rsvpToken, createdAt, updatedAt }`
- `Gift`: `{ id, weddingId, name, description, price, imageUrl, paymentType, paymentValue, isActive, lockedAt, createdAt, updatedAt }`
- `GiftPayment`: `{ id, giftId, weddingId, buyerName, buyerEmail, amount, status, createdAt, updatedAt }`
- `Image`: `{ id, weddingId, url, description, createdAt }`

## Pagamento nos presentes

Cada presente pode ter um tipo de pagamento (`paymentType`) e um valor (`paymentValue`):

- `paymentType: "url"` + `paymentValue: "https://..."` → o front exibe um botão de link externo
- `paymentType: "pix"` + `paymentValue: "chave@pix.com"` → o front gera um QR code pix

Ambos os campos são opcionais. Presentes sem `paymentType` são exibidos sem opção de pagamento direto.

## Fluxo geral

O app aplica CORS, monta o Better Auth, registra um cron de expiração de locks, depois registra as rotas administrativas e públicas. A regra geral é:

- rotas de leitura pública ficam em `/public`
- rotas de gestão ficam em `/admin`
