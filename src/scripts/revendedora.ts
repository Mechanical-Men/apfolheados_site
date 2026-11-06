import { copyText, toast } from './shell';

// Área da Revendedora: copiar mensagens e imprimir a Cola.

document.addEventListener('click', async event => {
  if (!(event.target instanceof Element)) return;
  const copy = event.target.closest('[data-copy-message]');
  if (copy) {
    const text = copy.closest<HTMLElement>('[data-message]')!.dataset.message!;
    toast(await copyText(text) ? 'Mensagem copiada.' : 'Selecione e copie o texto da mensagem.');
  }
  if (event.target.closest('[data-print]')) window.print();
});
