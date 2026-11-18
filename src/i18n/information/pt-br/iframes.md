Tudo dentro de um iframe pertence a um documento separado, então seletores executados na página não o encontram: os testes precisam entrar no frame primeiro e sair dele de novo para verificar qualquer coisa na página.

## Cada exemplo

- O formulário envia sua mensagem para a página fora do frame.
- O contador fica dentro de um frame que está dentro de outro frame, então são necessárias duas trocas para alcançá-lo.
- O editor de texto rico funciona como muitos editores WYSIWYG clássicos: o texto editado é o corpo de um frame, enquanto a barra de ferramentas, a contagem de palavras e o HTML ficam na página ao redor, então um teste precisa alternar entre os dois.
