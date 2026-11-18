Entre com o nome de usuário **admin** e a senha **Passw0rd!**. Qualquer outra combinação mostra um erro.

## Entrando

- Os dois valores precisam ser exatamente iguais, então diferenciam maiúsculas de minúsculas e espaços contam.
- Apertar Enter no campo de senha também faz login, assim como o botão Login.
- Um login com falha mostra _As credenciais fornecidas são inválidas_ e mantém o que foi digitado; um login bem-sucedido troca o formulário por uma mensagem e um botão Logout.

## Continuando logado

- O login salva `tp:username` e `tp:isLoggedIn` no `localStorage`, então a página continua logada depois de recarregar ou em uma nova aba.
- Se os seus testes compartilham uma sessão do navegador (como no Selenium, ou no Cypress com o isolamento de testes desligado), esse estado passa de um teste para o próximo, então faça logout ou limpe o `localStorage` antes; para começar um teste já logado, defina `tp:username` e `tp:isLoggedIn` (como `true`) antes de a página carregar.
- O logout remove as duas chaves e esvazia o formulário.
