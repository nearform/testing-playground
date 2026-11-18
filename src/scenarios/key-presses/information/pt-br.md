Tudo nesta página é controlado pelo teclado, então os testes precisam enviar pressionamentos de teclas em vez de clicar ou digitar texto. Propositalmente, não há alternativa com o mouse.

## Cada controle

- O leitor de teclas mostra a última tecla pressionada na sua caixa de texto, com sua chave (key), seu código e as teclas modificadoras mantidas junto, além das últimas teclas pressionadas.
- O contador só muda quando está com o foco: as setas para cima e para baixo (ou direita e esquerda) o alteram em 1, segurar Shift o altera em 10, Home e End vão para os valores mínimo e máximo e Esc o volta ao valor inicial.
- O controle de segurar só confirma se Espaço for mantido pressionado por um segundo inteiro; soltar antes não conta, e segurar uma tecla repete seu evento keydown, então cada repetição precisa ser ignorada.
