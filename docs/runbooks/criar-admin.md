# Runbook — criar usuário admin

Documento vivo. Atualizar quando o script ou as env vars mudarem.

## Quando

Banco novo, ou o e-mail admin ainda não existe. O boot da API já tenta
isso (`bun run deploy` → `db:migrate` && `create-admin` && `start`).

## Passos

1. Variáveis no serviço `wedding-app-api`: `ADMIN_EMAIL`, `ADMIN_NAME`,
   `ADMIN_PASSWORD`, `BETTER_AUTH_SECRET`, `DATABASE_URL`.
2. O script `wedding-app-api/scripts/create-admin.ts`:
   - se o e-mail já existe, **sai 0 sem alterar senha**;
   - senão, `signUpEmail` + `role = admin`.
3. Local:

```bash
cd wedding-app-api
bun run db:migrate
bun run create-admin --email=... --name=... --password=...
```

4. Produção: o start command já chama `create-admin`. Redeploy depois de
   setar as env vars. Não passar senha na linha de comando do SSH.

## Não fazer

- Não reusar este script para **trocar** senha de admin existente — ele
  não atualiza.
- Não logar a senha.
- Não criar o admin pela rota pública de sign-up (não promove a `admin`).
