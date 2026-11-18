Cada seção altera a página após um atraso aleatório entre {{min}} e {{max}} segundos, sorteado novamente a cada vez, então uma pausa fixa às vezes é curta demais e sempre mais lenta do que o necessário: espere pela condição de que você realmente precisa.

## Cada seção

- A primeira seção só adiciona seu elemento ao DOM quando o indicador de carregamento termina, então ele não pode ser encontrado antes disso.
- A segunda tem seu elemento no DOM desde o início, mas oculto com `display: none`, então ele está *presente* muito antes de estar *visível*.
- A terceira tem um campo desativado até que a etapa assíncrona termine, e clicar nele enquanto está desativado não faz nada.
- A quarta remove sua caixa de seleção e depois adiciona uma totalmente nova, então uma referência ao elemento antigo fica obsoleta e precisa ser buscada novamente.
- A última mostra "Carregando..." e depois "Ainda carregando..." antes do texto final, então esperar apenas que "Carregando..." desapareça não basta: espere pelo texto esperado.
