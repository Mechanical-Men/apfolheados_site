export type Category = 'brincos' | 'colares' | 'aneis' | 'pulseiras';

/** URLs of one photo, already sized by the Sanity image CDN. */
export interface ProductPhoto {
  card: string;
  large: string;
  thumb: string;
  download: string;
}

export interface Product {
  code: string;
  /** Not registered in Sanity yet; the code is shown instead. */
  name?: string;
  category: Category;
  photos: ProductPhoto[];
}

/** Os valores precisam ser iguais aos do painel (studio-apfolheados/schemaTypes/peca.ts). */
export const categories: readonly { id: Category; label: string }[] = [
  { id: 'brincos', label: 'Brincos' },
  { id: 'colares', label: 'Colares' },
  { id: 'aneis', label: 'Anéis' },
  { id: 'pulseiras', label: 'Pulseiras' },
];

export const isCategory = (value: unknown): value is Category => categories.some(category => category.id === value);
export const categoryLabel = (category: Category) => categories.find(item => item.id === category)!.label;
export const productTitle = (product: Product) => product.name || product.code;
