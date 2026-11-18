Um formulário de cadastro que valida cada campo, para você verificar a mensagem de erro de cada tipo de engano. A validação própria do navegador está desligada (`novalidate`), então todas as mensagens vêm da página.

## Quando os erros aparecem

- Um campo é validado quando você sai dele e de novo quando o formulário é enviado; depois de validado, a mensagem dele se atualiza enquanto você digita.
- Enviar com erros mostra quantos são no topo do formulário, em um alerta (`data-testid="form-error-summary"`).
- Um formulário válido mostra uma mensagem de sucesso com o seu nome, e Limpar esvazia todos os campos e mensagens.

## As regras

- O nome completo é obrigatório, tem pelo menos 2 caracteres e só pode ter letras, espaços, hifens e apóstrofos.
- O e-mail é obrigatório e precisa ter o formato `name@example.com`.
- Telefone e site são opcionais, mas precisam ser válidos se preenchidos: um telefone tem de 10 a 15 dígitos, pode começar com + e ter espaços, e um site precisa começar com `http://` ou `https://`.
- A idade é obrigatória e precisa ser um número inteiro de 18 a 120.
- A senha precisa ter pelo menos 8 caracteres com uma letra maiúscula, uma minúscula e um número, e Confirmar Senha precisa ser igual a ela.

## Encontrando as mensagens

- O test id de cada campo é o nome dele, como `email` ou `confirm-password`, e o erro e a dica acrescentam `-error` e `-hint`, como `email-error`.
