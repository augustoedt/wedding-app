# ADR — Pin Better Auth em 1.6.18

- **Data**: 2026-09-16
- **Status**: vigente

## Contexto

`wedding-app-api/package.json` usava `"better-auth": "latest"`. O deploy de
2026-09-05 instalou 1.7.2. A 1.7 passou a exigir `Account.issuer` e a
chavear contas em `(issuer, accountId)`. O Postgres de produção não tem a
coluna `issuer`.

Sintoma: usuário `eduardo@eduardo.com` existia (role `admin`, senha no
`account`), mas o login devolvia `Invalid email or password` e o log da API
registrava `Better Auth: User not found`. O `create-admin` dizia “já
existe, nada a fazer” e não recriava a conta.

Na 1.6.18, `BETTER_AUTH_SECRET` passou a ser obrigatório em produção. A
variável não estava no serviço; o container crashava em `bun run deploy`.

## Decisão

1. Fixar `"better-auth": "1.6.18"` (não `latest`).
2. Definir `BETTER_AUTH_SECRET` no serviço `wedding-app-api` (produção).
3. Não migrar para 1.7 sem o plano em `docs/plans/migrar-better-auth-1-7.md`.

## Consequências

- (+) Login voltou a funcionar com o schema atual.
- (−) Dependência atrasada em relação ao `latest`.
- ⚠️ Qualquer `bun install` que resolva `latest` de novo quebra produção.
- ⚠️ `BETTER_AUTH_URL` continua ausente; o Better Auth avisa e deriva o
  origin do request. Suficiente para email/senha; revisar se houver OAuth.
