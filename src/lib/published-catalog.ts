import { isCategory, type Product, type ProductPhoto } from '../data/products.ts';
export interface CatalogImage { key: string; tipo: string; bucket: string; path: string; }
export interface CatalogPiece { id: string; sku: string; nome: string; tipo: string; principal: string; hover: string | null; imagens: CatalogImage[]; }
const categoryMap: Record<string,string> = { BR:'brincos',CO:'colares',PU:'pulseiras',BC:'braceletes',AN:'aneis',TO:'tornozeleiras',PI:'pingentes' };
export function mapPublishedCatalog(rows: CatalogPiece[], base: string): Product[] {
 return rows.flatMap(row=>{
  const category=categoryMap[row.tipo]; if(!isCategory(category))return [];
  const valid=row.imagens.filter(x=>x.bucket==='apfolheados-catalogo' && /^[0-9a-f-]{36}\/[0-9a-f-]{36}\/[a-f0-9]{64}\.(png|jpg|jpeg|webp)$/.test(x.path));
  const photos=new Map<string,ProductPhoto>(valid.map(x=>{
   const url=base+'/storage/v1/object/public/'+x.bucket+'/'+x.path;
   return [x.key,{card:url,large:url,thumb:url,download:url+'?download='+encodeURIComponent(row.sku+'.'+x.path.split('.').pop())}];
  }));
  const primaryPhoto=photos.get(row.principal);if(!primaryPhoto)return [];
  const hoverPhoto=row.hover?photos.get(row.hover):undefined;
  const gallery=[primaryPhoto,...[...photos.values()].filter(x=>x!==primaryPhoto)];
  return [{code:row.sku,name:row.nome&&row.nome!==row.sku?row.nome:undefined,category,photos:gallery,primaryPhoto,hoverPhoto}];
 });
}
export async function fetchPublishedCatalog(): Promise<Product[]> {
 const base=import.meta.env.PUBLIC_SUPABASE_URL?.replace(/\/$/,'');
 const key=import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!base||!key)throw new Error('Catálogo Supabase não configurado');
 const all: CatalogPiece[]=[];
 for(let offset=0;;offset+=100){
  const response=await fetch(base+'/rest/v1/rpc/catalogo_publico',{method:'POST',headers:{apikey:key,'Content-Type':'application/json','Content-Profile':'apfolheados'},body:JSON.stringify({p_offset:offset,p_limit:100}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('Catálogo temporariamente indisponível');
  const page: CatalogPiece[]=await response.json();if(!Array.isArray(page))throw new Error('Catálogo inválido');all.push(...page);if(page.length<100)break;
 }
 return mapPublishedCatalog(all,base);
}
