# Runbook — inspecionar banco de produção

Documento vivo. Atualizar quando a rotina mudar (paths, credenciais, API).
Não é ADR nem plano.

## Quando

Precisar ler usuários, convidados, tokens RSVP ou conferir schema sem
abrir o dashboard do Postgres. Sintomas típicos: login “user not found”,
dúvida se o admin existe, pegar um `rsvp_token` para teste de UI.

## Passos

IDs do projeto/serviço: `docs/checkpoints/project-state.md`.

1. Escrever um script temporário **fora do repo** (ex. `/tmp/wedding-query.ts`)
   usando `postgres` e `process.env.DATABASE_URL`. Só `SELECT`.
2. Enviar via SSH da API (o container tem `bun` + `postgres` + `DATABASE_URL`):

```bash
b64=$(base64 < /tmp/wedding-query.ts | tr -d '\n')
railway ssh \
  --project <PROJECT_ID> \
  --environment <ENV_ID> \
  --service wedding-app-api \
  -- "echo $b64 | base64 -d > /app/.tmp-query.ts && bun /app/.tmp-query.ts; rc=\$?; rm -f /app/.tmp-query.ts; exit \$rc"
```

3. Apagar o arquivo local em `/tmp`.
4. Tabelas úteis: `"user"`, `account`, `guests`, `weddings`, `gifts`.
   `user` é palavra reservada — sempre `"user"`.

Exemplo de conferência de admin (sem senha):

```ts
const users = await sql`select id, email, name, role from "user"`
const accounts = await sql`
  select u.email, a.provider_id, (a.password is not null) as has_password
  from account a join "user" u on u.id = a.user_id`
```

## Não fazer

- Não imprimir `password` de `account` nem `BETTER_AUTH_SECRET`.
- Não usar `railway run env` / `printenv` e colar o output no chat.
- Não `UPDATE`/`DELETE` por este runbook — se precisar mutar, documento
  separado e confirmação explícita.
- Não deixar `/app/.tmp-query.ts` no container.
