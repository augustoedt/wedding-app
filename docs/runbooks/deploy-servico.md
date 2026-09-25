# Runbook — publicar um serviço no Railway

Documento vivo. Atualizar quando branches ou rootDirectory mudarem.

## Quando

Código pronto para produção. Todos os serviços deployam de `main` (ADR `003`).

## Passos

1. Identificar o serviço afetado:

| Mudança em | Serviço | Branch |
|---|---|---|
| `wedding-app-api/` | `wedding-app-api` | `main` |
| `wedding-app-adm/` | `wedding-app-adm` | `main` |
| `wedding-app-front/` | `wedding-app-front` | `main` |
| `docs/` / README raiz | nenhum deploy de app | `main` |

2. Commit em `main` e `git push origin main`. O GitHub autodeploy dispara
   o serviço cujo `rootDirectory` bate com os arquivos.

3. Esperar `SUCCESS` **daquele** deployment:

```bash
railway deployment list --service <nome> --environment production --limit 5 --json
```

4. `railway up` local só se o autodeploy não existir. Rodar **na raiz do
   git** com `--project`, `--environment`, `--service`. Não usar
   `--path-as-root` na pasta do app (já falhou com `prefix not found`).

5. Front: validar em `https://eduardoemayra.com.br`. Admin: validar login
   em `https://wedding-app-adm-production.up.railway.app/login`.

## Não fazer

- Não reportar sucesso só com upload (`up --detach`). Precisa de
  `status: SUCCESS` no deployment enviado.
- Não commitar `.env`.
- Não apontar o front de volta para `layout-v2` sem ADR novo.
