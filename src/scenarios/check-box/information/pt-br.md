Três grupos de caixas de seleção, cada um com sua pegadinha. Nenhuma delas é um `<input type="checkbox">` nativo: são botões com `role="checkbox"`, então leia o estado delas em `aria-checked` (ou com uma consulta por papel) e não em uma propriedade `checked`, e clique nelas em vez de usar o `check()` do Cypress, que só funciona com campos.

## Em um formulário

- A primeira caixa começa marcada e a segunda está desativada, então clicar nela não muda nada.
- A caixa obrigatória mostra sua mensagem de erro e fica marcada com `aria-invalid="true"` até ser marcada; marcá-la remove a mensagem do DOM.

## Como ícones

- O coração e o marcador não têm texto visível: seus nomes, Favorito e Marcador, vêm de `aria-label`.
- O único sinal visual do estado deles é o ícone preenchido, então verifique `aria-checked` em vez da imagem.

## Pai e filhos

- Marcar o pai marca os dois filhos, e desmarcá-lo desmarca os dois.
- Com só um filho marcado, o pai não está nem marcado nem desmarcado: ele tem `aria-checked="mixed"` e `data-state="indeterminate"`, e clicar nele então marca os dois filhos.
- Os dois filhos se chamam Filho e compartilham `data-testid="child"`, então diferencie-os pela posição.
