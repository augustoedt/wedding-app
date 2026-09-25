# Issue — app-logic.md ainda descreve lock de 24h

- **Aberta**: 2026-09-17
- **Status**: aberta

## Problema

`wedding-app-api/src/index.ts` usa
`PAYMENT_APPROVAL_DEADLINE_MS = 7 * 24 * 60 * 60 * 1000`.
O contrato em `docs/contracts/api.md` ainda diz que o cron reativa o
presente em 24h e a tabela de `GiftPayment` fala “após 24h sem
confirmação”.

## Por que ainda não é plano

Correção pontual de documentação do contrato, sem mudança de código.
Editar `docs/contracts/api.md` e depois arquivar esta issue.
