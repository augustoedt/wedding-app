# Runbook — prévia do convite no WhatsApp

Documento vivo. Atualizar quando as tags OG ou o domínio mudarem.

## Quando

O card do WhatsApp mostra favicon, título “Confirmação de Presença” ou
foto antiga, em vez da imagem de compartilhamento.

## Passos

1. Confirmar o HTML **como o robô vê** (não o Chrome logado):

```bash
curl -sL -A 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' \
  'https://eduardoemayra.com.br/confirmacao/<TOKEN>' \
  | rg -o '<title>[^<]*</title>|<meta[^>]+(og:title|og:image)[^>]*>'
```

Esperado: `og:title` = título do casamento; `og:image` = URL do B2
gravada em `weddings.og_image` (fallback `cover_image`).

2. Se `og:image` estiver ausente, o front não está no commit de
   `WeddingLayout` (ADR `006`) ou o deploy do front não foi para
   `layout-v2`.
3. Se as tags estão certas e o WhatsApp ainda mostra o antigo: **cache**.
   Mensagem já enviada não atualiza. Enviar **mensagem nova** com
   `?v=2` (ou outro query) no link. O RSVP ignora o query string.
4. Conferir que a URL da imagem responde `200` e `Content-Type: image/jpeg`
   (ou png/webp) para o mesmo User-Agent.
5. Recorte estranho: a foto atual é vertical. Trocar no admin
   (Configurações → Compartilhamento) por 1200×630.

## Não fazer

- Não “corrigir” reenviando o mesmo link sem query — o cache permanece.
- Não apontar `og:image` para o favicon hashed (`/_app/immutable/assets/ico.*.png`).
- Não alterar o `rsvp_token` de um convidado só para furar cache.
