# ADR — Um Git, três apps

- **Data**: 2026-06-10
- **Status**: vigente

## Contexto

O produto precisa de API, painel administrativo e site público, com stacks
diferentes (Elysia/Bun vs SvelteKit). Repositórios separados aumentam custo
de sincronizar contrato e deploy. Um único app full-stack misturaria
superfícies e deploys.

## Decisão

Um repositório Git (`wedding-app`) com Bun workspaces:

- `wedding-app-api`
- `wedding-app-adm`
- `wedding-app-front`

Contrato HTTP vive em `docs/contracts/api.md` (fonte única). Não há
cópias dentro dos três serviços.

## Consequências

- (+) Contrato e tipos evoluem no mesmo PR.
- (+) `bun run dev` na raiz sobe os três.
- (−) Um push pode afetar vários serviços.
- ⚠️ Documentação de produto/ops precisa viver na raiz (`docs/`), não em
  um app só.
