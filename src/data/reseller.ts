/**
 * Conteúdo da Área da Revendedora, vindo do kit de vendas da AP (Guia de Vendas, Cola e
 * Mensagens Prontas) e da apresentação Seja Revendedora.
 *
 * Para colocar o vídeo de uma aula, preencha `video` com o endereço de incorporação
 * (YouTube ou Vimeo) ou com um arquivo .mp4. Sem vídeo, a aula mostra só o texto.
 *
 * TO_CONFIRM aparece no site como a etiqueta "A confirmar". Liste com `npm run preencher`.
 */

import { TO_CONFIRM } from '../lib/reseller.ts';

export interface LessonCard { mark?: string; title: string; text?: string; quote?: string; note?: string }

export type LessonBlock =
  | { type: 'text'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'cards'; layout?: 'grid' | 'list'; items: LessonCard[] }
  | { type: 'table'; head?: string[]; rows: string[][] }
  | { type: 'list'; items: string[] }
  | { type: 'flow'; items: string[] }
  | { type: 'week'; items: { day: string; text: string }[] }
  | { type: 'callout'; label: string; text: string }
  | { type: 'quote'; text: string }
  | { type: 'link'; href: string; label: string };

export interface Lesson {
  slug: string;
  menu: string;
  title: string;
  intro: string;
  /** Endereço de incorporação do vídeo ou arquivo .mp4. */
  video?: string;
  blocks: LessonBlock[];
}

/** Uma semana de Status, usada no guia e nas mensagens. */
export const statusWeek = [
  { day: 'SEG', text: 'Peça para o dia a dia' },
  { day: 'TER', text: 'Enquete: discreta ou marcante?' },
  { day: 'QUA', text: 'Combinação de duas peças' },
  { day: 'QUI', text: 'Vídeo de detalhe e tamanho' },
  { day: 'SEX', text: 'Ideias de presente' },
  { day: 'SÁB', text: 'Caixinha de perguntas' },
];

export const askFirst = [
  '“É para você ou para presente?”',
  '“Para o dia a dia ou para uma ocasião?”',
  '“Você gosta de peça delicada ou que chama atenção?”',
  '“Tem um valor em mente?”',
];

export const lessons: readonly Lesson[] = [
  {
    slug: 'seu-ciclo',
    menu: 'Seu ciclo de 40 dias',
    title: '40 dias, do kit ao acerto.',
    intro: 'Você recebe as peças em consignação, vende no seu ritmo e acerta com a AP só o que vendeu.',
    blocks: [
      { type: 'cards', items: [
        { mark: '01', title: 'Receba e confira', text: 'Confira cada peça do kit com a AP no dia da entrega.' },
        { mark: '02', title: 'Venda e anote', text: 'Anote cada venda no mesmo dia: peça, cliente, valor e se já pagou.' },
        { mark: '03', title: 'Receba', text: 'Receba das clientes antes da data do seu acerto.' },
        { mark: '04', title: 'Faça o acerto', text: 'Acerte as vendas, fique com sua comissão e devolva o que sobrou.' },
        { mark: '05', title: 'Repita', text: 'Peça a reposição dos modelos que mais saíram e comece outro ciclo.' },
      ] },
      { type: 'heading', text: 'Sua comissão' },
      { type: 'text', text: 'Até R$ 350: 30%. Acima de R$ 350: 35%. Calculada sobre o total que você vendeu no ciclo.' },
      { type: 'table', head: ['Vendeu', 'Comissão', 'Você ganha'], rows: [['R$ 300', '30%', 'R$ 90'], ['R$ 1.000', '35%', 'R$ 350'], ['R$ 2.000', '35%', 'R$ 700']] },
      { type: 'link', href: '/revendedora#ganhos', label: 'Abrir a calculadora de ganhos' },
      { type: 'callout', label: 'DICA', text: 'Marque no celular a data do acerto e um lembrete 5 dias antes. Assim dá tempo de receber das clientes e conferir o kit com calma.' },
      { type: 'callout', label: 'META', text: 'Chegue aos R$ 350 no ciclo. A partir daí sua comissão passa de 30% para 35%. Se estiver perto, uma ou duas vendas a mais fazem diferença.' },
    ],
  },
  {
    slug: 'conheca-o-produto',
    menu: 'Conheça o produto',
    title: 'O que é uma semijoia folheada.',
    intro: 'Quem entende o que vende responde qualquer pergunta com segurança.',
    blocks: [
      { type: 'text', text: 'A semijoia folheada é feita de um metal base, que dá forma e resistência à peça, coberto por camadas de ouro aplicadas por um processo chamado galvanoplastia. Por fora, ela tem a cor e o brilho do ouro. Por dentro, tem um metal mais acessível.' },
      { type: 'text', text: 'Quanto mais grossa a camada de ouro, mais tempo a peça mantém a cor. Essa espessura é medida em milésimos.' },
      { type: 'heading', text: 'Como a peça é feita' },
      { type: 'table', rows: [['Camada de ouro', 'Cor e brilho'], ['Camada de base', 'Ajuda o ouro a aderir'], ['Metal base', 'Forma e resistência']] },
      { type: 'heading', text: 'Joia, semijoia ou bijuteria?' },
      { type: 'table', head: ['', 'Do que é feita', 'Durabilidade', 'Preço'], rows: [
        ['Joia', 'Ouro ou prata maciços', 'Para a vida toda', 'Alto'],
        ['Semijoia folheada', 'Metal base + camadas de ouro', 'Longa, com cuidado', 'Acessível'],
        ['Bijuteria', 'Metal ou outros materiais, com acabamento fino ou pintura', 'Curta', 'Baixo'],
      ] },
      { type: 'heading', text: 'Ficha técnica das peças AP' },
      // [PREENCHER: banho, espessura, metal base, antialérgica, garantia e pedras]
      { type: 'table', rows: [
        ['Banho (ouro 18k, ródio…)', TO_CONFIRM],
        ['Espessura da camada', TO_CONFIRM],
        ['Metal base', TO_CONFIRM],
        ['Antialérgica (sem níquel)?', TO_CONFIRM],
        ['Garantia', TO_CONFIRM],
        ['Pedras usadas', TO_CONFIRM],
      ] },
    ],
  },
  {
    slug: 'cuidados-e-duvidas',
    menu: 'Cuidados e dúvidas das clientes',
    title: 'Respostas que passam segurança.',
    intro: 'Ensine estes cuidados em toda venda. Cliente que cuida bem da peça volta para comprar.',
    blocks: [
      { type: 'cards', items: [
        { mark: '01', title: 'Por último ao vestir', text: 'Coloque a peça depois de perfume, creme e maquiagem.' },
        { mark: '02', title: 'Primeiro ao tirar', text: 'Tire antes de dormir, tomar banho e fazer exercício.' },
        { mark: '03', title: 'Longe da água', text: 'Evite piscina, mar e produtos de limpeza.' },
        { mark: '04', title: 'Seca, sempre', text: 'Se molhar ou suar, seque com um pano macio.' },
        { mark: '05', title: 'Limpeza suave', text: 'Use flanela seca. Nada de pasta, álcool ou produto abrasivo.' },
        { mark: '06', title: 'Guarde separada', text: 'Em saquinho ou caixinha, para uma peça não riscar a outra.' },
      ] },
      { type: 'heading', text: 'O que as clientes mais perguntam' },
      // [PREENCHER: prazo da garantia e se as peças são antialérgicas]
      { type: 'cards', layout: 'list', items: [
        { title: '“Escurece?”', text: `Toda semijoia sofre desgaste com o tempo e o uso. Com os cuidados certos, o brilho dura muito mais. E as peças AP têm garantia de ${TO_CONFIRM}.` },
        { title: '“Dá alergia?”', text: `A alergia costuma vir do níquel presente em alguns metais. ${TO_CONFIRM} se as peças AP são antialérgicas. Se a cliente tem alergia, pergunte se ela já usa folheado sem reação.` },
        { title: '“Posso tomar banho com ela?”', text: 'É melhor não. Água, sabonete e suor aceleram o desgaste da camada de ouro.' },
        { title: '“Qual tamanho de anel?”', text: 'Pergunte o número que ela usa. Se não souber, compare com um anel que ela já tem e que serve bem.' },
        { title: '“Qual comprimento de colar?”', text: 'Cerca de 40 cm fica rente ao pescoço, 45 cm na altura da clavícula e 60 cm ou mais desce no decote.' },
      ] },
    ],
  },
  {
    slug: 'metodo-brilho',
    menu: 'Método BRILHO',
    title: 'Seis passos para toda venda.',
    intro: 'Do primeiro contato até a próxima compra. Comece aplicando um passo por vez.',
    blocks: [
      { type: 'quote', text: 'A melhor revendedora não é a que fala mais. É a que entende a cliente.' },
      { type: 'cards', layout: 'list', items: [
        { mark: 'B', title: 'Busque oportunidades', text: 'Comece por quem já confia em você: família, amigas, colegas de trabalho, da igreja e da academia.' },
        { mark: 'R', title: 'Reconheça o estilo', text: 'Pergunte antes de mostrar. Ocasião, estilo e quanto ela quer gastar.', quote: '“É para você ou para presente?”' },
        { mark: 'I', title: 'Inspire com combinações', text: 'Mostre duas ou três opções no estilo dela e sugira o que combina.', quote: '“Esse brinco fica lindo com o colar que você escolheu.”' },
        { mark: 'L', title: 'Leve à decisão', text: 'Ajude a escolher com uma pergunta simples, sem pressão.', quote: '“Qual das duas você gostou mais?”' },
        { mark: 'H', title: 'Honre a confiança', text: 'Entregue o combinado, ensine os cuidados e pergunte depois se ela gostou.' },
        { mark: 'O', title: 'Ofereça novidades', text: 'Quem comprou uma vez compra de novo. Avise quem pediu quando chegarem peças no estilo dela.' },
      ] },
    ],
  },
  {
    slug: 'atendimento',
    menu: 'Atendimento, do “oi” à venda',
    title: 'Do “oi” à venda.',
    intro: 'Perguntar antes de mostrar faz a cliente se sentir atendida e encurta a conversa.',
    blocks: [
      { type: 'flow', items: ['Pergunte', 'Mostre 2 ou 3', 'Compare', 'Feche', 'Pós-venda'] },
      { type: 'heading', text: 'Quatro perguntas que ajudam' },
      { type: 'list', items: askFirst },
      { type: 'heading', text: 'Para fechar' },
      { type: 'list', items: ['“Qual das duas você gostou mais?”', '“Prefere pagar no Pix ou no dinheiro?”', '“Posso separar para você?”'] },
      { type: 'heading', text: 'Quando a cliente hesita' },
      { type: 'cards', items: [
        { title: '“Achei caro.”', quote: '“Entendo! Tenho outras opções lindas numa faixa menor. Quer ver?”', note: 'Mostre uma alternativa mais em conta. Nunca dê desconto por conta própria.' },
        { title: '“Vou pensar.”', quote: '“Claro! Te mando as fotos para você olhar com calma.”', note: 'Mande as fotos e volte a falar em dois ou três dias, se ela concordar.' },
        { title: '“Será que é bom?”', quote: '“A AP está há mais de 30 anos na região, e eu te ensino os cuidados para durar.”', note: 'Fale da marca, da garantia e dos cuidados.' },
      ] },
      { type: 'callout', label: 'DICA', text: 'Prefira mostrar a peça na mão ou no corpo, perto da luz natural. Se for por foto, mande uma foto inteira e uma de detalhe, sem filtro que mude a cor.' },
      { type: 'link', href: '/revendedora/mensagens#atendimento', label: 'Ver as mensagens de atendimento' },
    ],
  },
  {
    slug: 'onde-vender',
    menu: 'Onde vender',
    title: 'Esteja onde suas clientes estão.',
    intro: 'Você não precisa estar em todo lugar. Escolha dois canais e use com constância.',
    blocks: [
      { type: 'heading', text: 'Status do WhatsApp' },
      { type: 'text', text: 'É a vitrine mais forte da revendedora. Poste um pouco todo dia, sem encher. Uma semana de exemplo:' },
      { type: 'week', items: statusWeek },
      { type: 'heading', text: 'Instagram' },
      { type: 'text', text: 'Use seu perfil como vitrine: foto da peça, vídeo curto mostrando o brilho e combinações. Na legenda, diga para que ocasião a peça serve e convide para o direct.' },
      { type: 'quote', text: '“Um detalhe muda o visual inteiro. Este brinco é perfeito para o trabalho. Quer saber o valor? Me chama no direct.”' },
      { type: 'heading', text: 'Pessoalmente' },
      // [PREENCHER: se a revendedora pode deixar mostruário no salão ou na loja de uma amiga]
      { type: 'list', items: [
        'No trabalho: leve algumas peças e mostre no intervalo.',
        'Encontro em casa: chame amigas para um café e mostre o kit.',
        `Mostruário no salão ou na loja de uma amiga ${TO_CONFIRM}`,
      ] },
      { type: 'text', text: 'Mostre poucas peças por vez, organizadas por tipo. Kit todo de uma vez confunde.' },
    ],
  },
  {
    slug: 'receber-em-dia',
    menu: 'Receber em dia',
    title: 'Venda boa é venda recebida.',
    intro: 'Cobrar é a parte que mais incomoda, e é a que mais pesa no fim do ciclo. Com estas regras, fica mais fácil.',
    blocks: [
      { type: 'cards', items: [
        { mark: '01', title: 'Combine antes de entregar', text: 'Valor, forma de pagamento e data. Tudo combinado por escrito no WhatsApp.' },
        { mark: '02', title: 'Pix na entrega é o melhor caminho', text: 'Pagou, recebeu. Sem lembrete, sem constrangimento.' },
        { mark: '03', title: 'O prazo da cliente termina antes do seu', text: 'Se dividir, o último pagamento precisa cair antes da data do seu acerto com a AP.' },
        { mark: '04', title: 'Anote tudo no mesmo dia', text: 'Quem comprou, o quê, quanto pagou e quanto falta.' },
        { mark: '05', title: 'Lembre com gentileza, um dia antes', text: 'Um recado leve evita atraso. Há modelos prontos nas mensagens.' },
        { mark: '06', title: 'Quem está devendo não leva mais', text: 'Primeiro acerta o que deve, depois compra de novo.' },
      ] },
      { type: 'link', href: '/revendedora/mensagens#receber-em-dia', label: 'Ver as mensagens de cobrança' },
      { type: 'heading', text: 'Regras da AP' },
      // [PREENCHER: formas de pagamento no acerto e quem assume se a cliente não pagar]
      { type: 'table', rows: [
        ['Formas de pagamento aceitas no acerto', TO_CONFIRM],
        ['Venda a prazo: quem assume se a cliente não pagar', TO_CONFIRM],
      ] },
    ],
  },
  {
    slug: 'datas-que-vendem',
    menu: 'Datas que vendem',
    title: 'Semijoia é presente.',
    intro: 'Algumas épocas concentram a maior parte das vendas do ano. Comece a divulgar antes de todo mundo.',
    blocks: [
      { type: 'heading', text: 'Natal e amigo secreto' },
      { type: 'text', text: 'A melhor época do ano começa em novembro.' },
      { type: 'list', items: [
        'Liste as clientes que costumam comprar presentes e mande uma mensagem ainda em novembro.',
        'Monte uma seleção de amigo secreto por faixa de valor. É o que mais se procura em dezembro.',
        'Sugira presentes para mãe, sogra, madrinha, professora e amigas.',
        'Nos Status, poste “ideias de presente” pelo menos três vezes por semana.',
      ] },
      { type: 'link', href: '/revendedora/mensagens#natal-e-presentes', label: 'Ver as mensagens de Natal e presentes' },
      { type: 'heading', text: 'O resto do ano' },
      { type: 'table', rows: [
        ['Março', 'Dia da Mulher'],
        ['Maio', 'Dia das Mães, a segunda maior data'],
        ['Junho', 'Dia dos Namorados'],
        ['Dez · Jan', 'Formaturas e festas de fim de ano'],
        ['Ano todo', 'Aniversários e casamentos'],
      ] },
      { type: 'callout', label: 'DICA', text: 'Pergunte a data de aniversário das suas clientes e anote. Uma mensagem uma semana antes vira presente para ela mesma ou dica para quem vai presentear.' },
    ],
  },
  {
    slug: 'primeiros-30-dias',
    menu: 'Seus primeiros 30 dias',
    title: 'Comece hoje, um passo por semana.',
    intro: 'Ninguém aprende tudo no primeiro dia. Siga uma semana de cada vez.',
    blocks: [
      { type: 'cards', layout: 'list', items: [
        { mark: 'S1', title: 'Prepare', text: 'Confira o kit, conheça as peças e decore os cuidados. Liste 20 pessoas que podem gostar das peças.' },
        { mark: 'S2', title: 'Apresente', text: 'Mande a mensagem de apresentação para a sua lista e comece a semana de Status.' },
        { mark: 'S3', title: 'Acompanhe', text: 'Volte a falar com quem pediu para pensar, faça o pós-venda e peça indicações.' },
        { mark: 'S4', title: 'Feche o ciclo', text: 'Receba o que falta, confira o kit e veja quais modelos mais saíram para pedir a reposição.' },
      ] },
      { type: 'callout', label: 'DICA', text: 'Reserve um horário fixo por dia, mesmo que curto, para postar e responder. Constância vende mais do que um dia inteiro de esforço por mês.' },
      { type: 'link', href: '/revendedora/mensagens#primeiro-contato', label: 'Ver a mensagem de apresentação' },
    ],
  },
];

export interface ReadyMessage { title: string; tag?: string; text: string; note?: string }
export interface MessageGroup { id: string; menu: string; title: string; messages: ReadyMessage[] }

export const messageGroups: readonly MessageGroup[] = [
  { id: 'primeiro-contato', menu: 'Primeiro contato', title: 'Para começar a conversa.', messages: [
    { title: 'Apresentação', tag: 'WhatsApp', text: 'Oi, [nome]! Tudo bem? Agora estou revendendo as semijoias da AP Folheados, aquela marca de Itaperuna que está há mais de 30 anos na região. Posso te mandar umas fotos das peças que têm a sua cara?' },
    { title: 'Quando ela responde seu Status', text: 'Que bom que você gostou! Quer que eu te mande o valor e uma foto mais de perto?' },
    { title: 'Resposta no direct', tag: 'Instagram', text: 'Oi, [nome]! Obrigada pelo interesse. Essa peça é [descrição]. Quer que eu te mande o valor e outras opções no mesmo estilo?' },
  ] },
  { id: 'atendimento', menu: 'Atendimento', title: 'Para ajudar a escolher.', messages: [
    { title: 'Descobrir o estilo', text: 'Me conta: é para você ou para presente? E você gosta mais de peça delicada ou que chama atenção? Assim te mostro as que mais combinam.' },
    { title: 'Comparar duas opções', text: 'Separei duas opções no estilo que você falou. A primeira é mais delicada, a segunda chama um pouco mais atenção. Qual você prefere?' },
    { title: '“Achei caro”', text: 'Entendo! Tenho outras opções lindas numa faixa de valor menor. Quer que eu te mostre?' },
    { title: '“Vou pensar”', text: 'Claro, sem pressa! Vou te mandar as fotos para você olhar com calma. Posso te chamar daqui a uns dias?' },
    // [PREENCHER: prazo da garantia]
    { title: '“Será que é bom?”', text: 'A AP Folheados está há mais de 30 anos em Itaperuna e região, e as peças têm garantia de [prazo]. Quando você receber, ainda te ensino os cuidados para o brilho durar bastante.', note: `Prazo da garantia: ${TO_CONFIRM}` },
    { title: 'Fechar a venda', text: 'Perfeito! Fica [valor]. Prefere pagar no Pix ou no dinheiro? Consigo te entregar [dia].' },
  ] },
  { id: 'depois-da-venda', menu: 'Depois da venda', title: 'Para ela voltar a comprar.', messages: [
    { title: 'Cuidados com a peça', tag: 'Na entrega', text: 'Obrigada pela compra, [nome]! Algumas dicas para sua peça durar: coloque depois do perfume e do creme, tire para tomar banho, dormir e treinar, e guarde separada num saquinho. Qualquer dúvida, é só me chamar.' },
    { title: 'Pós-venda', tag: 'Alguns dias depois', text: 'Oi, [nome]! Passando para saber se você gostou da sua peça. Ficou como você esperava?' },
    { title: 'Pedir indicação', text: 'Que bom que você gostou! Se tiver alguma amiga que ia gostar das peças, pode passar meu contato. Vou adorar atender.' },
    { title: 'Novidades', tag: 'Para quem pediu', text: 'Oi, [nome]! Chegaram peças novas no estilo que você gosta. Quer que eu te mande umas fotos?' },
  ] },
  { id: 'receber-em-dia', menu: 'Receber em dia', title: 'Para cobrar sem constrangimento.', messages: [
    { title: 'Combinar o pagamento', tag: 'Antes de entregar', text: 'Combinado, [nome]! Ficou assim: [peça], no valor de [valor], com pagamento [no Pix / em 2x] até o dia [data]. Minha chave Pix é [chave].' },
    { title: 'Lembrete', tag: 'Um dia antes', text: 'Oi, [nome]! Tudo bem? Só passando para lembrar que amanhã é o dia do pagamento da sua [peça], no valor de [valor]. Minha chave Pix é [chave]. Obrigada!' },
    { title: 'Pagamento atrasado', text: 'Oi, [nome]! Vi aqui que o pagamento da [peça] ficou para trás. Aconteceu alguma coisa? Me diz o melhor dia para você acertar que eu anoto aqui.' },
    { title: 'Confirmação de pagamento', text: 'Recebi seu pagamento, [nome]. Muito obrigada! Qualquer coisa, estou por aqui.' },
  ] },
  { id: 'natal-e-presentes', menu: 'Natal e presentes', title: 'Para a época que mais vende.', messages: [
    { title: 'Amigo secreto', text: 'Oi, [nome]! Já tirou seu amigo secreto? Separei semijoias lindas até [valor], prontas para presentear. Quer ver?' },
    { title: 'Presente de Natal', text: 'O Natal está chegando! Que tal dar uma semijoia para a sua mãe, sogra ou madrinha este ano? Me conta para quem é que eu separo umas opções.' },
    { title: 'Aniversário da cliente', text: 'Oi, [nome]! Vi que seu aniversário está chegando. Que tal se dar um presente? Separei umas peças que são a sua cara.' },
    { title: 'Dia das Mães', text: 'Oi, [nome]! O Dia das Mães está chegando. Quer ajuda para escolher um presente para a sua mãe? Me conta o estilo dela.' },
  ] },
  { id: 'instagram-e-status', menu: 'Instagram e Status', title: 'Para a sua vitrine.', messages: [
    { title: 'Legenda de peça', text: 'Um detalhe muda o visual inteiro. Este [tipo de peça] é perfeito para [ocasião]. Quer saber o valor? Me chama no direct.' },
    { title: 'Legenda de presente', text: 'Procurando presente? Semijoia agrada sempre. Me conta para quem é que eu te ajudo a escolher.' },
    { title: 'Status com convite', text: 'Chegou peça nova! Quer ver mais de perto? Me responde aqui.' },
  ] },
];

/** Cola da Revendedora: o essencial em uma página. */
export const cheatSheet = {
  cycle: [
    'Receba e confira o kit com a AP.',
    'Venda e anote no mesmo dia: peça, cliente, valor, se pagou.',
    'Receba das clientes antes do seu acerto.',
    'Acerte: até R$ 350 vendidos, 30% fica com você. Acima de R$ 350, 35%.',
  ],
  brilho: [
    ['B', 'Busque quem já confia em você.'],
    ['R', 'Reconheça o estilo: pergunte antes de mostrar.'],
    ['I', 'Inspire com 2 ou 3 opções e combinações.'],
    ['L', 'Leve à decisão com uma pergunta simples.'],
    ['H', 'Honre: entregue, ensine os cuidados, faça o pós-venda.'],
    ['O', 'Ofereça novidades a quem pediu.'],
  ],
  askFirst: ['“É para você ou para presente?”', '“Para o dia a dia ou para uma ocasião?”', '“Peça delicada ou que chama atenção?”', '“Tem um valor em mente?”'],
  close: ['“Qual das duas você gostou mais?”', '“Prefere pagar no Pix ou no dinheiro?”'],
  hesitation: [
    ['“Achei caro.”', '“Tenho opções lindas numa faixa menor. Quer ver?”'],
    ['“Vou pensar.”', '“Claro! Te mando as fotos para olhar com calma.”'],
    ['“Será que é bom?”', '“A AP está há mais de 30 anos na região, e eu te ensino os cuidados.”'],
    // [PREENCHER: confirmar a garantia, citada aqui sem prazo]
    ['“Escurece?”', '“Com os cuidados certos, o brilho dura muito mais. E tem garantia.”'],
  ],
  care: [
    'Coloque por último: depois de perfume e creme.',
    'Tire primeiro: antes de dormir, banho e exercício.',
    'Longe de piscina, mar e produto de limpeza.',
    'Molhou ou suou? Seque com pano macio.',
    'Limpe só com flanela seca.',
    'Guarde separada, em saquinho.',
  ],
  payment: [
    'Combine valor, forma e data antes de entregar.',
    'Pix na entrega é o melhor caminho.',
    'O prazo da cliente termina antes do seu acerto.',
    'Lembre com gentileza um dia antes.',
    'Quem está devendo não leva mais.',
  ],
} as const;

/** Materiais em PDF, em public/kit. "Seja Revendedora" fica de fora: os depoimentos ainda são exemplos. */
export const kitFiles = [
  { href: '/kit/AP_Folheados_Guia_de_Vendas.pdf', label: 'Guia de Vendas' },
  { href: '/kit/AP_Folheados_Cola_da_Revendedora.pdf', label: 'Cola da Revendedora' },
  { href: '/kit/AP_Folheados_Mensagens_Prontas.pdf', label: 'Mensagens Prontas' },
];

/** Página pública /seja-revendedora. */
export const opportunity = {
  reasons: [
    { mark: '01', title: 'Comece sem investir em estoque', text: 'As semijoias chegam até você em consignação. Você não precisa comprar nada antes de vender.' },
    { mark: '02', title: 'Ganhe em cada venda', text: '30% em vendas de até R$ 350 no ciclo. Passou disso, sua comissão sobe para 35%.' },
    { mark: '03', title: '40 dias para vender', text: 'Tempo de sobra para mostrar as peças, atender suas clientes com calma e fechar cada venda.' },
    { mark: '04', title: 'Uma marca que a região já conhece', text: 'Mais de 30 anos em Itaperuna e região. Sua cliente confia porque já ouviu falar da AP.' },
  ],
  steps: [
    { mark: '01', title: 'Faça seu cadastro', text: 'Preencha o cadastro pelo site. A equipe AP analisa e entra em contato para formalizar a parceria.' },
    { mark: '02', title: 'Receba seu kit', text: 'Com a parceria formalizada, você recebe as semijoias do seu kit em consignação, prontas para vender.' },
    { mark: '03', title: 'Venda do seu jeito', text: 'Mostre as peças no WhatsApp, no Instagram, no trabalho, para a família e as amigas. Registre cada venda.' },
    { mark: '04', title: 'Faça o acerto em 40 dias', text: 'Acerte com a AP as peças vendidas, receba sua comissão e combine a reposição para o próximo ciclo.' },
  ],
  simulation: [
    ['2 peças', 'R$ 300', '30%', 'R$ 90'],
    ['5 peças', 'R$ 750', '35%', 'R$ 262,50'],
    ['10 peças', 'R$ 1.500', '35%', 'R$ 525'],
    ['20 peças', 'R$ 3.000', '35%', 'R$ 1.050'],
  ],
  faq: [
    { question: 'Preciso comprar as peças para começar?', answer: 'Não. As peças chegam em consignação: você vende e acerta com a AP apenas o que foi vendido, dentro do prazo de 40 dias.' },
    { question: 'Vou receber 30% ou 35%?', answer: 'Depende do quanto você vende no ciclo. Até R$ 350 em vendas, a comissão é de 30%. Acima de R$ 350, sobe para 35%.' },
    { question: 'O que acontece com as peças que eu não vender?', answer: 'No acerto, a AP confere o kit com você e combina a devolução ou a troca das peças para o próximo ciclo.' },
    { question: 'Preciso ter experiência com vendas?', answer: 'Não. Se você gosta de conversar e tem uma rede de contatos, já tem o principal. A AP oferece um guia de vendas com roteiros prontos para WhatsApp e Instagram.' },
    { question: 'Onde vejo os modelos disponíveis?', answer: 'No catálogo online. É só consultar e mandar o link para as suas clientes.' },
    { question: 'Como faço meu cadastro?', answer: 'Pelo site. A equipe AP analisa e entra em contato com você.' },
  ],
} as const;
