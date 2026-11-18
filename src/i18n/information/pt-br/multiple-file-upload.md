A primeira seção é um campo de arquivo nativo que aceita vários arquivos de uma vez. A segunda é uma área de soltar, como a maioria dos componentes de envio: o campo real fica oculto, os arquivos são verificados ao serem adicionados e cada um é enviado com sua própria barra de progresso.

## O campo por trás da área de soltar

- O `<input type="file">` da área de soltar fica visualmente oculto e fora da ordem de tabulação: os usuários veem apenas a área e o botão *Procurar arquivos*. O `setInputFiles()` do Playwright funciona em campos ocultos, então mire direto em `#drop-zone-input`. O `selectFile()` do Cypress verifica se o elemento é acionável, o que um campo oculto pode não ser, então passe `{ force: true }`.
- Clicar em *Procurar arquivos* abre a janela de arquivos do sistema operacional, que nenhuma ferramenta de teste consegue controlar. No Playwright, aguarde o evento `filechooser` e chame `setFiles()` nele; nas demais, não clique e defina os arquivos do campo diretamente.
- Para testar o próprio soltar, simule-o na área. No Cypress, use `selectFile(file, { action: 'drag-drop' })` na área. No Playwright, crie um `DataTransfer` na página com `page.evaluateHandle()` e passe-o para `dispatchEvent('drop', { dataTransfer })`. O Selenium não tem uma forma nativa, então execute um script que dispare os eventos.
- O campo é esvaziado após cada seleção, para que o mesmo arquivo possa ser escolhido de novo depois de removido. Por isso, verificar os `files` do campo não diz nada: verifique a lista de arquivos.

## Escolhendo vários arquivos

- O primeiro campo tem o atributo `multiple`. Passe um array para `setInputFiles()` ou `selectFile()`. No Selenium, envie para `sendKeys()` os caminhos absolutos separados por quebras de linha.
- Escolher de novo substitui a seleção em vez de somar a ela, como nos campos nativos, enquanto a área de soltar adiciona à sua lista a cada vez.
- Os arquivos não precisam existir no disco: o Playwright aceita `{ name, mimeType, buffer }` e o Cypress aceita `{ contents, fileName, mimeType }`.

## Validação

- Só são aceitas imagens PNG, JPEG, GIF e WebP de até {{max}} cada. O atributo `accept` do campo só filtra a janela de arquivos: arquivos definidos por um teste ou soltos passam por ele, então a página verifica cada arquivo e lista os que recusou.
- O tipo vem do tipo MIME do arquivo, não do nome, então um arquivo chamado `photo.png` com o tipo `text/plain` é recusado. Defina o tipo MIME ao criar arquivos em um teste, ou ele será deduzido pela extensão.
- Um arquivo com o mesmo nome e tamanho de outro já na lista é recusado como duplicado. Quando uma seleção mistura arquivos válidos e inválidos, os válidos são adicionados e só os outros aparecem no erro.
- Testar o limite de tamanho exige um arquivo com mais de {{max}}: crie um em memória, por exemplo com `Buffer.alloc(1024 * 1024 + 1)`.

## Progresso, pré-visualizações e remoção

- Cada imagem começa a ser enviada assim que é adicionada, e arquivos maiores demoram mais, até cerca de 3 segundos. Aguarde `data-status="uploaded"`, o texto *Enviado* ou o `aria-valuenow` da barra de progresso chegar a 100, em vez de um tempo fixo.
- *Enviar* fica desativado enquanto alguma imagem ainda está sendo enviada.
- Cada arquivo tem seu próprio botão de remover, com o nome dele (*Remover photo.png*), e a remoção funciona também durante o envio. Encontre a linha de um arquivo pelo nome e aja dentro dela, não pela posição, pois remover um arquivo faz os seguintes subirem.
- As pré-visualizações usam URLs `blob:` criadas na página, então o `src` muda a cada execução. Verifique o texto alternativo da pré-visualização, ou se ela carregou (`naturalWidth` maior que 0), em vez do `src`.
