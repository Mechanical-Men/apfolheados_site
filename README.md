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
npm test         # Busca, filtros, favoritas e mensagens
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
| `src/data/products.ts` | Peças, códigos, categorias e nomes das fotos |
| `src/data/content.ts` | Passos da revenda, FAQ, mensagem pronta e guia de cuidados |
| `src/data/testimonials.ts` | Depoimentos de sacoleiras |
| `src/styles/global.css` | Paleta, tipografia, layout e regras responsivas |
| `src/scripts/site.ts` | Busca, filtros, favoritas, menu, diálogos e formulário |
| `src/lib/catalog.ts` | Funções de catálogo e preparação de mensagens |
| `public/assets/pecas/` | Fotos das peças (uma por item de `products.ts`) |
| `public/assets/` | Fotos do hero e da revenda, logo e favicon |
| `public/fonts/` | Fontes locais e suas licenças |

As cores ficam nas variáveis CSS do `:root`: `--black`, `--gold`, `--light-gold` e `--ivory`.

## Funcionamento

- A página e as peças são geradas em HTML durante o build. Com JavaScript ativo, o catálogo mostra 12 peças por vez e oferece busca, filtros e o botão "Ver mais peças".
- As favoritas usam a chave `apfolheados.favorites.v1` do navegador, preservando as favoritas da versão anterior.
- O formulário prepara uma mensagem localmente. Não existe cadastro, banco de dados ou envio automático.
- Imagens e fontes são locais. A abertura do WhatsApp depende do serviço externo.
- As fotos das peças, da revenda e do bloco "Banho que dura" ainda são provisórias. Troque pelas fotos reais da AP antes do lançamento.
- Dados marcados com `[PREENCHER]` no código (WhatsApp, Instagram, CNPJ, endereço, condições do consignado, depoimentos) são **mock** e não podem ir ao ar sem confirmação. Rode `npm run preencher` para listar todos.

## Configurar o contato oficial

Em `src/config/brand.ts`, preencha `whatsapp` com o número confirmado, incluindo país e DDD, apenas dígitos, e `whatsappDisplay` com o número formatado. O valor atual é mock. Se `whatsapp` ficar vazio, o WhatsApp abre para a pessoa escolher o contato, e o botão e a nota do formulário se adaptam.

## Publicar

Execute `npm run build` e publique o conteúdo de `dist/` em uma hospedagem estática. Nenhum adaptador de servidor é necessário. O projeto preserva sua configuração de hospedagem do Sites em `.openai/hosting.json`.

Não há dependência de React, banco ou API para esta versão. As fontes incluem suas licenças em `public/fonts/`.
