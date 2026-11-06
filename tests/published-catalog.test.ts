import test from 'node:test';
import assert from 'node:assert/strict';
import { mapPublishedCatalog } from '../src/lib/published-catalog.ts';
const path='11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/'+ 'a'.repeat(64)+'.png';
const image=(key:string)=>({key,tipo:'extra',bucket:'apfolheados-catalogo',path});
const piece={id:'one',sku:'AP-BR-00001',nome:'Brinco',tipo:'BR',principal:'editorial',hover:'model',imagens:[image('catalog'),image('model'),image('editorial')]};
test('principal e hover independem da ordem das imagens',()=>{
 const p=mapPublishedCatalog([piece],'https://example.supabase.co')[0];
 assert.ok(p.primaryPhoto);assert.ok(p.hoverPhoto);assert.equal(p.photos[0],p.primaryPhoto);assert.notEqual(p.primaryPhoto,p.hoverPhoto);assert.equal(p.photos.length,3);
});
test('sem hover e sem fotos privadas no catálogo',()=>{
 const p=mapPublishedCatalog([{...piece,hover:null,imagens:[image('editorial'),{...image('private'),bucket:'apfolheados-rascunhos'}]}],'https://example.supabase.co')[0];
 assert.equal(p.hoverPhoto,undefined);assert.equal(p.photos.length,1);
 assert.equal(mapPublishedCatalog([{...piece,principal:'missing'}],'https://example.supabase.co').length,0);
});
