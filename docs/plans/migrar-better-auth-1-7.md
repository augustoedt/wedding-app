# Plano — migrar Better Auth 1.7

Documento vivo. Não executar até este plano ser revisado e o schema de
produção ter backup.

## Objetivo

Sair do pin `1.6.18` (ADR `004`) para 1.7.x sem derrubar o login.

## Por que está bloqueado

1.7 exige `Account.issuer` e identidade `(issuer, accountId)`. Produção
não tem a coluna `issuer`. O sign-in trata a conta credential como
inexistente (`User not found`).

Há guia oficial de backfill na release 1.7. Drizzle precisa regenerar
schema (`better-auth generate`) e migration.

## Passos previstos (não feitos)

1. Backup do Postgres Railway (snapshot/volume).
2. Regenerar schema Drizzle com Better Auth 1.7.
3. Migration: adicionar `issuer`, backfill das contas `credential`
   existentes com o issuer local documentado pela lib.
4. Pin da versão **exata** (não `latest`) no `package.json` da API.
5. Staging ou `railway run` da migration **antes** do start da API nova.
6. Testar `POST /api/auth/sign-in/email` com o admin conhecido.
7. Só então promover o deploy.

## Fora de escopo agora

Trocar o fluxo de login, OAuth, ou recriar o usuário admin.
