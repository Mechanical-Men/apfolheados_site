export type Category = 'brincos' | 'colares' | 'pulseiras' | 'braceletes' | 'aneis' | 'tornozeleiras' | 'pingentes';

/** URLs das imagens publicadas no Supabase. */
export interface ProductPhoto {
  card: string;
  large: string;
  thumb: string;
  download: string;
}

export interface Product {
  code: string;
  /** Nome opcional; o código é exibido quando ausente. */
  name?: string;
  category: Category;
  photos: ProductPhoto[];
  primaryPhoto?: ProductPhoto;
  hoverPhoto?: ProductPhoto;
}

/** Os valores precisam ser iguais aos do painel (AP Studio / cataloging.TYPES). */
export const categories: readonly { id: Category; label: string }[] = [
  { id: 'brincos', label: 'Brinco' },
  { id: 'colares', label: 'Cordão / colar' },
  { id: 'pulseiras', label: 'Pulseira' },
  { id: 'braceletes', label: 'Bracelete' },
  { id: 'aneis', label: 'Anel' },
  { id: 'tornozeleiras', label: 'Tornozeleira' },
  { id: 'pingentes', label: 'Pingente' },
];

export const isCategory = (value: unknown): value is Category => categories.some(category => category.id === value);
export const categoryLabel = (category: Category) => categories.find(item => item.id === category)!.label;
export const productTitle = (product: Product) => product.name || product.code;
