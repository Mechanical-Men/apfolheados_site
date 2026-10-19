/**
 * Dados oficiais da marca, centralizados aqui.
 * Os valores marcados com [PREENCHER] são provisórios (mock) e precisam ser
 * confirmados com a AP antes da publicação. Liste todos com `npm run preencher`.
 */
export const brand = {
  name: 'AP Folheados',
  tagline: 'Brilho que dura.',
  title: 'AP Folheados — Semijoias para revender',
  description: 'AP Folheados. Semijoias com banho reforçado e revenda em consignado para sacoleiras de Itaperuna, Rio, Minas e Espírito Santo há mais de 30 anos.',
  // [PREENCHER: número oficial do WhatsApp, com 55 + DDD, só dígitos] (mock)
  whatsapp: '5522999999999',
  // [PREENCHER: número do WhatsApp como deve aparecer no site] (mock)
  whatsappDisplay: '(22) 99999-9999',
  // [PREENCHER: usuário do Instagram, sem @] (mock)
  instagramUser: 'apfolheados',
  company: {
    // [PREENCHER: razão social] (mock)
    legalName: 'AP Folheados Ltda.',
    // [PREENCHER: CNPJ] (mock)
    cnpj: '00.000.000/0001-00',
    // [PREENCHER: endereço completo] (mock)
    address: 'Rua Exemplo, 123, Centro',
    city: 'Itaperuna, RJ',
    // [PREENCHER: dias e horários de atendimento] (mock)
    hours: 'Segunda a sexta, das 8h às 18h · Sábado, das 8h às 12h',
  },
} as const;

export const instagramUrl = `https://instagram.com/${brand.instagramUser}`;
