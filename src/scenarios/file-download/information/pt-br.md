O botão Baixar Arquivo salva um pequeno arquivo de texto chamado `file.txt` que contém `Sample content`. O arquivo é criado no navegador, não buscado em um servidor, então um teste precisa capturar o próprio download.

## Como o download funciona

- O botão cria uma URL `blob:` para o arquivo, clica em um link temporário com o atributo `download` e depois remove o link e revoga a URL na hora, então não há link na página para ler nem endereço para pedir de novo.
- Nada muda na página depois de um download, então a única coisa a verificar é o arquivo.

## Verificando o arquivo

- No Playwright, espere o evento `download` durante o clique e depois verifique o `suggestedFilename()` e o conteúdo do arquivo salvo.
- No Cypress, o arquivo é salvo na `downloadsFolder` (`cypress/downloads` por padrão), então leia-o de lá com `cy.readFile()`.
- No Selenium e no WebdriverIO, defina a pasta de download do navegador nas opções dele e espere o arquivo aparecer lá, já que a gravação pode levar um momento.
