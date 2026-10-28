export interface Testimonial {
  quote: string;
  name: string;
  city: string;
  since: string;
  /** Optional round photo inside public/assets/depoimentos/. Without it, the initials are shown. */
  photo?: string;
}

/**
 * Depoimentos de revendedoras. Para adicionar mais, inclua um item neste array.
 * [PREENCHER: depoimentos reais, com nome, cidade e tempo de revenda autorizados] (mock)
 * Os depoimentos abaixo são fictícios e NÃO podem ir ao ar.
 */
export const testimonials: readonly Testimonial[] = [
  {
    // [PREENCHER: depoimento real] (mock)
    quote: 'Comecei para ter uma renda extra e hoje é a minha principal. As clientes voltam porque a peça dura.',
    // [PREENCHER: nome] (mock)
    name: 'Mariana S.',
    // [PREENCHER: cidade] (mock)
    city: 'Itaperuna, RJ',
    // [PREENCHER: vende AP há X anos] (mock)
    since: 'Vende AP há 8 anos',
  },
  {
    // [PREENCHER: depoimento real] (mock)
    quote: 'O acerto é tranquilo: devolvo o que não vendi e pronto. Nunca precisei comprar estoque.',
    // [PREENCHER: nome] (mock)
    name: 'Cláudia R.',
    // [PREENCHER: cidade] (mock)
    city: 'Muriaé, MG',
    // [PREENCHER: vende AP há X anos] (mock)
    since: 'Vende AP há 3 anos',
  },
  {
    // [PREENCHER: depoimento real] (mock)
    quote: 'Uso as fotos e as mensagens prontas no WhatsApp. Ficou muito mais fácil mostrar as peças.',
    // [PREENCHER: nome] (mock)
    name: 'Patrícia L.',
    // [PREENCHER: cidade] (mock)
    city: 'Cachoeiro de Itapemirim, ES',
    // [PREENCHER: vende AP há X anos] (mock)
    since: 'Vende AP há 12 anos',
  },
  {
    // [PREENCHER: depoimento real] (mock)
    quote: 'Comecei sem experiência nenhuma. A equipe me explicou tudo e no primeiro mês já vendi quase o mostruário inteiro.',
    // [PREENCHER: nome] (mock)
    name: 'Juliana M.',
    // [PREENCHER: cidade] (mock)
    city: 'Bom Jesus do Itabapoana, RJ',
    // [PREENCHER: vende AP há X anos] (mock)
    since: 'Vende AP há 1 ano',
  },
  {
    // [PREENCHER: depoimento real] (mock)
    quote: 'Minhas clientes perguntam quando chega peça nova. O banho aguenta o dia a dia e ninguém volta reclamando.',
    // [PREENCHER: nome] (mock)
    name: 'Rosângela F.',
    // [PREENCHER: cidade] (mock)
    city: 'Campos dos Goytacazes, RJ',
    // [PREENCHER: vende AP há X anos] (mock)
    since: 'Vende AP há 15 anos',
  },
];

export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]!.toUpperCase()).join('');
