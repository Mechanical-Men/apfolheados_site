# AP Folheados · Astro

Site da AP Folheados migrado para **Astro 7 + TypeScript**, com geração estática. Mantém a logo versão 3, preto e dourado, Cormorant Garamond e Montserrat, imagens e interações do layout aprovado.

## Executar localmente

Use Node.js **22.22 ou superior em uma versão LTS**. O arquivo `.nvmrc` seleciona Node 24.

```bash
npm ci
npm run dev
```

Abra o endereço informado pelo Astro, normalmente `http://localhost:4321`.

```bash
npm run check    # Tipos e componentes Astro
npm test         # Filtros, telefone e mensagens
npm run build    # Gera dist/ para publicação
npm run preview  # Confere o build local
npm run preencher # Lista os dados provisórios [PREENCHER] que faltam confirmar
```

O `package-lock.json` fixa as versões instaladas. Para instalar depois de alterar dependências, use `npm install`.

## Onde editar

| Arquivo ou pasta | Conteúdo |
| --- | --- |
| `src/pages/index.astro` | Composição da página inicial |
| `src/layouts/BaseLayout.astro` | HTML base, metadados e carregamento do script |
| `src/components/` | Cabeçalho, hero, catálogo, história e banho, revenda, Central da Sacoleira, depoimentos, FAQ, contato e rodapé |
| `src/components/Brand.astro` | Assinatura da marca com slogan |
| `src/components/IconSymbols.astro` | Logo versão 3 e ícones SVG |
| `src/config/brand.ts` | Nome, descrição, WhatsApp, Instagram e dados da empresa (CNPJ, endereço, atendimento) |
| `src/data/products.ts` | Tipo das peças e lista de categorias (iguais às do painel) |
| `src/lib/sanity.ts` | Busca as peças publicadas no Sanity durante o build |
| `studio-apfolheados/` | Painel do Sanity onde a equipe cadastra as peças |
| `src/data/content.ts` | Passos da revenda, FAQ, mensagem pronta e guia de cuidados |
| `src/data/testimonials.ts` | Depoimentos de sacoleiras |
| `src/styles/global.css` | Paleta, tipografia, layout e regras responsivas |
| `src/scripts/site.ts` | Filtros, menu, diálogos, carrossel, FAQ animado e formulário |
| `src/lib/catalog.ts` | Funções de catálogo e preparação de mensagens |
| `public/assets/` | Fotos do hero e da revenda, logo e favicon |
| `public/fonts/` | Fontes locais e suas licenças |

As cores ficam nas variáveis CSS do `:root`: `--black`, `--gold`, `--light-gold` e `--ivory`.

## Funcionamento

- As peças vêm do painel do Sanity (projeto `r0yuqtt4`, dataset `production`) e são geradas em HTML durante o build. Só peças publicadas aparecem, das mais novas para as mais antigas.
- A página é gerada em HTML durante o build. Com JavaScript ativo, o catálogo mostra 12 peças por vez e oferece filtro por categoria e o botão "Ver mais peças".
- O formulário prepara uma mensagem localmente. Não existe cadastro, banco de dados ou envio automático.
- Imagens e fontes são locais. A abertura do WhatsApp depende do serviço externo.
- As fotos da revenda e do bloco "Banho que dura" ainda são provisórias. Troque pelas fotos reais da AP antes do lançamento.
- Dados marcados com `[PREENCHER]` no código (WhatsApp, Instagram, CNPJ, endereço, condições do consignado, depoimentos) são **mock** e não podem ir ao ar sem confirmação. Rode `npm run preencher` para listar todos.

## Configurar o contato oficial

Em `src/config/brand.ts`, preencha `whatsapp` com o número confirmado, incluindo país e DDD, apenas dígitos, e `whatsappDisplay` com o número formatado. O valor atual é mock. Se `whatsapp` ficar vazio, o WhatsApp abre para a pessoa escolher o contato, e o botão e a nota do formulário se adaptam.

## Publicar

Execute `npm run build` e publique o conteúdo de `dist/` em uma hospedagem estática. Nenhum adaptador de servidor é necessário. O projeto preserva sua configuração de hospedagem do Sites em `.openai/hosting.json`.

Não há dependência de React, banco ou API para esta versão. As fontes incluem suas licenças em `public/fonts/`.

## Peças (Sanity)

A equipe cadastra as peças no painel em `studio-apfolheados/` (código, fotos e categoria).

```bash
npm --prefix studio-apfolheados run dev     # painel local em http://localhost:3333
npm --prefix studio-apfolheados run deploy  # publica o painel em <nome>.sanity.studio
```

O site lê as peças publicadas no build. Em `npm run dev`, cada recarga busca de novo. Em produção, uma peça nova só aparece depois de um novo deploy. Para isso acontecer sozinho ao publicar:

1. Na Vercel, em **Settings → Git → Deploy Hooks**, crie um hook para a branch `main` e copie a URL.
2. No Sanity, em **sanity.io/manage → projeto → API → Webhooks**, crie um webhook com essa URL, dataset `production`, método `POST`, gatilhos *Create*, *Update* e *Delete* e filtro `_type == "peca"`.

As categorias precisam ser iguais em `src/data/products.ts` e em `studio-apfolheados/schemaTypes/peca.ts`.
