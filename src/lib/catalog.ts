import { products, type Product, type Category } from '../data/products.ts';

export type CatalogCategory = Category | 'todas';
/** Pieces shown per page in the catalogue. */
export const PAGE_SIZE = 12;

export const filterProducts = (category: CatalogCategory) =>
  products.filter(product => category === 'todas' || product.category === category);

export function validPhone(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) digits = digits.slice(2);
  return /^(?!([0-9])\1+$)[1-9]{2}\d{8,9}$/.test(digits);
}

export const shareMessage = (product: Product) => `Olha esta peça da AP Folheados: ${product.name} (${product.code}). Quer que eu separe para você?`;

export interface ContactValues {
  nome: string;
  whatsapp: string;
  cidade: string;
  experiencia: string;
  indicacao: string;
}

export const contactMessage = (values: ContactValues) => `Olá, AP Folheados! Quero conhecer a parceria de revenda.\n\nMeu nome: ${values.nome.trim()}\nWhatsApp: ${values.whatsapp.trim()}\nCidade: ${values.cidade.trim()}\nSobre mim: ${values.experiencia}${values.indicacao.trim() ? '\nIndicação: ' + values.indicacao.trim() : ''}\n\nPodemos conversar sobre as peças e as condições da parceria?`;

export const faqMessage = 'Olá, AP Folheados! Tenho uma dúvida sobre a revenda.';

export const whatsappUrl = (message: string, number = '') => `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
