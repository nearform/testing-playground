Ler e escrever na área de transferência do sistema exige permissões que não fazem parte da página, e cada navegador lida com elas de forma diferente: conceda `clipboard-read` e `clipboard-write` no seu framework de testes (quando ele as suportar) e confira o resultado lendo a área de transferência de volta, em vez de confiar no rótulo _Copiado!_.

## Permissões e navegadores

- A Clipboard API só existe em um contexto seguro (HTTPS ou localhost) e precisa ser chamada a partir de um gesto do usuário enquanto a página tem o foco, então um clique de um teste que moveu o foco para outro lugar ainda pode falhar.
- No Chromium, conceda `clipboard-read` e `clipboard-write` (no Playwright com `context.grantPermissions`), ou a leitura será recusada com um erro de permissão. Firefox e WebKit não suportam essas permissões da mesma forma: o Firefox mostra seu próprio pop-up _Colar_ para `readText`, no qual um teste não consegue clicar.
- Navegadores headless podem usar uma área de transferência própria, não compartilhada com o sistema operacional, e testes executados em paralelo na mesma máquina podem sobrescrever a área de transferência uns dos outros no modo headed.
- Se a permissão for negada ou a API não existir, a página mostra um erro explicando o motivo, o que facilita identificar a falha em uma captura de tela.

## Copiando

- Cada botão _Copiar_ grava seu valor com `navigator.clipboard.writeText` e mostra _Copiado!_ por dois segundos. Verifique o conteúdo da área de transferência, não apenas o rótulo.
- A chave de API aparece mascarada, mas a chave completa é copiada, então o texto na tela não é o que vai para a área de transferência.

## Colando

- _Colar da área de transferência_ lê a área de transferência com `navigator.clipboard.readText` e mostra o que encontrou.
- O campo de notas cancela o evento de colar e insere uma versão limpa, em texto simples, então digitar o texto, definir o valor ou simular uma colagem dão resultados diferentes. Um evento de colar sintético precisa de um `clipboardData` com `text/plain`.
- O campo _Confirmar senha_ recusa texto colado, então um teste que o preenche colando falha e precisa digitar a senha. Preencher o campo diretamente ignora o evento de colar por completo.

## Cópia bloqueada

- O segundo campo de referência cancela os eventos `copy` e `cut`, então selecionar o texto e usar o atalho de copiar deixa a área de transferência inalterada. Compare-o com o campo ao lado.
