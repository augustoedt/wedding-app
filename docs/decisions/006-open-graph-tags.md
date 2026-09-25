# ADR — Publicar og:image a partir do casamento

- **Data**: 2026-09-17
- **Status**: vigente

## Contexto

O admin já gravava `ogImage` (e `coverImage`). O HTML público só tinha
`<title>`, `<meta name="description">` e favicon. Sem `og:image`, o
WhatsApp escolhia fallback — na prática algo parecido com o favicon — em
vez da foto configurada
(`…/wedding/eduemay/ad013b7f-6176-450f-ae86-886414bbd237.jpeg`).

## Decisão

`WeddingLayout` emite tags Open Graph / Twitter usando
`wedding.ogImage ?? wedding.coverImage`. Vale para home, RSVP, presentes,
cerimônia e mensagens (todas usam o layout).

## Consequências

- (+) Robôs do WhatsApp/Facebook passam a receber a foto do convite.
- ⚠️ Mensagens **já enviadas** continuam com a prévia antiga (cache).
  Testar com `?v=2` numa mensagem nova. Runbook `preview-whatsapp.md`.
- ⚠️ A imagem atual é vertical (~2520×3674). WhatsApp pode recortar.
  Ideal: horizontal 1200×630 no campo Open Graph do admin.
