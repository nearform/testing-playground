Cada botão mostra sua mensagem duas vezes: como um popup sobre a página e como um alerta embaixo dos botões. Os dois somem sozinhos depois de 6 segundos.

## O popup e o alerta

- O popup fica em uma região de notificações (chamada _Notifications (F8)_) e tem um test id formado por `notification-` e o tipo, como `notification-success`.
- O alerta embaixo dos botões tem um test id formado por `message-` e o tipo, e o nome do tipo em maiúsculas, no idioma escolhido, como título, como _SUCESSO_ em português.
- O popup pode ser fechado antes com o botão de fechar, mas o alerta não: ele sempre fica os 6 segundos inteiros.

## O tempo

- Os quatro botões ficam desativados enquanto o alerta é mostrado, então só uma notificação aparece por vez: espere o alerta sumir antes de disparar a próxima.
- O cronômetro do popup pausa enquanto o ponteiro está sobre ele ou ele está em foco, então um teste que passa o mouse sobre ele ou clica nele o mantém aberto por mais de 6 segundos, enquanto o alerta some na hora certa.
- Em vez de esperar 6 segundos, o controle de relógio do seu framework (como `page.clock` no Playwright ou `cy.clock()` no Cypress) pode adiantar o tempo.
