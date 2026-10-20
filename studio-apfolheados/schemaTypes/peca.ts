import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Mesmas categorias do site (src/data/products.ts, tipo Category).
 * O valor (value) precisa ser igual ao usado no site; o título é o que a equipe vê.
 */
export const categorias = [
  {title: 'Brincos', value: 'brincos'},
  {title: 'Colares', value: 'colares'},
  {title: 'Anéis', value: 'aneis'},
  {title: 'Pulseiras', value: 'pulseiras'},
]

export const peca = defineType({
  name: 'peca',
  title: 'Peça',
  type: 'document',
  fields: [
    defineField({
      name: 'codigo',
      title: 'Código (ID)',
      description: 'Referência da peça, como aparece no mostruário. Ex.: AP-1042',
      type: 'string',
      validation: (rule) => [
        rule.required().error('Informe o código da peça.'),
        rule.regex(/^\S+$/, {name: 'sem espaços'}).error('O código não pode ter espaços.'),
        rule.custom(async (codigo, context) => {
          if (!codigo) return true
          const id = context.document?._id.replace(/^(drafts|versions\.[^.]+)\./, '')
          const client = context.getClient({apiVersion: '2025-01-01'})
          // Só compara com peças publicadas, ignorando a própria peça.
          const repetidas = await client.fetch<number>(
            'count(*[_type == "peca" && codigo == $codigo && _id != $id && !(_id in path("drafts.**")) && !(_id in path("versions.**"))])',
            {codigo, id},
          )
          return repetidas === 0 || 'Já existe uma peça com esse código.'
        }),
      ],
    }),
    defineField({
      name: 'imagens',
      title: 'Fotos',
      description:
        '1ª foto: a peça sozinha (aparece no mostruário). 2ª foto: modelo usando a peça (aparece ao passar o mouse). As demais aparecem na galeria. No computador, dá para arrastar várias fotos de uma vez; arraste na lista para mudar a ordem.',
      type: 'array',
      of: [defineArrayMember({type: 'image', options: {hotspot: true}})],
      options: {layout: 'grid'},
      validation: (rule) =>
        rule.required().min(2).error('Adicione pelo menos 2 fotos: a peça sozinha e a modelo usando.'),
    }),
    defineField({
      name: 'categoria',
      title: 'Categoria',
      type: 'string',
      options: {list: categorias, layout: 'radio', direction: 'horizontal'},
      validation: (rule) => rule.required().error('Escolha a categoria.'),
    }),
  ],
  orderings: [
    {title: 'Código', name: 'codigoAsc', by: [{field: 'codigo', direction: 'asc'}]},
  ],
  preview: {
    select: {codigo: 'codigo', categoria: 'categoria', media: 'imagens.0'},
    prepare: ({codigo, categoria, media}) => ({
      title: codigo || 'Peça sem código',
      subtitle: categorias.find((item) => item.value === categoria)?.title,
      media,
    }),
  },
})
