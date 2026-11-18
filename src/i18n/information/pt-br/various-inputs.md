Cada linha tem um campo nativo à esquerda e, à direita, uma saída somente leitura que mostra exatamente o que o campo contém, para que você possa digitar em um e verificar o outro.

## Os campos

- Há campos de texto, senha, número, data e texto de várias linhas, cada um com um test id com o nome do seu tipo: `text-input`, `password-input`, `number-input`, `date-input` e `textarea-input`.
- As saídas são caixas de texto simples somente leitura, então a senha aparece em texto puro.
- Quando o que é digitado no campo de número não é um número válido, o valor dele fica vazio, e a saída também.

## Datas

- A aparência do campo de data e o jeito de digitar nele dependem do navegador e do idioma, mas o valor, que a saída mostra, é sempre `yyyy-mm-dd`.
- A maioria dos frameworks consegue defini-lo diretamente com um valor nesse formato, como `2025-01-31`, em vez de digitar o dia, o mês e o ano separadamente.

## Limpando

- Cada campo de uma linha mostra seu próprio botão de limpar quando tem um valor; o campo de várias linhas não tem.
- O botão Limpar Tudo, no topo, esvazia todos os campos de uma vez.
