Nada do que é desenhado em um canvas está no DOM: as barras, o alvo e o seu desenho são apenas pixels, então não há elemento nem texto para um localizador encontrar. Um teste precisa agir em coordenadas e conferir os resultados escritos abaixo de cada canvas. Cada canvas é exibido no tamanho em que é desenhado, então uma posição em pixels CSS a partir do canto superior esquerdo é a mesma posição em pixels do canvas: use `click({ position: { x, y } })` no Playwright ou `.click(x, y)` no Cypress.

## Bloco de desenho

- Um traço exige pressionar o botão, mover o ponteiro e soltar o botão, então um simples clique não desenha nada e não é contado.
- Controle-o com `page.mouse.move`, `page.mouse.down` e `page.mouse.up`, que usam coordenadas da página (some a posição da caixa delimitadora do canvas), ou dispare eventos de ponteiro no canvas.
- O número de traços e pontos aparece abaixo do bloco e nos atributos `data-strokes` e `data-points`.

## Gráfico de barras

- O canvas tem 480 × 260 pixels, a barra _i_ (contando a partir de 0) tem 50 pixels de largura e está centralizada em x = 75 + 70 × _i_, e o eixo fica em y = 230, então um clique em y = 225 sempre acerta uma barra.
- Um clique entre ou acima das barras informa que nenhuma barra foi clicada.

## Alvo

- O alvo tem raio de 15 pixels e aparece em (60, 60), (340, 240), (200, 150), (320, 50) e (80, 250), nessa ordem.
- O centro atual fica nos atributos `data-target-x` e `data-target-y` do canvas, um atalho que um jogo de verdade não daria.

## Mapa dos bairros

- O mapa é SVG, então as regiões são elementos, mas não têm papel nem nome acessível e o `svg` é uma única imagem para tecnologias assistivas, então localizadores por papel não encontram nada dentro dele.
- Encontre uma região com `[data-region="harbour"]`. O XPath precisa de `//*[local-name()='polygon']`, porque os elementos SVG ficam em um namespace próprio.
- O Porto contorna a Cidade Velha, então o meio da sua caixa delimitadora, onde as ferramentas clicam e passam o mouse por padrão, fica na Cidade Velha: clique com um deslocamento, por exemplo perto da borda inferior.
- Os nomes no mapa ignoram o mouse e passam os cliques para a região de baixo, então uma ferramenta que verifica qual elemento está sob o ponteiro antes de clicar, como o Playwright, espera que um nome receba o clique e esgota o tempo.
- A dica só aparece enquanto o mouse está sobre uma região e o acompanha, então precisa de um hover em vez de um clique.

## Testes de captura de tela

- Tudo é desenhado em tamanho fixo e com cores fixas, qualquer que seja o tema, sem animação e sem nada aleatório, então as mesmas ações sempre geram a mesma imagem.
- Capture apenas o canvas ou o mapa em vez da página inteira, e espere pequenas diferenças entre navegadores, sistemas operacionais e fontes (suavização e texto): mantenha uma referência por navegador e plataforma, ou permita um pequeno limite de tolerância.
- Os pixels também podem ser lidos diretamente com `canvas.toDataURL()` ou `getContext('2d').getImageData()`.
