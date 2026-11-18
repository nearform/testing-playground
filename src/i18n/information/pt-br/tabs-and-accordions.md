Abas e acordeões ocultam conteúdo sem removê-lo, ou o removem sem aviso, então um teste precisa saber se está verificando que algo _existe_ ou que está _visível_, e a forma mais clara de saber o que está aberto é o estado ARIA (`aria-selected`, `aria-expanded`), e não o estilo.

## Visível ou presente

- As abas do produto mantêm todos os painéis no DOM e ocultam os demais com o atributo `hidden`, então o texto de um painel oculto ainda pode ser encontrado: verifique a visibilidade (`toBeVisible`), não apenas a presença.
- As abas do relatório renderizam apenas o painel selecionado, então os outros painéis não existem, e o que for digitado em um painel se perde ao trocar de aba e voltar. Nas abas do produto, as notas digitadas são mantidas.
- As seções recolhidas dos acordeões permanecem no DOM, ocultas, da mesma forma que nas abas do produto.

## Estado ARIA e papéis

- Localize abas e painéis pelo papel (`tab`, `tabpanel`) e pelo nome, e verifique a aba selecionada com `aria-selected="true"`. Cada painel é rotulado pela sua aba por meio de `aria-labelledby`.
- Os cabeçalhos dos acordeões são botões dentro de títulos, com `aria-expanded` e `aria-controls` apontando para uma `region` rotulada pelo cabeçalho.
- A aba _Arquivo_ é desativada com `aria-disabled` em vez do atributo nativo `disabled`, então ainda pode receber clique e foco, mas não faz nada. Algumas ferramentas tratam `aria-disabled` como desativado e se recusam a clicar; outras clicam normalmente.

## Teclado

- Apenas a aba selecionada está na ordem de tabulação (`tabindex` itinerante). <kbd>Tab</kbd> passa da lista de abas para o painel, e não para a próxima aba.
- <kbd>ArrowLeft</kbd> e <kbd>ArrowRight</kbd> passam de uma aba para outra e dão a volta, <kbd>Home</kbd> e <kbd>End</kbd> vão para a primeira e a última, e a aba desativada é ignorada. Mover o foco também seleciona a aba.

## Tempo e URL

- A aba _Avaliações_ leva cerca de 1,5 segundo para carregar na primeira vez em que é selecionada, mostrando até lá uma mensagem de carregamento com `aria-busy`. Espere pelas próprias avaliações em vez de um tempo fixo.
- As abas selecionadas ficam na URL (`?product=reviews&report=monthly`), então um teste pode abrir uma aba diretamente. Uma aba desconhecida ou desativada volta para a primeira.
- Os elementos nativos `<details>` não têm `aria-expanded`: verifique o atributo `open`. O conteúdo é ocultado pelo navegador, não pela página.
