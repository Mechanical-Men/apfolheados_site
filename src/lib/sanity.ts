import { createClient } from '@sanity/client';
import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { sanityConfig } from '../config/sanity';
import { isCategory, type Product } from '../data/products';

// Runs only at build time (and on each request in `astro dev`). Publishing in the
// panel triggers a new Vercel build through a webhook, so the site stays static.
const client = createClient({ ...sanityConfig, useCdn: false, perspective: 'published' });
const image = createImageUrlBuilder(client);

interface SanityPiece {
  code: string;
  category: string;
  images: (SanityImageSource & { asset?: { _ref?: string } })[] | null;
}

const query = `*[_type == "peca" && defined(codigo) && defined(categoria) && count(imagens) > 0]
  | order(_createdAt desc) {
    "code": codigo,
    "category": categoria,
    "images": imagens[defined(asset)]{ asset, crop, hotspot }
  }`;

const extension = (ref = '') => ref.split('-').pop() || 'jpg';

async function fetchProducts(): Promise<Product[]> {
  const pieces = await client.fetch<SanityPiece[]>(query);
  return pieces.flatMap(piece => {
    const images = piece.images ?? [];
    if (!isCategory(piece.category) || images.length === 0) return [];
    const code = piece.code.trim();
    return [{
      code,
      category: piece.category,
      photos: images.map((source, index) => ({
        card: image.image(source).width(600).height(750).fit('crop').auto('format').url(),
        large: image.image(source).width(900).height(1125).fit('crop').auto('format').url(),
        thumb: image.image(source).width(120).height(150).fit('crop').auto('format').url(),
        download: image.image(source).forceDownload(`${code}-${index + 1}.${extension(source.asset?._ref)}`).url(),
      })),
    }];
  });
}

let cache: Promise<Product[]> | undefined;

/** Peças publicadas no painel, das mais novas para as mais antigas. */
export function getProducts() {
  // Em `astro dev`, busca a cada carregamento para refletir o painel na hora.
  if (import.meta.env.DEV) return fetchProducts();
  return (cache ??= fetchProducts());
}
