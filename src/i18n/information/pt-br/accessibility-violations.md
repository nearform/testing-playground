Todos os problemas de acessibilidade desta página são propositais. Ativar **Mostrar a versão corrigida** (ou abrir `#/accessibility-violations?version=fixed`) corrige todos eles, então a mesma varredura pode ser feita nas duas versões. Cada problema aparece mais abaixo, em Problemas esperados.

## Fazendo a varredura

- Os problemas estão todos dentro da seção Inscrição na newsletter, cujo ID é `accessibility-violations-area`.
- Limite a varredura a essa seção, para que nada do resto do playground se misture: `.include('#accessibility-violations-area')` no `@axe-core/playwright` ou `cy.checkA11y('#accessibility-violations-area')` no `cypress-axe`.
- Cada linha de Problemas esperados tem um atributo `data-rule` com o ID da regra (ou `data-issue` para os problemas de teclado), e a tabela fica vazia na versão corrigida.

## O que torna a automação difícil

- `duplicate-id-aria` é informada em `incomplete` e não em `violations`, porque o axe-core marca essa regra como precisando de revisão, então um teste que só olha `violations` nunca a vê.
- `heading-order` é uma boa prática e não uma regra WCAG, então uma varredura limitada com `withTags(['wcag2a', 'wcag2aa'])` não a encontra.
- `color-contrast` e `scrollable-region-focusable` dependem do layout da página, então só são encontradas em um navegador real e nunca no jsdom.
- Uma regra pode falhar em vários elementos e novas versões do axe-core adicionam regras, então verifique os IDs de regra esperados em vez do número de violações.

## O que nenhum scanner encontra

- A caixa Mensagem fica com a tecla Tab para si, como alguns editores de código que indentam, então depois que recebe o foco nem Tab nem Shift+Tab saem dela: uma armadilha de teclado.
- O botão Inscrever-se é uma `div` com um tratador de clique, então não pode ser alcançado com Tab e só funciona com o mouse.
- Uma varredura sem erros não prova que a página é acessível: só mostra que os problemas que um scanner consegue encontrar sumiram.
