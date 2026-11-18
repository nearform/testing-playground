Arraste a caixa vermelha *Arraste-me!* para a área cinza quantas vezes quiser: cada soltura adiciona uma caixa amarela numerada à área e um ao contador Total de Solturas.

## Como o arrasto funciona

- A página usa o arrastar e soltar nativo do HTML5 (`draggable` com os eventos `dragstart`, `dragover` e `drop` compartilhando um `dataTransfer`) em vez de seguir o mouse.
- O `dragTo()` do Playwright o controla diretamente. O Cypress não tem comando de arrastar, e as ações de mouse do Selenium não iniciam um arrasto nativo em todos os navegadores, então com essas ferramentas pode ser preciso disparar `dragstart`, `dragover` e `drop` você mesmo com um `DataTransfer` compartilhado, ou usar um plugin.
- Uma soltura só conta quando o arrasto começou na caixa vermelha, que coloca `smallBox` como `text/plain` no `dataTransfer`.

## Verificando o resultado

- Total de Solturas (`data-testid="total-drops"`) conta cada soltura, e as caixas soltas se chamam Caixa 1, Caixa 2 e assim por diante.
- A caixa vermelha nunca se move, então verifique o contador e as caixas novas em vez da posição da caixa vermelha.
