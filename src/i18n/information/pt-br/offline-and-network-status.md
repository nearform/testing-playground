A página escuta os eventos `online` e `offline` do navegador e lê `navigator.onLine`, então um teste precisa cortar a conexão pelo próprio navegador (no Playwright com `context.setOffline`, no Cypress ou WebdriverIO pelas condições de rede do Chrome DevTools Protocol) em vez de parar um servidor.

## Ficando offline

- Bloquear requisições com interceptação não altera `navigator.onLine` nem dispara o evento `offline`, então o banner continua verde e a fila não espera. Só um corte no nível do navegador muda os dois.
- `navigator.onLine` como `true` só significa que o navegador tem uma conexão de rede, não que o site pode ser alcançado. Uma requisição ainda pode falhar enquanto o banner diz online, e a página informa isso como erro de rede, não como offline.
- Desligar a rede à mão no DevTools e num teste é a mesma coisa, mas navegadores que não são Chromium podem não suportar isso: veja o que seu framework oferece para Firefox e WebKit.

## A fila de mensagens

- Toda mensagem entra na fila e é enviada na hora se o navegador estiver online, então online uma mensagem fica na fila só por um instante. Espere ela aparecer em *Mensagens enviadas* em vez de verificar a fila logo depois de enviar.
- Offline, as mensagens esperam na fila, em ordem, e são enviadas quando o evento `online` é disparado. As mensagens que tiveram que esperar aparecem marcadas em *Mensagens enviadas*.
- O envio usa uma requisição real para um arquivo publicado com o site (o site é estático e não pode receber a mensagem em si), e é ela que falha quando a rede cai. Intercepte `status.json` para fazer o envio falhar com um erro do servidor.

## Requisições que falham

- *Verificar status do serviço* pede o mesmo arquivo. Se falhar, o erro diz se o navegador estava offline, se a requisição não teve resposta ou se o servidor respondeu com um erro, e *Tentar novamente* repete a requisição. O número da tentativa é mostrado para que um teste diferencie uma nova tentativa da primeira.
- A resposta nunca vem do cache do navegador, então uma requisição feita offline sempre falha.

## Eventos de conexão

- Cada evento `online` e `offline` é registrado com a hora em que aconteceu, depois de um registro do estado em que a página carregou. As horas estão no formato 24 horas `HH:MM:SS` no fuso horário do navegador, com o horário completo no atributo `datetime`.
- É o navegador que decide quando disparar esses eventos, então não espere um registro para cada troca que seu teste fizer: mudar para o estado em que o navegador já está não dispara nada.
