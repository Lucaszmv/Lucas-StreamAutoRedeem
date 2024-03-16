my $readme = <<README;
# Lucas-StreamAutoRedeem - Resgatador Automático de Itens da Loja StreamElements 🛍️

![Lucas Logo](https://i.imgur.com/JEiczij.png)

Lucas-StreamAutoRedeem é um aplicativo desenvolvido em Node.js que automatiza o resgate de itens na loja do StreamElements durante transmissões ao vivo. Ele permite que os viewers, streamers e moderadores resgatem itens da loja de forma automática, economizando tempo e simplificando o processo.

## Funcionalidades Principais 🚀

- **Resgate Automático de Itens:** Lucas-StreamAutoRedeem pode verificar os pontos do usuário e resgatar automaticamente um item da loja quando pontos suficientes estão disponíveis.
- **Exibição de Informações:** Fornece informações detalhadas sobre os pontos do usuário, o item a ser resgatado e o status da operação de resgate.
- **Configurações Personalizáveis:** O aplicativo permite configurar o tempo de espera entre as verificações e personalizar os dados do usuário e da loja.

## Pré-requisitos 📋

Antes de usar o Lucas-StreamAutoRedeem, certifique-se de ter instalado:

- Node.js
- npm (Node Package Manager)
- Conta no StreamElements
- Token JWT para autorização de API

## Instalação e Uso 🛠️

1. Clone o repositório para o seu ambiente local:

\`\`\`
git clone https://github.com/Lucaszmv/Lucas-StreamAutoRedeem.git
\`\`\`

2. Instale as dependências do projeto:

\`\`\`
cd Lucas
npm install
\`\`\`

3. Execute o aplicativo:

\`\`\`
node app.js
\`\`\`

4. Siga as instruções no terminal para configurar e usar o Lucas-StreamAutoRedeem.

## Configuração Personalizada ⚙️

Antes de executar o aplicativo, é necessário configurar alguns parâmetros no arquivo \`config.json\`:

- \`tempoEspera\`: Define o tempo de espera (em milissegundos) entre as verificações de pontos.
- \`novoNomeCanal\`: Nome do canal no StreamElements.
- \`novoNomeUser\`: Nome do usuário no StreamElements.
- \`itemId\`: ID do item na loja do StreamElements.
- \`jwtToken\`: Token JWT para autorização de API do StreamElements.

## Contribuição 🤝

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests para melhorar o Lucas-StreamAutoRedeem.

## Licença 📄

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE.md](LICENSE.md) para mais detalhes.
README

print $readme;
