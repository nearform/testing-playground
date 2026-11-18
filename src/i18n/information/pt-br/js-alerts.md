Cada botão abre um dos diálogos JavaScript do próprio navegador: um alerta, uma confirmação ou um prompt. Eles são desenhados pelo navegador e não pela página, então não estão no DOM e não podem ser encontrados com seletores.

## Lidando com um diálogo

- Prepare um tratamento para o diálogo antes de clicar no botão que o abre, verifique a mensagem e depois aceite ou dispense o diálogo; enquanto ele está aberto, a página não pode ser usada.
- O Playwright dispensa os diálogos sozinho, a menos que você trate o evento `dialog`. O Cypress aceita alertas e confirmações sozinho, permite verificá-los com os eventos `window:alert` e `window:confirm` e precisa de um stub de `window.prompt` para responder a um prompt. O Selenium muda para o diálogo com `switchTo().alert()`.

## Cada diálogo

- O alerta só tem o botão OK.
- A confirmação pergunta _Deseja continuar?_, e OK e Cancelar dão resultados diferentes.
- O prompt pede o seu nome com _Testador_ já preenchido. Aceitar, digitar sua própria resposta antes, enviar vazio e cancelar dão, cada um, um resultado diferente.

## O resultado

- Depois que o diálogo fecha, o painel Resultado (`data-testid="result"`) mostra o que você fez, como _Você clicou em Cancelar_ ou _Você digitou: Testador_.
