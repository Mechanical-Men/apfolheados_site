# Catálogo administrado pelo AP Studio

O projeto Supabase mechanicalmen-platform-prod usa o schema apfolheados. Os cadastros de revendedoras permanecem independentes.

## Estrutura
- catalogo_produtos: UUID estável, SKU único, revisão de concorrência e ponteiros de versão rascunho/publicada.
- catalogo_versoes: snapshots imutáveis com nome, tipo, imagens classificadas, principal e hover explícitos.
- apfolheados-rascunhos: bucket privado. apfolheados-catalogo: bucket público para imagens destinadas à publicação.
- catalogo_salvar / catalogo_retirar / catalogo_estado: somente administradores identificados por apfolheados.admins.
- catalogo_publico: expõe somente a versão publicada, com paginação. A chave pública não escreve nas tabelas.

Rascunho não altera a versão publicada. Uploads são feitos em caminhos imutáveis por produto/versão/hash. Falhas antes de salvar deixam o catálogo anterior intacto; arquivos órfãos podem ser limpos posteriormente por manutenção. Retirar do catálogo não revoga URLs públicas ou downloads anteriores. A versão anterior fica guardada no histórico do banco.

## AP Studio
Abra uma peça e a aba Publicar no site. A instalação local usa automaticamente uma identidade técnica em catalogo_publicadores, com permissão exclusiva de catálogo. A sessão fica no Gerenciador de Credenciais do Windows. A identidade não é cadastrada em apfolheados.admins e não acessa cadastros de revendedoras ou outros clientes. Nenhuma chave global deve ficar no navegador ou na configuração local. Administradores AP continuam compatíveis para manutenção.
Classifique imagens aprovadas em catálogo, editorial, modelo e extras. Escolha principal e hover entre as imagens enviadas. Selecione Publicar imediatamente para atualizar o site ou desmarque para guardar rascunho privado. Retirar do site pede confirmação.
A instalação guarda config/supabase.json com URL, chave pública e UUID da instalação. Preserve esse UUID ao migrar o AP Studio de computador: ele mantém os IDs dos produtos.

## Transição de fonte
src/config/catalog-source.json escolhe sanity ou supabase. A troca só deve ocorrer depois de validar os produtos migrados. Não misturar as duas fontes nem usar Sanity como fallback quando uma publicação for retirada, pois isso poderia ressuscitar peças despublicadas.
A fonte Supabase é carregada no build e atualizada no navegador ao abrir a página, retornar à aba e a cada 60 segundos enquanto visível. Uma falha de rede mantém o último catálogo carregado. A ativação inicial no site público exige publicar o código atualizado; depois, alterações de produtos não exigem novo build para visitantes com JavaScript.

## Migration
20261105010000_apfolheados_catalogo.sql foi aplicada isoladamente e registrada no histórico. A migration local 20261028210000 de CPF único já estava pendente e foi preservada. Não rodar db push sem revisar essa pendência.

A migration 20261105011000 adiciona a autorização de instalações técnicas, mantendo a separação de permissões entre catálogo e revendedoras.

## Migração concluída
Foram migrados os 10 produtos já publicados no Sanity, com 22 imagens verificadas por SHA-256, preservando principal e hover atuais e usando os SKUs padronizados do AP Studio. Os demais produtos locais não foram publicados automaticamente.
A fonte do site local foi alterada para supabase, e o build foi validado. O destino online informado é https://apfolheados.vercel.app/; a configuração antiga do Sites foi preservada e não é o destino desta publicação.
A instalação técnica foi provisionada; nenhuma senha ou chave global foi salva no AP Studio. Para revogar: marcar ativo=false na linha de catalogo_publicadores correspondente à instalacao_id. Isso interrompe a edição e os uploads dessa identidade.

## Configuração global de imagens
A aba Publicar no site publica diretamente. Não há mais checkbox de rascunho nem seleção individual de principal/hover. Em Configurações > Imagens do catálogo, escolha os tipos globais de principal e hover. A regra é resolvida pela API para todos os produtos publicados, sem reenviar fotos. Se faltar o tipo principal: catálogo, editorial, modelo, extra; se faltar hover: sem hover. Estúdio claro/escuro são Catálogo. O banco preserva snapshots antigos para histórico.
