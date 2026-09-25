# Documentação do wedding-app

Estrutura da documentação do monorepo (origem: padrão do ecossistema,
skill `docs-organization`). Toda pasta tem sua função explicada aqui.

A raiz do git só tem `README.md` + `CLAUDE.md`. Os três serviços não
carregam documentação de produto — só código. Exceção: READMEs gerados
pelo Paraglide/inlang em `wedding-app-adm/project.inlang/` e
`wedding-app-adm/src/lib/paraglide/` (saída da ferramenta, não editar).

## contracts/

Contrato HTTP da API (fonte única). Antes vivia em
`wedding-app-api/app-logic.md` e era copiado para adm/front.

- [`api.md`](contracts/api.md) — rotas `/admin`, `/public`, fluxos, tipos

## decisions/

Registros de decisão de arquitetura (ADRs) vigentes. Um arquivo por decisão,
com data, contexto e consequências. Decisão nova = arquivo novo; decisão
revertida = arquivo atualizado com o desfecho, nunca apagado.

- [`001-monorepo-tres-servicos.md`](decisions/001-monorepo-tres-servicos.md) — um git, três apps
- [`002-railway-root-directory-isolado.md`](decisions/002-railway-root-directory-isolado.md) — build isolado por pasta
- [`003-branches-por-servico.md`](decisions/003-branches-por-servico.md) — todos os serviços em `main`
- [`004-pin-better-auth.md`](decisions/004-pin-better-auth.md) — Better Auth 1.6.18
- [`005-rsvp-cta-explicito.md`](decisions/005-rsvp-cta-explicito.md) — botão de presentes no RSVP
- [`006-open-graph-tags.md`](decisions/006-open-graph-tags.md) — imagem do convite no WhatsApp

## plans/

Planos de trabalho ainda não concluídos (documentos vivos).

- [`migrar-better-auth-1-7.md`](plans/migrar-better-auth-1-7.md) — upgrade bloqueado pelo schema `account.issuer`

## checkpoints/

Estado atual do projeto, para retomada após compactação de chat ou troca
de modelo.

- [`project-state.md`](checkpoints/project-state.md) — **checkpoint autoritativo** (único arquivo)

## runbooks/

Passo a passo **vivo** de debug/ops. Um arquivo por operação; atualizar
quando a rotina mudar. Não é plano nem ADR.

- [`inspecionar-banco-producao.md`](runbooks/inspecionar-banco-producao.md) — query no Postgres via SSH da API
- [`debug-login-admin.md`](runbooks/debug-login-admin.md) — login do painel falha
- [`deploy-servico.md`](runbooks/deploy-servico.md) — publicar alteração no Railway
- [`preview-whatsapp.md`](runbooks/preview-whatsapp.md) — prévia do convite no WhatsApp
- [`criar-admin.md`](runbooks/criar-admin.md) — criar o usuário admin

## reviews/

Revisões de código e auditorias. Vazio por ora.

## issues/

Problemas conhecidos em aberto que ainda não viraram plano.

- [`app-logic-desatualizado.md`](issues/app-logic-desatualizado.md) — prazo de lock 24h no contrato vs 7 dias no código

## archive/

Documentos históricos ou de etapas concluídas, preservados para referência.

- [`readme-api-elysia-template.md`](archive/readme-api-elysia-template.md) — README gerado pelo template Elysia
- [`readme-adm-sv-template.md`](archive/readme-adm-sv-template.md) — README gerado pelo `sv` (admin)
- [`readme-front-sv-template.md`](archive/readme-front-sv-template.md) — README gerado pelo `sv` (front)
- [`claude-adm-sv-template.md`](archive/claude-adm-sv-template.md) — CLAUDE.md gerado pelo `sv` (admin)
- [`claude-front-sv-template.md`](archive/claude-front-sv-template.md) — CLAUDE.md gerado pelo `sv` (front)
- [`confirmacao.mhtml`](archive/confirmacao.mhtml) — dump da tela de confirmação
- [`min-front-app.mhtml`](archive/min-front-app.mhtml) — dump do front
- [`presentes.mhtml`](archive/presentes.mhtml) — dump da lista de presentes

## benchmarks/

Resultados de medição que sustentam decisões. Vazio por ora.

## apresentacoes/

Material explicativo para quem não acompanha o dia a dia técnico.
HTML editorial **só sob demanda**. Pasta vazia.
