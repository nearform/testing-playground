Cada lista tem 10.000 linhas e a grade tem 260.000 células, mas só as poucas perto da área visível estão no DOM. A contagem acima de cada lista mostra quantas linhas estão renderizadas agora e quais são, para você vê-las mudar enquanto rola.

## Linhas fora da tela não existem

- Procurar a linha {{fixedTarget}} logo de cara não encontra nada: ela não está oculta, ela simplesmente ainda não está no DOM. `scrollIntoView()` também não ajuda, pois não há elemento em que chamá-lo. Role a própria lista (não a página) até a linha ser renderizada e então procure-a.
- Contar as linhas com `getAllByRole('listitem')`, `locator.count()` ou `should('have.length')` dá o número de linhas renderizadas, não o total. Os totais reais estão em `aria-setsize` em cada linha, e em `aria-rowcount` e `aria-colcount` na grade.
- Procurar texto na página, com `getByText` ou a busca do navegador, só encontra as linhas renderizadas.
- Estar no DOM não significa estar na tela: algumas linhas a mais são renderizadas acima e abaixo da área visível para que uma rolagem rápida não mostre buracos. O Playwright rola até uma linha renderizada antes de clicar nela; em outras ferramentas, verifique antes se ela está visível.

## Os elementos são reutilizados

- Conforme você rola, o elemento que mostrava uma linha é reutilizado para outra: o elemento que mostrava a linha 3 pode mostrar a linha 18 depois de uma rolagem. Um elemento guardado, como um `WebElement` do Selenium ou um alias do Cypress, pode apontar para outra linha depois sem ficar obsoleto, então procure a linha de novo depois de cada rolagem.
- Procure as linhas por algo que pertença a elas, como o texto, o `data-row-id` ou o nome do botão (_Selecionar linha {{fixedTarget}}_), e não pela posição: `nth()` ou `eq()` escolhe a n-ésima linha renderizada, não a n-ésima linha da lista.
- O botão `Selecionar` de cada linha tem o mesmo texto visível, então um seletor só por esse texto corresponde a todas as linhas renderizadas.

## Rolar até uma linha

- Na lista de altura fixa, cada linha tem {{rowHeight}} px, então a linha N começa em `(N - 1) × {{rowHeight}}` pixels. Defina o `scrollTop` da lista com esse valor e a linha é renderizada.
- Na lista de altura variável, as linhas têm alturas diferentes, então a posição de uma linha não pode ser calculada pelo ID. Role um passo de cada vez, por exemplo a altura da lista, e depois de cada passo verifique se a linha foi renderizada. Os IDs das linhas renderizadas dizem se você deve continuar ou voltar.
- As linhas são renderizadas em resposta ao evento de rolagem, então espere a linha aparecer em vez de verificar logo depois de rolar. Alterar o `scrollTop`, `mouse.wheel()` no Playwright e `scrollTo()` na lista no Cypress disparam esse evento.
- A grade rola nas duas direções: as colunas também são virtualizadas, então a coluna Q não está no DOM até você rolar para a direita. A linha de cabeçalho e os números das linhas ficam fixos por cima das células, então uma célula logo abaixo deles está no DOM, mas coberta.
