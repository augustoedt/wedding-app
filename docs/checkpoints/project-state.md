# Checkpoint — estado do projeto wedding-app

> **Atualizado em 2026-09-18 (contrato alinhado ao código).** Este é o checkpoint autoritativo: ao
> retomar o trabalho (compactação de chat, troca de modelo), comece por
> aqui.

## Onde estamos

Site de casamento Mayra e Eduardo, no ar.

Monorepo Bun (`wedding-app-api`, `wedding-app-adm`, `wedding-app-front`)
no GitHub `augustoedt/wedding-app`. Railway projeto `wedding-app`
(`d868fc6e-3f73-44c6-9335-102e57560c2f`), ambiente `production`
(`f0dca143-e0f6-4dc5-b924-8e74381648f5`).

| Serviço Railway | Pasta | Branch no ar | Domínio |
|---|---|---|---|
| `wedding-app-api` (`0492f6bb-988a-453b-b982-ce61ab268149`) | `/wedding-app-api` | `main` | privado (sem domínio público) |
| `wedding-app-adm` (`2dd1513f-a811-4d0d-8cc6-bc6d89578903`) | `/wedding-app-adm` | `main` | `wedding-app-adm-production.up.railway.app` |
| `wedding-app-front` (`444e994e-e77e-4ea3-9187-5f818068c09c`) | `/wedding-app-front` | `main` | `eduardoemayra.com.br` e `wedding-app-front-production.up.railway.app` |
| `Postgres` (`ede5f938-d33c-4412-b090-244ae1d4658e`) | template Railway | — | volume persistente |

Entregas recentes (2026-09-16 / 2026-09-17):

- Login admin restaurado: Better Auth pinado em `1.6.18` + `BETTER_AUTH_SECRET` no Railway. Commits `35aa017` (`main`) / `76fa7dc` (`layout-v2`).
- Botão **Confira os presentes** após RSVP (sem redirect automático). Commits `34690c7` (`main`) / `3e874dc` (`layout-v2`). Deployment front `75dfe396-55af-4687-adea-4d786975e017`.
- Tags Open Graph publicando a imagem configurada. Commits `ed32dce` (`main`) / `8259698` (`layout-v2`). Deployment front `9f0209a6-37c9-47e1-9318-79990f5e08f9`.
- Prazo de lock de presente: **7 dias** no código e no contrato (`PAYMENT_APPROVAL_DEADLINE_MS` em `wedding-app-api/src/index.ts`).

Casamento publicado: slug `eduemay` (front usa `PUBLIC_WEDDING_SLUG`; conferir o valor no serviço). Admin `eduardo@eduardo.com` (role `admin`). Imagens no Backblaze B2 (`softmediabox/wedding/eduemay/…`).

## Em andamento ⚠️

- `wedding-app-api/.env` modificado localmente — **não commitado**.
- `.DS_Store` untracked — não versionar.

Nada de feature de produto em WIP.

## Próximo passo

1. Não subir Better Auth para 1.7 sem o plano `migrar-better-auth-1-7.md`.

Pagamento expirado pelo cron de 7 dias **pode ser confirmado depois**: o presente volta a comprado e o recado vira mensagem de mural (admin Pagamentos).

## Armadilhas conhecidas

- **`better-auth: latest` quebra o login.** 1.7 exige `account.issuer`; o banco não tem a coluna. Sintoma: `Invalid email or password` + log `User not found`. ADR `004`.
- **`BETTER_AUTH_SECRET` obrigatório em produção.** Sem ele o start command (`bun run deploy` → `create-admin`) crasha. O serviço antigo não tinha a variável.
- **Produção é `main` para os três serviços.** `layout-v2` é histórico. ADR `003`.
- **Railway isola `rootDirectory`.** `bun.lock` da raiz do monorepo não entra no build. Cada pasta precisa do próprio lockfile coerente. ADR `002`. Histórico: deploys do admin falharam com lockfile frozen (`694f67d`).
- **WhatsApp cacheia a prévia.** Tags OG corretas no HTML não atualizam mensagem já enviada. Testar com `?v=2`. Runbook `preview-whatsapp.md`.
- **Não usar convidado real para “testar RSVP” alterando status.** Leitura da tela de sucesso já confirmada é segura; mudar RSVP não.
- **`railway up ./pasta --path-as-root` no API falha** (`prefix not found`). Subir a partir da raiz do git com `--service` correto, ou deixar o GitHub autodeploy.
- **Contrato HTTP é só `docs/contracts/api.md`.** Cópias em adm/front e o script `sync-app-logic.sh` foram removidos.

## Referências

- [`../../README.md`](../../README.md) — visão do monorepo
- [`../contracts/api.md`](../contracts/api.md) — contrato HTTP
- [`../contracts/surfaces.md`](../contracts/surfaces.md) — telas admin/front
- [`../decisions/`](../decisions/) — ADRs
- [`../runbooks/`](../runbooks/) — debug/ops
- [`../plans/migrar-better-auth-1-7.md`](../plans/migrar-better-auth-1-7.md)
