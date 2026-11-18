Quase todo site real mostra um banner de consentimento de cookies na primeira visita, e ele cobre a página até ser respondido, por isso é a primeira coisa que atrapalha um teste de ponta a ponta. Aqui o banner só aparece um segundo depois de a página carregar, como acontece com banners adicionados por um script de terceiros, então verificar que ele não está lá logo após o carregamento passa cedo demais.

## Onde o estado é guardado

- A escolha fica guardada no cookie `tp_cookie_consent` (`accepted`, `rejected` ou `custom`), e as escolhas de análise e marketing ficam no `localStorage` em `tp:cookie_preferences`, então ambas sobrevivem a um recarregamento.
- O caminho do cookie é `/testing-playground`, então ao defini-lo em um teste informe esse caminho além do domínio; um cookie em `/` só é usado quando não há nenhum no caminho do playground.
- A nota de sessão fica no `sessionStorage` em `tp:session_note`, que pertence a uma única aba: ela sobrevive a um recarregamento, mas some em uma nova aba ou em um novo contexto do navegador.

## Mantendo os testes independentes

- Testes que compartilham um contexto do navegador vazam esse estado entre si, então comece cada teste com um contexto limpo ou use Limpar tudo.
- Clicar no banner em todo teste é lento e frágil; em vez disso, prepare o estado antes de a página carregar, com `context.addCookies`, `page.addInitScript` ou um `storageState` salvo no Playwright, ou com `cy.setCookie` e `onBeforeLoad` no Cypress, como mostrado no fim da página.

## Inspecionando e limpando o armazenamento

- A visualização ao vivo só lê o armazenamento quando esta página o altera, então, depois de alterar o armazenamento a partir de um teste, clique em Atualizar ou recarregue a página.
- Limpar tudo remove apenas o que este cenário armazena; as configurações de idioma e tema do próprio site são mantidas.
