O formulário é dividido em etapas: dados pessoais, dados da empresa (apenas contas empresariais), endereço, preferências (opcional) e revisão. Cada etapa tem sua própria URL, como `?step=address`, e as respostas são salvas no `sessionStorage` à medida que você avança.

## As etapas e a URL

- Próximo adiciona uma entrada ao histórico, então o botão voltar do navegador volta uma etapa, assim como o botão Voltar do formulário.
- Uma etapa só pode ser exibida quando todas as anteriores estão concluídas. Abrir `?step=review` em uma página nova mostra a primeira etapa no lugar, e a URL é corrigida com `history.replaceState`. Espere a URL ou o título da etapa se estabilizar em vez de verificar logo após navegar.
- Para ir direto a uma etapa posterior, preencha as etapas anteriores pela interface ou defina a chave `multi-step-form` no `sessionStorage` antes de a página carregar, por exemplo com `page.addInitScript()` no Playwright ou `onBeforeLoad` no Cypress. Os dados precisam ser válidos e as etapas anteriores devem estar listadas em `completed` (ou `skipped`, para a etapa opcional).

## Validação e conteúdo condicional

- Próximo só verifica os campos da etapa atual. Os erros aparecem depois de clicar em Próximo, depois se atualizam enquanto você digita, e o foco vai para o primeiro campo com erro.
- Voltar não valida, então uma etapa concluída pode ficar inválida. Avançar de novo, ou abrir a URL de uma etapa posterior, traz você de volta a ela.
- Escolher *Empresarial* adiciona uma etapa de dados da empresa, então o total de etapas passa de 4 para 5 e cada etapa seguinte avança uma posição. Encontre as etapas pelo nome ou pelo atributo `data-step`, não pela posição.
- A etapa de preferências é opcional: Pular avança sem salvá-la como concluída, e a revisão a mostra como pulada. O campo de telefone só existe enquanto *Telefone* é a forma de contato escolhida.
- Voltar para uma conta pessoal esconde a etapa da empresa. As respostas dela são mantidas, mas deixam de aparecer na revisão.

## Revisão, foco e respostas salvas

- Cada seção da revisão tem um link cujo texto visível é apenas *Editar*. Os nomes acessíveis dizem qual etapa eles abrem, por exemplo *Editar Endereço*, então procure-os por papel e nome. Depois de editar, o botão principal mostra *Salvar e voltar para a revisão* em vez de Próximo.
- Quando a etapa muda, o foco vai para o título da etapa. Digitar logo após clicar em Próximo não preenche nenhum campo.
- As respostas sobrevivem a um recarregamento, mas não a uma nova aba ou a um novo contexto do navegador, pois o `sessionStorage` pertence a uma única aba. Recomece, ou limpe o armazenamento, para que um teste não veja as respostas de outro. Enviar o formulário também as apaga.
- Cada etapa é um page object natural, com um componente compartilhado para a lista de progresso e os botões Voltar, Próximo e Pular, e as etapas se encaixam bem em cenários BDD como *Dado que preenchi meus dados pessoais*.
