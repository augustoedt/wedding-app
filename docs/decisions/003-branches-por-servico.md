# ADR — Branch de deploy unificada em main

- **Data**: 2026-09-05
- **Atualizado**: 2026-09-18
- **Status**: vigente (substituída a decisão anterior de front em `layout-v2`)

## Contexto

O redesign visual do site público nasceu em `layout-v2`. Enquanto isso,
API e admin deployavam de `main`. Correções tiveram de ser cherry-pickadas
nas duas branches e divergiram (`WeddingLayout.svelte`, RSVP, Better Auth).

Em 2026-09-18 o conteúdo de `layout-v2` foi mergeado em `main` e o
serviço `wedding-app-front` passou a apontar para `main`.

## Decisão

Todos os serviços Railway do projeto `wedding-app` deployam de **`main`**.

| Serviço | Branch |
|---|---|
| `wedding-app-front` | `main` |
| `wedding-app-api` | `main` |
| `wedding-app-adm` | `main` |

`layout-v2` fica como histórico; não dispara produção.

## Consequências

- (+) Um `git push origin main` atualiza o que mudou em cada `rootDirectory`.
- (−) Redesign e API voltam a compartilhar a mesma linha de histórico.
- ⚠️ Não apontar o front de volta para `layout-v2` sem um ADR novo.
