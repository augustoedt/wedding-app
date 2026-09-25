# Runbook — login do admin falha

Documento vivo. Atualizar quando a rotina mudar.

## Quando

`wedding-app-adm-production.up.railway.app/login` responde
“Invalid email or password” ou “Credenciais inválidas”, ou o serviço API
não sobe.

## Passos

1. Abrir o login, submeter, e olhar a resposta de
   `/_app/remote/.../signIn`. `200` com `success: false` significa que o
   adm alcançou a API; falha de rede viria como mensagem de conexão.
2. Logs da API:

```bash
railway logs --service wedding-app-api --environment production --since 1h --lines 200 --json
```

3. Interpretar:
   - `User not found` com usuário existente no banco → schema/versão
     Better Auth (ADR `004`). Conferir
     `node -p "require('/app/node_modules/better-auth/package.json').version"`
     via `railway ssh --service wedding-app-api`. Esperado: `1.6.18`.
   - `You are using the default secret` → falta `BETTER_AUTH_SECRET`.
     Setar no serviço (não commitar o valor) e deixar o redeploy rodar.
   - `Admin <email> já existe, nada a fazer` no boot **não** prova que a
     senha está correta; só que a linha em `"user"` existe.
4. Conferir a linha do usuário (sem hash) com
   [`inspecionar-banco-producao.md`](inspecionar-banco-producao.md).
5. Se a versão for 1.7.x: **não** gerar schema na hora. Voltar para
   1.6.18 ou seguir `docs/plans/migrar-better-auth-1-7.md`.

## Não fazer

- Não apagar o usuário admin “para recriar” sem backup — o script
  `create-admin` não atualiza senha se o e-mail já existe.
- Não soltar `"better-auth": "latest"` de novo.
- Não assumir que o problema é senha errada só pela mensagem genérica
  do Better Auth.
