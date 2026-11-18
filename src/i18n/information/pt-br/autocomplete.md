Comece a digitar em qualquer um dos campos para ver sugestões.

## Pelo teclado

- Use as setas para cima e para baixo para percorrê-las (elas voltam ao início), Enter para escolher a destacada ou clique em uma sugestão; Esc fecha a lista e um segundo Esc limpa o campo.
- Sair do campo com Tab fecha a lista sem escolher nada, e alterar o texto depois de escolher desfaz a escolha.

## Correspondências e marcação

- O campo segue o padrão ARIA combobox: aria-expanded indica se a lista está aberta e aria-activedescendant aponta para a opção destacada, que tem aria-selected="true".
- As sugestões correspondem a qualquer parte de um nome, ignorando maiúsculas e acentos; os nomes que começam com o texto digitado aparecem primeiro e a parte correspondente fica em negrito.

## País e cidade

- O campo de países filtra uma lista fixa imediatamente.
- O campo de cidades consulta um servidor fictício lento: ele espera pelo menos {{min}} caracteres e uma pausa de {{debounce}} ms na digitação, mostra uma mensagem de carregamento enquanto espera, retorna no máximo {{max}} cidades e responde mais devagar a buscas curtas do que a longas, então uma resposta antiga pode chegar depois de uma nova; apenas a resposta para o texto atual é exibida.
