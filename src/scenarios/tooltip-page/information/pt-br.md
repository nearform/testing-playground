Cada tooltip só aparece enquanto o ponteiro está sobre o elemento dele ou o elemento tem o foco do teclado, então um teste precisa passar o mouse (ou dar foco) primeiro. Ele aparece 100 ms depois que o mouse chega e é removido do DOM quando o ponteiro sai ou o Escape é pressionado.

## Cada tooltip

- O botão de excluir está desativado, e botões desativados não disparam eventos de ponteiro, então o tooltip dele é acionado pelo elemento em volta (`data-testid="delete-button"`): passe o mouse sobre ele, e não sobre o botão.
- O tooltip de Mais informações contém um link. Ele continua aberto enquanto o ponteiro vai do botão até ele, então vá direto para o link antes de clicar.
- O texto longo é cortado com reticências, e o tooltip dele o mostra inteiro. O texto completo continua no DOM, então uma busca pelo texto funciona mesmo sem ele estar todo visível.

## Encontrando um tooltip

- Um tooltip aberto tem `role="tooltip"`, então encontre-o por esse papel e verifique o texto, em vez de depender da posição ou do estilo dele.
- Cada tooltip aparece ao lado do seu elemento, dentro da página, e não no final do `<body>`.
