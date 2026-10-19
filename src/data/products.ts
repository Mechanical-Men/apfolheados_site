export type Category = 'brincos' | 'colares' | 'aneis' | 'pulseiras';
export interface Product {
  code: string;
  name: string;
  category: Category;
  /** File name inside public/assets/pecas/. */
  photo: string;
}

export const categories: readonly { id: Category; label: string }[] = [
  { id: 'brincos', label: 'Brincos' },
  { id: 'colares', label: 'Colares' },
  { id: 'aneis', label: 'Anéis' },
  { id: 'pulseiras', label: 'Pulseiras' },
];

/**
 * Catálogo exibido no site.
 * TROCAR FOTOS: as fotos atuais são provisórias. Substitua os arquivos em
 * public/assets/pecas/ por fotos reais das peças da AP (proporção 4:5, 600×750)
 * e ajuste nome, código e categoria aqui. Para adicionar uma peça, basta
 * colocar a foto na pasta e incluir uma linha neste array.
 */
export const products: readonly Product[] = [
  { code: 'AP-1042', name: 'Argola Fio Veneziano', category: 'brincos', photo: 'argola.jpg' },
  { code: 'AP-1120', name: 'Brinco Gota Cristal', category: 'brincos', photo: 'gota.jpg' },
  { code: 'AP-2015', name: 'Colar Gota Cristal', category: 'colares', photo: 'colar_gota.jpg' },
  { code: 'AP-3008', name: 'Anel Solitário', category: 'aneis', photo: 'anel.jpg' },
  { code: 'AP-4012', name: 'Pulseira Riviera', category: 'pulseiras', photo: 'riviera.jpg' },
  { code: 'AP-1007', name: 'Brinco Ponto de Luz', category: 'brincos', photo: 'ponto.jpg' },
  { code: 'AP-2031', name: 'Choker Elos', category: 'colares', photo: 'elos.jpg' },
  { code: 'AP-2044', name: 'Colar Medalha', category: 'colares', photo: 'medalha.jpg' },
  { code: 'AP-1050', name: 'Argola Lisa Grossa', category: 'brincos', photo: 'argola_grossa.jpg' },
  { code: 'AP-4003', name: 'Pulseira Elo Fino', category: 'pulseiras', photo: 'pulseira.jpg' },
  { code: 'AP-4020', name: 'Bracelete Liso', category: 'pulseiras', photo: 'bracelete.jpg' },
  { code: 'AP-2009', name: 'Colar Ponto de Luz', category: 'colares', photo: 'colar_ponto.jpg' },
];

export const productImage = (product: Product) => `/assets/pecas/${product.photo}`;
export const productDownloadName = (product: Product) => `${product.code}-${product.photo}`;
