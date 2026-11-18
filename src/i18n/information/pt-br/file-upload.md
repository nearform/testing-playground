Escolha qualquer arquivo, clique em Enviar e espere a mensagem de sucesso. Nada é enviado para lugar nenhum: o envio é simulado e leva de 1 a 10 segundos, ao acaso, qualquer que seja o tamanho do arquivo.

## Escolhendo um arquivo

- O `<input type="file">` de verdade (`data-testid="select-file"`) está oculto, e o botão Selecionar Arquivo é o rótulo dele, que abre o seletor de arquivos do sistema. Em vez disso, defina o arquivo direto no campo, com `setInputFiles()` no Playwright ou `selectFile()` no Cypress (com `{ force: true }`, já que o campo está oculto).
- Qualquer tipo e tamanho de arquivo é aceito, um de cada vez, e o nome do arquivo escolhido aparece embaixo.
- O botão Enviar só aparece depois que um arquivo é escolhido.

## Esperando o envio

- Enquanto o envio acontece, o botão Enviar fica desativado e aparece uma barra de progresso sem valor (indeterminada).
- Um envio pode levar até 10 segundos, mais do que os tempos limite padrão das asserções no Cypress (4 segundos) e no Playwright (5 segundos), então dê um tempo limite maior à mensagem de sucesso em vez de colocar uma espera fixa.
- Escolher outro arquivo apaga a mensagem anterior.
