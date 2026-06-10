Adicione ou altere uma tabela no banco de dados.

## O que alterar: $ARGUMENTS

---

## Antes de começar

Leia os schemas existentes para entender:
- Onde ficam os arquivos de schema (ex: `src/db/schema/`)
- Convenções de nomes de tabelas, colunas e tipos
- Como IDs são modelados (UUID, serial, string externa etc.)
- Quais enums já existem e podem ser reutilizados

---

## Onde declarar o schema

Schemas ficam organizados por domínio — não concentre tudo em um único arquivo. Adicione na tabela do domínio correto. Só crie um arquivo novo se o domínio ainda não existir.

---

## Fluxo de migration

```
1. Altere o schema no ORM
2. Gere o arquivo de migration  →  bun run db:generate  (ou equivalente)
3. Revise o arquivo gerado antes de aplicar
4. Aplique ao banco              →  bun run db:migrate   (ou equivalente)
```

Verifique os scripts disponíveis em `package.json` antes de rodar.

**Evite `db:push`** em ambientes compartilhados ou produção — ele pula o arquivo de migration e impede rastreabilidade.

---

## Boas práticas

- Prefira `NOT NULL` com default a colunas anuláveis desnecessárias
- Nomes de colunas em snake_case
- Adicione índices para colunas usadas em filtros frequentes (`WHERE`, `JOIN`)
- Foreign keys devem ter ação explícita (`ON DELETE CASCADE` ou `RESTRICT`)
- Não remova colunas sem antes garantir que nenhum código as referencia

---

## Atualizar testes

Após criar uma nova tabela, atualize os utilitários de teste do projeto:
1. Declare a tabela no schema temporário de teste
2. Adicione-a na função de limpeza entre testes (ex: `clearTemporaryTables`)

Sem isso os testes de integração que usam banco vão falhar.

---

## Se a tabela ainda não tem um módulo

Use `/new-module` após a migration estar pronta para criar os arquivos do módulo.

---

## Passos

1. Leia o arquivo de schema do domínio relevante
2. Declare a tabela/coluna/índice no ORM
3. Gere a migration e revise o arquivo gerado
4. Atualize os utilitários de teste (schema + limpeza)
5. Informe se é necessário aplicar a migration manualmente
