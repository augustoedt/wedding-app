Crie um novo módulo completo seguindo a arquitetura em camadas deste projeto.

## Módulo a criar: $ARGUMENTS

---

## Antes de começar

Leia os arquivos existentes para entender os padrões reais do projeto:
- Um módulo já existente como referência de estrutura
- O arquivo de bootstrap/app para saber como registrar o novo módulo
- O schema do banco para entender convenções de tipos e nomenclatura

---

## Estrutura obrigatória

Crie os arquivos na pasta do módulo seguindo a separação de responsabilidades:

| Arquivo | Responsabilidade |
|---|---|
| `model.ts` | Schemas de validação (params, query, body, response) |
| `repository.ts` | Acesso ao banco — sem conhecimento de HTTP |
| `service.ts` | Regra de negócio — orquestra repositories |
| `index.ts` | Rotas HTTP — valida input, chama service, traduz para status code |

---

## Padrão de factories

Todos os módulos devem exportar factories em vez de instâncias diretas:

```ts
// repository.ts
export function createXRepository(database: Database) {
  return {
    findById(id: string) { ... },
    // ...
  }
}

// service.ts
export function createXService(database: Database) {
  const repository = createXRepository(database)
  return {
    async getById(id: string) { ... },
    // ...
  }
}

// index.ts
export function createXRoutes({ service, authPlugin } = {}) {
  return new Router()
    .get("/x/:id", ({ params }) => service.getById(params.id))
}

// singleton para uso no app
export const xService = createXService(db)
```

---

## Separação de camadas — regras rígidas

- **Rotas** não fazem queries diretamente no banco
- **Services** não importam tipos de HTTP (Request, Response, status codes)
- **Repositories** não lançam erros HTTP — retornam `null` ou dados puros
- **Models** não contêm lógica — apenas schemas de validação

---

## Tradução de erros HTTP (na rota)

```
service retorna null         → 404 Not Found
acesso negado                → 403 Forbidden
erro de validação de domínio → 400 Bad Request
conflito / duplicidade       → 409 Conflict
erro inesperado              → 500 (não capturar silenciosamente)
```

---

## Registro no app

Após criar os arquivos, registre o módulo no bootstrap principal:

```ts
app.use(createXRoutes({ service: createXService(database), authPlugin }))
```

---

## Se precisar de nova tabela no banco

1. Declare o schema no ORM antes de criar os arquivos do módulo
2. Gere e aplique a migration
3. Atualize os utilitários de teste (ex: limpeza de tabelas entre testes)

---

## Passos

1. Leia um módulo existente como referência
2. Crie `model.ts`
3. Crie `repository.ts`
4. Crie `service.ts`
5. Crie `index.ts` com tradução de erros
6. Registre no bootstrap
7. Informe o que ainda precisa ser feito manualmente (migrations, seeds etc.)
