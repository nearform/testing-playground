Tudo nesta página só aparece enquanto o ponteiro do mouse está sobre algo, então os testes precisam passar o mouse primeiro. Sua última ação é exibida abaixo.

## Cada seção

- Os detalhes de cada cartão de perfil não estão no DOM até que o mouse passe sobre o cartão e, de propósito, não há outra forma de exibi-los.
- Os botões de cada arquivo estão sempre no DOM, mas ficam invisíveis até que o mouse passe sobre a linha, então um teste que clicar neles diretamente será avisado de que não estão visíveis; pelo teclado, também é possível exibi-los chegando à linha com Tab.
- O menu abre seus submenus um instante depois que o mouse para sobre um item e fecha um instante depois que o ponteiro sai dele, então percorra-o como uma pessoa faria; clicar em um item abre seu submenu imediatamente.
