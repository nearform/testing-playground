Tudo nesta página depende da hora atual ou da passagem do tempo, e as esperas são propositalmente longas: a oferta dura cinco minutos, e o aviso de sessão só aparece após dez minutos sem nenhuma atividade.

## Controlando o relógio

- Esperar por eles em tempo real deixa o teste lento e instável, então controle o relógio, com `page.clock` no Playwright, `cy.clock()` e `cy.tick()` no Cypress, ou `vi.useFakeTimers()` no Vitest.
- Instale o relógio falso antes de a página carregar, pois temporizadores iniciados antes dele continuam no relógio real.
- A página relê o relógio a cada segundo e calcula cada estado a partir da hora atual, então avançar o relógio de uma vez (por exemplo com `page.clock.fastForward()`, que dispara um temporizador vencido só uma vez) chega direto ao estado certo.

## O que depende do relógio

- A saudação e o aviso de horário de funcionamento dependem da hora e do dia da semana, então um teste que não fixa a hora passa ou falha conforme o momento em que roda: defina uma hora fixa, como um sábado ou um dia útil às 08:00, antes de carregar a página. Eles também usam o fuso horário do navegador.
- Os horários relativos passam de "agora mesmo" para "há 1 minuto" e depois para horas e dias, e o horário exato fica no atributo `datetime`.

## Tempo limite da sessão

- O tempo limite da sessão conta qualquer movimento do mouse, clique, tecla ou rolagem como atividade, então um teste que move o mouse enquanto espera o reinicia.
- O aviso cobre a página inteira, então enquanto ele estiver aberto qualquer outro clique na página é interceptado até que seja fechado; com o aviso aberto, só Continuar conectado mantém a sessão, e depois de desconectado, só Entrar novamente inicia outra.

## Busca e salvamento

- A busca só roda meio segundo depois que você para de digitar, então o teste deve esperar pelos resultados, ou avançar o relógio, em vez de verificá-los logo após digitar; o contador de buscas mostra quantas buscas realmente rodaram.
- Salvar tem throttle: depois de salvar, novos cliques são ignorados por dois segundos, então dois cliques seguidos salvam só uma vez.
