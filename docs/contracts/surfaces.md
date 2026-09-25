# Superfícies — admin e site público

Não duplica o contrato HTTP (`api.md`). Só o que vive nas UIs: rotas,
variáveis, e comportamento que a API sozinha não explica.

Os dois SvelteKits **não falam com o banco**. Admin usa `API_URL` (privada)
e encaminha cookies do Better Auth. Front usa `PUBLIC_API_URL` +
`PUBLIC_WEDDING_SLUG` nas rotas `/public`.

---

## Admin (`wedding-app-adm`)

Domínio de produção: `wedding-app-adm-production.up.railway.app`.

Variável: `API_URL` (server-only). Login: `POST {API_URL}/api/auth/sign-in/email`
via `src/lib/server/auth/index.ts`; sessão lida em `hooks.server.ts`.

| Rota | Função |
|---|---|
| `/login` | e-mail/senha; sucesso → `/admin` |
| `/admin` | redireciona para dashboard (exige sessão) |
| `/admin/dashboard` | totais, link do site, publicar/despublicar |
| `/admin/guests` | lista, RSVP, convite WhatsApp (`inviteMessage` + `{nome}` `{link}`), copiar link RSVP |
| `/admin/guests/new` e `/admin/guests/[id]` | criar/editar convidado |
| `/admin/gifts` | CRUD, status available/locked/purchased, drag-and-drop (`POST /admin/gifts/:id/reorder`) |
| `/admin/payments` | pendentes → confirmar (`PUT /admin/payments/:id/confirm`) |
| `/admin/messages` | mural; visibilidade |
| `/admin/media` | biblioteca de imagens (upload B2) |
| `/admin/galleries` | galerias, fotos, reorder; apagar galeria **desanexa** imagens |
| `/admin/settings` | abas Geral / Local / Dress code / Compartilhamento (`ogImage`) |

`/demo` e `/demo/paraglide` são leftover do scaffold `sv` — não são produto.

Upload de imagem: `POST /admin/images` no próprio admin (`src/routes/admin/images/+server.ts`) faz proxy multipart para a API.

---

## Site público (`wedding-app-front`)

Domínios: `eduardoemayra.com.br`, `wedding-app-front-production.up.railway.app`.

Variáveis: `PUBLIC_API_URL`, `PUBLIC_WEDDING_SLUG` (hoje o casamento no ar
usa slug `eduemay` — conferir o valor no serviço Railway).

| Rota | Função |
|---|---|
| `/` | hero (`coverImage`), countdown, texto, primeira galeria não vazia |
| `/cerimonia` | local, horário, dress code, `venueImage` |
| `/presentes` | lista paginada (`?page=`, 12 por página); só gifts com `paymentType`; lock + PIX/URL |
| `/mensagens` | mural público (`isVisible`) |
| `/confirmacao/[token]` | RSVP; token gravado no `localStorage` (`rsvp-store`) para o item “Minha confirmação” no menu |

Comportamento só de UI (ADRs):

- Tags Open Graph em `WeddingLayout` (`ogImage ?? coverImage`). ADR `006`.
- Depois do RSVP: botão **Confira os presentes** → `/presentes`, sem redirect automático. ADR `005`.
- Menu “Presentes” sempre visível; confirmação só depois de o convidado abrir o link com token.

Não há login no front.
