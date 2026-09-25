# Runbook — publicar um serviço no Railway

Documento vivo. Atualizar quando branches ou rootDirectory mudarem.

## Quando

Código pronto para produção. Ver ADR `003` para saber **qual branch**.

## Passos

1. Identificar o serviço afetado:

| Mudança em | Serviço | Branch |
|---|---|---|
| `wedding-app-api/` | `wedding-app-api` | `main` |
| `wedding-app-adm/` | `wedding-app-adm` | `main` |
| `wedding-app-front/` | `wedding-app-front` | `layout-v2` |
| `docs/` / README raiz | nenhum deploy de app | as duas, para o git ficar alinhado |

2. Se a alteração de front também precisa existir em `main` (ou o
   contrário), aplicar o patch no conteúdo da branch destino. Cherry-pick
   cru de `layout-v2` → `main` costuma conflitar em Svelte.

3. Commit na branch correta e `git push origin <branch>`. O GitHub
   autodeploy dispara o serviço cujo `rootDirectory` bate com os arquivos.

4. Esperar `SUCCESS` **daquele** deployment:

```bash
railway deployment list --service <nome> --environment production --limit 5 --json
```

5. `railway up` local só se o autodeploy não existir. Rodar **na raiz do
   git** com `--project`, `--environment`, `--service`. Não usar
   `--path-as-root` na pasta do app (já falhou com `prefix not found`).

6. Front: validar em `https://eduardoemayra.com.br`. Admin: validar login
   em `https://wedding-app-adm-production.up.railway.app/login`.

## Não fazer

- Não reportar sucesso só com upload (`up --detach`). Precisa de
  `status: SUCCESS` no deployment enviado.
- Não commitar `.env`.
- Não assumir que push em `main` atualizou o site público.
