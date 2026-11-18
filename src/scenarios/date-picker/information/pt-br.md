## Navegando pelo calendário

- Cada seletor abre o calendário em um pop-up adicionado ao final do `<body>` da página, e não ao lado do campo, então procure-o no documento inteiro em vez de dentro do contêiner do campo.
- Não é possível digitar nos seletores de consulta e de viagem: para chegar a uma data de outro mês, use os botões de mês anterior e próximo ou as listas de mês e ano, e confira antes qual mês está sendo exibido.
- O seletor de viagem continua aberto depois do primeiro dia e fecha depois do último; escolher um dia antes do primeiro recomeça a partir dele.
- No calendário, as setas movem um dia e uma semana, Page Up e Page Down um mês, Home e End para o início e o fim da semana, Enter escolhe o dia em foco e Esc fecha o calendário.

## Quais dias podem ser escolhidos

- Os dias que podem ser escolhidos dependem da data de hoje, lida no relógio do navegador quando a página abre, então um teste que escolhe "a próxima segunda-feira" ou "o dia 15 deste mês" obtém outra data (ou uma desativada) em outro dia, a menos que o relógio seja simulado.
- Os dias desativados continuam visíveis e podem receber foco, mas são marcados com `aria-disabled`, riscados, e clicar neles não faz nada.
- Consultas e viagens podem ser marcadas até o fim de {{lastYear}}.

## Lendo a data escolhida

- Cada dia é um botão cujo texto é só o número do dia, cujo nome acessível é a data completa no idioma atual (por exemplo, "sexta-feira, 20 de novembro de 2026") e que tem um atributo `data-date` no formato ISO.
- Abaixo de cada seletor, o valor escolhido aparece no formato ISO (AAAA-MM-DD), igual em todos os idiomas: verifique esse valor em vez do texto exibido.

## Diferenças entre idiomas

- O campo de data de nascimento segue o formato do idioma atual (MM/DD/YYYY em inglês, DD/MM/AAAA em francês e português), então 03/04/2000 é 4 de março em inglês, mas 3 de abril em português, e o texto só é verificado ao pressionar Enter ou quando o campo perde o foco; datas futuras ou anteriores a {{minYear}} são recusadas.
- A semana começa no domingo em inglês e português e na segunda-feira em francês, então a mesma data fica em outra coluna.
