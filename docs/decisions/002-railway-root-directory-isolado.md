# ADR — Railway com rootDirectory isolado por serviço

- **Data**: 2026-06-11
- **Status**: vigente

## Contexto

O Railway precisa de um start/build por serviço. Compartilhar o workspace
raiz no build exige filtrar workspaces e arrasta lockfile/monorepo inteiro.
A alternativa isolada faz cada serviço ver só a própria pasta.

## Decisão

Cada serviço Railway usa `source.rootDirectory` apontando para a pasta do
app (`/wedding-app-api`, `/wedding-app-adm`, `/wedding-app-front`). O
builder instala dependências **dentro** da pasta, sem o `bun.lock` da raiz.

## Consequências

- (+) Deploys independentes; mudança no front não reconstrói a API.
- (−) Cada pasta precisa do próprio `package.json` + lockfile coerente.
- ⚠️ `bun install` na raiz atualiza o lockfile do workspace, **não** o da
  pasta isolada. Sintoma já visto: admin falhou com
  `lockfile had changes, but lockfile is frozen` até `694f67d`.
- ⚠️ `railway up ./wedding-app-api --path-as-root` pode falhar
  (`prefix not found`). Preferir autodeploy GitHub ou `railway up` na raiz
  com `--service`.
