# ADR — CTA explícito de presentes após o RSVP

- **Data**: 2026-09-17
- **Status**: vigente

## Contexto

Pedido do cliente: depois de confirmar (ou recusar) presença, o caminho
para a lista de presentes não era óbvio. Alternativas: botão “Confira os
presentes” ou redirect automático (~3 s) após uma mensagem.

Redirect automático tira o convidado da tela contra a vontade, inclusive
quem só queria alterar a resposta.

## Decisão

Botão explícito **Confira os presentes** na tela de sucesso do RSVP
(`wedding-app-front/.../confirmacao/[token]/+page.svelte`), acima de
“Alterar resposta”, apontando para `/presentes`. Sem redirect automático.
Visível tanto para `confirmed` quanto para `declined`.

## Consequências

- (+) Convidado que não vai ao evento ainda pode presentear.
- (+) Sem surpresa de navegação.
- (−) Quem ignora o botão continua podendo ir pelo menu.
