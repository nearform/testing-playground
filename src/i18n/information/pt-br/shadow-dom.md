Quatro exemplos escondidos dentro de shadow roots. Seletores comuns param no limite de uma shadow root, então cada um testa como a sua ferramenta chega lá dentro.

## Cada exemplo

- A shadow root aberta contém um pequeno formulário. Os locators do Playwright entram sozinhos em shadow roots abertas, o Cypress entra com `.shadow()` ou a opção `includeShadowDom`, e o Selenium pela shadow root do host.
- O exemplo aninhado tem uma shadow root dentro de outra, então são dois passos: entrar no host externo e depois no interno.
- O botão no slot aparece dentro de uma shadow root, mas pertence ao light DOM, então seletores comuns o encontram a partir da página.
- A shadow root fechada não pode ser alcançada por `host.shadowRoot`, que é `null`, e os locators do Playwright também não a atravessam. Chegue ao botão dela de outro jeito, como usando o Tab no teclado ou clicando onde ele aparece na tela.

## Verificando o resultado

- Cada exemplo mostra seu resultado onde você pode verificá-lo: a saudação, o contador e a contagem do botão no slot ficam ao lado deles, e a contagem da root fechada fica do lado de fora, no light DOM (`data-testid="closed-shadow-status"`).
