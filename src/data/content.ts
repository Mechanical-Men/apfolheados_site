/**
 * Textos da revenda, do FAQ e da Central da Sacoleira.
 * Respostas marcadas com [PREENCHER] são provisórias (mock) e precisam ser
 * confirmadas com a AP antes da publicação. Liste todas com `npm run preencher`.
 */

export const careTips = [
  'Evite perfume e cremes diretamente na peça.',
  'Evite contato com água do mar.',
  'Guarde separadamente, em local seco.',
  'Limpe com uma flanela macia.',
] as const;

export const careGuideText = `Cuidados com suas semijoias\n\n${careTips.map(tip => `• ${tip}`).join('\n')}\n\nConsulte a AP para as orientações específicas de cada peça.`;

export const clientMessageTemplate = 'Olá! Chegaram peças novas da AP Folheados e separei algumas que combinam com você. Quer que eu te mostre as fotos?';

export interface ResaleStep { title: string; text: string }

export const resaleSteps: readonly ResaleStep[] = [
  { title: 'Chame a gente no WhatsApp', text: 'Conte sua cidade e se já revende. A equipe explica as condições.' },
  // [PREENCHER: confirmar se há investimento inicial, caução ou ficha de cadastro] (mock: ficha simples, sem investimento)
  { title: 'Receba o seu mostruário', text: 'Peças consignadas, sem precisar comprar estoque. Basta uma ficha de cadastro simples, sem investimento inicial.' },
  { title: 'Venda no seu ritmo', text: 'Mostre as peças, use as fotos e mensagens prontas da Central da Sacoleira.' },
  // [PREENCHER: prazo do acerto e como funciona a comissão ou margem] (mock: 30 dias, 30%)
  { title: 'Faça o acerto', text: 'Você devolve o que não vendeu e acerta só as peças vendidas. O acerto é a cada 30 dias, com 30% de comissão sobre as vendas.' },
];

export interface FaqItem { question: string; answer: string }

export const faq: readonly FaqItem[] = [
  { question: 'Como faço para ser sacoleira AP?', answer: 'Chame no WhatsApp, conte sua cidade e a equipe explica tudo.' },
  // [PREENCHER: precisa comprar estoque ou pagar algo para começar?] (mock)
  { question: 'Preciso comprar estoque ou pagar algo para começar?', answer: 'Não. Você começa com um mostruário consignado, sem comprar estoque e sem investimento inicial. A equipe só pede uma ficha de cadastro simples.' },
  // [PREENCHER: como funciona o consignado e o acerto] (mock)
  { question: 'Como funciona o consignado e o acerto?', answer: 'Você fica com o mostruário por 30 dias. No acerto, devolve as peças que não vendeu, paga só as vendidas e já pode levar um mostruário renovado.' },
  // [PREENCHER: margem ou comissão, ou "você define seu preço de venda"] (mock)
  { question: 'Quanto eu ganho por peça?', answer: 'Você ganha 30% de comissão sobre o valor de cada peça vendida.' },
  // [PREENCHER: lista de cidades atendidas ou "consulte pelo WhatsApp"] (mock)
  { question: 'Vocês atendem a minha cidade?', answer: 'Atendemos Itaperuna e cidades do Rio, Minas e Espírito Santo, como Bom Jesus do Itabapoana, Campos dos Goytacazes, Muriaé e Cachoeiro de Itapemirim. Se a sua não estiver na lista, consulte pelo WhatsApp.' },
  { question: 'Posso usar as fotos do site para vender?', answer: 'Sim. Abra uma peça para baixar a imagem disponível ou preparar uma mensagem no WhatsApp. A mensagem só é enviada quando você escolher o contato e confirmar no aplicativo.' },
  // [PREENCHER: política de troca] (mock)
  { question: 'E se uma peça der problema?', answer: 'Peças com defeito de fabricação são trocadas em até 90 dias. Fale com a equipe pelo WhatsApp informando o código da peça.' },
  { question: 'Como conservar o brilho?', answer: 'Evite perfume e cremes diretamente na peça e contato com água do mar. Guarde as semijoias separadas, em local seco, e limpe com uma flanela macia. Consulte orientações específicas com a AP.' },
];
