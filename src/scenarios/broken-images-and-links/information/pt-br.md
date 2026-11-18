Algumas imagens e links desta página funcionam e outros não, para verificar que cada imagem carrega e que cada link leva a algum lugar. Cada imagem e cada link tem um atributo `data-expected` com o valor `ok` ou `broken`, para que um teste possa comparar o que encontra com o que deveria encontrar.

## Imagens quebradas

- Uma imagem quebrada continua na página: mantém o seu `src`, mostra o texto alternativo e está visível, então verificar que a `<img>` existe ou está visível passa. Em vez disso, verifique se terminou de carregar e tem tamanho: `img.complete && img.naturalWidth === 0` significa que falhou.
- A imagem com URL inválida nunca faz uma requisição, então não aparece como 404 no registro de rede. Só a própria imagem indica que falhou.
- Escutar respostas com falha só captura requisições feitas depois de adicionar o ouvinte, então adicione-o antes de carregar a página.

## Carregamento lento

- A última imagem tem `loading="lazy"` e fica abaixo da dobra, então o navegador só a solicita quando ela se aproxima da área visível.
- Até lá, `complete` é falso e `naturalWidth` é 0, então uma verificação feita logo de início a reporta como quebrada (ou, com Verificar imagens, como ainda não carregada). Role até ela e espere que carregue antes de verificá-la.

## Verificar links

- Clicar em cada link é lento e sai da página, então solicite cada URL com uma requisição de API (`page.request.get()` no Playwright, `cy.request()` no Cypress) e verifique se o status é menor que 400. Leia a propriedade `href` resolvida em vez do atributo, que pode ser relativo.
- Um arquivo estático inexistente, como a página antiga da galeria, retorna um 404 de verdade.
- Este playground usa roteamento por hash, então um link para uma página da aplicação como `#/cookies-and-storage` só solicita a página inicial: o servidor retorna 200 mesmo para uma página que não existe. Em vez disso, abra esses links e verifique se a página mostra o seu conteúdo.
- Sites externos podem bloquear requisições automatizadas, limitá-las ou estar fora do ar, o que torna instável a verificação de links externos. Muitas suítes os verificam de forma agendada em vez de em cada execução.

## Links de âncora

- Como o # da URL já é usado para o roteamento, os links para seções desta página são tratados por script: clicar em um rola até a seção sem mudar a URL.
- Para verificar uma âncora, procure um elemento cujo `id` corresponda à parte depois do #. O link para a seção de avaliações não tem seção correspondente, então clicar nele não faz nada.
