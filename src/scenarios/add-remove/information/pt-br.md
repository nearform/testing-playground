Adicionar Elemento adiciona um botão Remover Elemento numerado, e clicar em um deles o remove. Os botões ficam salvos no `sessionStorage` na chave `tp:elements`, e o número do próximo botão em `tp:nextIndex`, então continuam lá depois de recarregar a página.

## Numeração

- Cada botão novo recebe o próximo número e os números não são reaproveitados, então remover o botão 2 de três deixa o 1 e o 3, e o próximo adicionado é o 4.
- Depois que todos os botões são removidos, a numeração recomeça do 1.
- O test id de cada botão inclui o número dele, como `remove-element-3`.

## Estado inicial

- Adicionar `?initialElements=5` à URL (`#/add-remove?initialElements=5`) abre a página com os botões de 1 a 5, o que poupa adicioná-los um por um.
- O parâmetro só é usado quando a página carrega sem botões salvos, então recarregar com botões já no `sessionStorage` o ignora.
- Limpar Armazenamento remove todos os botões apagando apenas essas duas chaves, então o que outros cenários salvaram no `sessionStorage` é mantido. Cada aba tem seu próprio `sessionStorage`, então uma nova aba ou contexto do navegador sempre começa vazio.
