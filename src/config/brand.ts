/**
 * Dados oficiais da marca, centralizados aqui.
 * Os valores marcados com [PREENCHER] são provisórios (mock) e precisam ser
 * confirmados com a AP antes da publicação. Liste todos com `npm run preencher`.
 */
export const brand = {
  name: 'AP Folheados',
  tagline: 'Brilho que dura.',
  title: 'AP Folheados — Semijoias para revender',
  description: 'AP Folheados. Semijoias com banho reforçado e revenda em consignado para revendedoras de Itaperuna, Rio, Minas e Espírito Santo há mais de 30 anos.',
  // WhatsApp oficial: 55 + DDD + número, só dígitos.
  whatsapp: '5522999264479',
  whatsappDisplay: '(22) 99926-4479',
  // [PREENCHER: usuário do Instagram, sem @] (mock)
  instagramUser: 'apfolheados',
  company: {
    // [PREENCHER: razão social oficial] (mock; escondida no rodapé até ser preenchida)
    legalName: 'AP Folheados Ltda.',
    cnpj: '06.339.073/0001-99',
    city: 'Itaperuna, RJ',
  },
} as const;

export const instagramUrl = `https://instagram.com/${brand.instagramUser}`;
