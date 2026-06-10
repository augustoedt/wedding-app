Revise um módulo ou conjunto de alterações verificando conformidade com a arquitetura do projeto.

## O que revisar: $ARGUMENTS

---

## Antes de revisar

Leia os arquivos completos — não avalie trechos isolados. Se necessário, leia também módulos vizinhos para verificar consistência entre eles.

---

## Checklist

### Separação de camadas
- [ ] Rotas não fazem queries diretamente no banco
- [ ] Services não importam tipos de HTTP (Request, Response, status codes)
- [ ] Repositories não lançam erros HTTP — retornam `null` ou dados puros
- [ ] Lógica de negócio está no service, não espalhada na rota

### Padrão de factories
- [ ] Todos os artefatos são exportados como factories (`createX`)
- [ ] Nenhuma dependência é instanciada diretamente dentro de outra camada
- [ ] O singleton de produção é exportado separadamente

### Tratamento de erros HTTP
- [ ] `null` do service → 404
- [ ] Acesso negado → 403
- [ ] Erro de domínio → 400
- [ ] Conflito / duplicidade → 409
- [ ] Nenhum erro sendo silenciado com resposta 200 indevida
- [ ] Nenhum stack trace ou detalhe interno vazando para o cliente

### Validação de input
- [ ] Todo input validado via schema antes de chegar ao service
- [ ] Nenhuma validação inline na rota
- [ ] Tipos inferidos dos schemas são usados nas camadas internas

### Autenticação e autorização
- [ ] Rotas protegidas usam o middleware/macro correto
- [ ] ID do usuário vem do contexto autenticado, nunca do body
- [ ] Permissões verificadas antes de mutações
- [ ] 403 retornado quando existe mas sem acesso (não 404 que vaza existência)

### Banco e migrations
- [ ] Nenhuma query SQL raw dentro de rotas ou services
- [ ] Se tabela nova: schema no arquivo de domínio correto
- [ ] Se tabela nova: utilitários de teste atualizados
- [ ] Índices declarados para colunas de filtro frequente

### Qualidade geral
- [ ] Nenhuma lógica duplicada entre módulos (verificar se já existe utilitário)
- [ ] Nenhuma refatoração estrutural misturada com feature nova
- [ ] Nomes de funções e variáveis descrevem o domínio, não a implementação
- [ ] Sem comentários que apenas repetem o que o código já diz

---

## Como reportar

Para cada item com problema:
- Arquivo e linha aproximada
- O que está errado e por quê viola o padrão
- Como corrigir mantendo consistência com o restante do projeto

Se tudo estiver correto, confirme explicitamente quais pontos foram verificados.
