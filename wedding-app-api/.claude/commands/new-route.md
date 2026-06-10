Adicione uma nova rota a um módulo existente.

## O que adicionar: $ARGUMENTS

---

## Antes de começar

Leia os arquivos do módulo alvo antes de escrever qualquer código:
- `model.ts` — para entender os schemas existentes e seguir o mesmo padrão
- `index.ts` — para ver como as rotas estão registradas
- `service.ts` e `repository.ts` — para saber o que já existe e evitar duplicação

---

## Qual arquivo tocar

Só altere o que a feature exige:

| O que muda | Arquivos a alterar |
|---|---|
| Novo endpoint | `index.ts` + `model.ts` (sempre) |
| Nova lógica de negócio | `service.ts` |
| Nova query no banco | `repository.ts` |

Não refatore o que não precisa mudar. Não adicione camadas desnecessárias.

---

## Fluxo obrigatório

```
HTTP request
  → model valida o input (params, query, body)
  → rota chama service
  → service chama repository
  → rota traduz o retorno para status HTTP
```

---

## Tradução de erros (na rota)

```
service retorna null         → 404 Not Found
acesso negado                → 403 Forbidden
erro de validação de domínio → 400 Bad Request
conflito / duplicidade       → 409 Conflict
```

---

## Validação de input

- Todo schema de input vai em `model.ts` — nunca inline na rota
- Params, query string, body e response têm schemas separados
- Tipos gerados pelos schemas devem ser usados no service e repository

---

## Autenticação

- Se a rota exige login: use o middleware/macro de autenticação do projeto
- O ID do usuário autenticado deve vir do contexto injetado, não do body
- Nunca confie em IDs vindos do cliente para identificar o usuário atual

---

## Controle de acesso

- Valide permissão antes de qualquer mutação
- Retorne 403 (não 404) quando o recurso existe mas o usuário não tem acesso
- Nunca exponha a existência de um recurso para quem não tem permissão de vê-lo

---

## Operações assíncronas (se aplicável)

Para operações demoradas (imports, processamentos em lote):

```
POST /recurso/import
  → 202 Accepted { importId, status: "accepted", totalRows }
  → processa em background
GET /recurso/import/:importId
  → { status: "pending" | "processing" | "done" | "failed" }
```

---

## Documentação da rota

Adicione metadados OpenAPI/Swagger ao endpoint:
- Tag do módulo
- Summary descritivo
- Security scheme se autenticado

---

## Passos

1. Leia os arquivos do módulo antes de escrever
2. Declare o schema no `model.ts`
3. Adicione query no `repository.ts` se necessário
4. Adicione lógica no `service.ts` se necessário
5. Adicione o handler no `index.ts` com tradução de erros
6. Se adicionou coluna nova: gere migration e atualize utilitários de teste
