# ADR — Front em layout-v2, API e admin em main

- **Data**: 2026-09-05
- **Status**: vigente

## Contexto

O redesign visual do site público (`layout-v2`) não estava pronto para
misturar com a API em `main`. O Railway do front está ligado a
`layout-v2`; API e admin, a `main`.

## Decisão

Manter esse mapeamento até unificar as branches:

| Serviço | Branch que dispara deploy |
|---|---|
| `wedding-app-front` | `layout-v2` |
| `wedding-app-api` | `main` |
| `wedding-app-adm` | `main` |

Correção que mexe em front **e** API exige cherry-pick/commit nas duas
branches.

## Consequências

- (+) Site público pode evoluir visualmente sem travar a API.
- (−) Drift: o mesmo arquivo em `main` e `layout-v2` diverge (ex.
  `WeddingLayout.svelte`).
- ⚠️ Cherry-pick de `layout-v2` → `main` frequentemente gera conflito.
  Aplicar o patch no conteúdo de `origin/main`, não forçar o commit da
  outra branch.
- ⚠️ Push só em `main` **não** atualiza `eduardoemayra.com.br`.
