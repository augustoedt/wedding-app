# wedding-app

Site de casamento (Mayra e Eduardo): um repositório Git, três apps.

```
wedding-app/
├── wedding-app-api/     API Elysia + Better Auth + Postgres
├── wedding-app-adm/     painel SvelteKit
├── wedding-app-front/   site público dos convidados
└── docs/                documentação do monorepo
```

Antes de qualquer trabalho: leia [`docs/README.md`](docs/README.md) e o checkpoint [`docs/checkpoints/project-state.md`](docs/checkpoints/project-state.md).

## Desenvolvimento local

```bash
bun install
bun run dev
```

Sobe os três apps em paralelo. Variáveis: `wedding-app-api/.env.example`, `wedding-app-adm/.env.example` e `PUBLIC_API_URL` / `PUBLIC_WEDDING_SLUG` no front.

Postgres local via `wedding-app-api/docker-compose.yml`. Migrações: `cd wedding-app-api && bun run db:migrate`. Admin local: `bun run create-admin`.

## Produção

Railway, projeto `wedding-app`, ambiente `production`. Cada pasta é um serviço com `rootDirectory` isolado. Mapeamento, branches e armadilhas: checkpoint e ADRs em `docs/`.
