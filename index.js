// Importa os módulos necessários
const axios = require('axios');
const readline = require('readline-sync');
const colors = require('colors');
const figlet = require('figlet');
const fs = require('fs');
 
// Adiciona a configuração para tratamento de caracteres especiais
readline.setDefaultOptions({ encoding: 'utf-8' });
 
// Verifica se o arquivo db.json existe, se não existir, cria um objeto vazio
let database = {};
if (fs.existsSync('db.json')) {
    const data = fs.readFileSync('db.json', 'utf8');
    database = JSON.parse(data);
}

 // Função para gerar texto em arte ASCII de forma síncrona
 function gerarFigletSync(texto) {
    try {
        const result = figlet.textSync(texto, {
            font: 'Sub-Zero',
            width: 80,
        });
        console.log(result);
    } catch (err) {
        console.error(err);
    }
}
 // Função para exibir o cabeçalho do programa no terminal
function exibirCabecalho() {
    console.clear();
    gerarFigletSync('Lucas');
    console.log('>', `"Sua única limitação é aquela que você impõe em sua própria mente."`.cyan);
    console.log('>', 'Criado por: Lucas'.cyan);
    console.log('>', 'Versão: 1.0.0\n'.cyan);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
 // Função para salvar os dados no arquivo db.json
function salvarDadosNoArquivo() {
    fs.writeFileSync('db.json', JSON.stringify(database, null, 2), 'utf8');
    console.log('\n>', 'Dados salvos no arquivo db.json com sucesso!'.green);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
 
// Função assíncrona para obter informações de pontos do usuário e resgatar um item na loja
async function obterInformacoesPontos(novoNomeUser, channelID, itemId, jwtToken) {
    let pontosUsuario = 0;
    let itemResgatado = false;
 
    while (!itemResgatado) {
        let pontosResponse, itemInfo;
 
        try {
            const inicioChamada = Date.now();
 
            const [pontosResponseTemp, responseItens] = await Promise.all([
                axios.get(`https://api.streamelements.com/kappa/v2/points/${channelID}/${novoNomeUser}`),
                axios.get(`https://api.streamelements.com/kappa/v2/store/${channelID}/items`),
            ]);
 
            pontosResponse = pontosResponseTemp;
 
            if (pontosResponse && pontosResponse.data) {
                pontosUsuario = pontosResponse.data.points;
            } else {
                console.error('Erro ao obter informações sobre os pontos: Resposta da API inválida.');
                continue;
            }
 
            itemInfo = responseItens.data.find((item) => item._id === itemId);
 
            const duracaoChamada = Date.now() - inicioChamada;
            console.clear();
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Tempo da API:'.bold, duracaoChamada, 'ms'.bold);
 
            if (pontosResponse && pontosResponse.headers) {
                console.log(
                    'API Limite: '.bold,
                    `${pontosResponse.headers['x-ratelimit-remaining']}/${pontosResponse.headers['x-ratelimit-limit']}`
                );
            }
 
            console.log('\nInformações do usuario:'.bold);
            console.log('> ' + 'Usuario: '.cyan, novoNomeUser);
            console.log('> ' + 'Pontos: '.cyan, pontosUsuario);
 
            if (pontosResponse && pontosResponse.data) {
                console.log('> ' + 'Rank: '.cyan, pontosResponse.data.rank);
            }
 
            if (itemInfo) {
                console.log('\nInformações do item:'.bold);
                console.log('> ' + 'Nome: '.cyan, itemInfo.name);
                console.log('> ' + 'Quantidade: '.cyan, `${itemInfo.quantity.current}/${itemInfo.quantity.total}`);
                console.log('> ' + 'Preço: '.cyan, itemInfo.cost);
            } else {
                console.log(
                    'As informações do item ainda não foram obtidas. Execute a função para obter informações do item primeiro.'
                );
            }
 
            if (pontosUsuario >= itemInfo.cost && !itemResgatado) {
                await resgatarItem(channelID, itemId, jwtToken);
                itemResgatado = true;
            } else {
                console.log('\nPontos insuficientes. Verificando novamente!'.red);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                await new Promise((resolve) => setTimeout(resolve, database.tempoEspera));
            }
        } catch (error) {
            console.log('Entrou no bloco catch. Verificando erro...');
 
            if (error.response && error.response.status === 401) {
                console.error(
                    'Erro 401 - Unauthorized. Não autorizado a realizar esta operação. Verifique o Token!'.red
                );
                process.exit(1);
            } else if (error.response && error.response.status === 520) {
                console.error('Erro 520 do Cloudflare. Tentando novamente após o erro...'.yellow);
            } else if (error.response && error.response.status === 429) {
                console.error('Erro 429 - Too Many Requests. Aguarde antes de fazer a próxima tentativa.'.yellow);
                await new Promise((resolve) => setTimeout(resolve, 250));
            } else {
                console.error(
                    'Erro ao obter informações sobre os pontos:',
                    error.response ? error.response.data : error.message
                );
                console.log('\nContinuando após o erro...'.yellow);
                await new Promise((resolve) => setTimeout(resolve, 250));
            }
        }
    }
}
 
// Função para resgatar o item pela API
async function resgatarItem(channelID, itemId, jwtToken) {
    try {
        const apiUrl = `https://api.streamelements.com/kappa/v2/store/${channelID}/redemptions/${itemId}`;
 
        // Configuração da requisição
        const config = {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        };
 
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Enviando requisição POST para:', apiUrl.yellow);
 
        const postResponse = await axios.post(apiUrl, {}, config);
        console.log('Resposta da requisição POST:', postResponse.status, postResponse.statusText);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Resposta da API:\n'.bold);
        console.log('Nome Canal:'.green, database.novoNomeCanal);
        console.log('Nome Usuario:'.green, database.novoNomeUser);
        console.log('ID Canal:'.green, postResponse.data.channel);
        console.log('ID Usuario:'.green, postResponse.data.redeemer);
        console.log('ID Item:'.green, postResponse.data.item);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Pontos suficientes e item resgatado com sucesso!'.green.bold);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        // Aguarda o usuário pressionar Enter antes de retornar ao menu principal
        console.log('\n> Pressione Enter para voltar ao menu.');
        readline.question('');
    } catch (error) {
        if (error.response) {
            if (
                error.response.status === 401 &&
                error.response.data.message === 'Not allowed to perform this operation'
            ) {
                console.error('\n> Erro 401 - Não autorizado para realizar esta operação. Verifique seu token.'.red);
            } else if (error.response.status === 400 && error.response.data.message === 'You are redeeming too fast') {
                console.error(
                    '\n> Erro 400 - Você esta resgatando muito rapido. Aguarde um momento e tente novamente.'.red
                );
            } else {
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.error('> Erro ao resgatar o item:', error.response.data);
            }
        } else {
            console.error('Erro ao resgatar o item:', error.message);
        }
    }
}
 // Função assíncrona para obter os itens disponíveis na loja através da API
async function obterItensDisponiveisNaLoja() {
    try {
        const responseItens = await axios.get(
            `https://api.streamelements.com/kappa/v2/store/${database.channelID}/items`
        );
        const itens = responseItens.data;
 
        console.clear();
        exibirCabecalho();
 
        // Exibir informações de cada item
        itens.forEach((item) => {
            console.log('Nome:'.cyan, item.name);
            console.log('Quantidade:'.cyan, item.quantity.current);
            console.log('ID:'.cyan, item._id);
            console.log('Tipo:'.cyan, item.type);
            console.log('Custo:'.cyan, item.cost);
            console.log('Ativo:'.cyan, item.enabled ? 'Sim' : 'Não');
 
            if (item.userInput && item.userInput.length > 0) {
                console.log('> Perguntas:'.bold);
                item.userInput.forEach((pergunta, index) => {
                    console.log(`   ${index + 1}. ${pergunta}`);
                });
            }
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'); // Separador entre os itens
        });
 
        // Adiciona uma pausa após exibir os itens
        console.log('\nPressione Enter para voltar ao menu.');
        readline.question('');
    } catch (error) {
        if (error.response && error.response.status === 520) {
            console.error('Erro 520 ao obter itens da loja via API.'.red);
            console.log('\nContinuando após o erro...'.yellow);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
            console.error(
                'Erro ao obter informações sobre os pontos:'.red,
                error.response ? error.response.data : error.message.red
            );
            console.log('\nContinuando após o erro...'.yellow);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
}
 // Função assíncrona para iniciar o programa
async function iniciar() {
    if (Object.keys(database).length === 0) {
        console.clear();
        exibirCabecalho();
        const novoNomeCanal = readline.question('> ' + 'Digite o novo nome do canal: '.cyan);
        const novoNomeUser = readline.question('> ' + 'Digite o novo nome de usuario: '.cyan);
 
        try {
            // Obtém o ID correspondente ao novo nome do canal usando a API do StreamElements
            const responseChannelId = await axios.get(
                `https://api.streamelements.com/kappa/v2/channels/${novoNomeCanal}`
            );
            const novoChannelId = responseChannelId.data._id;
 
            const responseUserId = await axios.get(`https://api.streamelements.com/kappa/v2/channels/${novoNomeUser}`);
            const novoUserId = responseUserId.data._id;
 
            const itemId = readline.question('> ' + 'Digite o ID do item que deseja verificar: '.cyan);
            const jwtToken = readline.question('> ' + 'Digite o seu token JWT: '.cyan);
 
            // Atualiza o banco de dados com os novos dados
            database = {
                channelID: novoChannelId,
                novoNomeCanal,
                novoUserId,
                novoNomeUser,
                itemId,
                jwtToken,
            };
            salvarDadosNoArquivo();
        } catch (error) {
            // Trata erros que possam ocorrer durante o processo
            console.error('Erro ao iniciar:', error.message);
        }
    }
 
    const { novoNomeUser, channelID, itemId } = database;
    await obterInformacoesPontos(novoNomeUser, channelID, itemId, database.jwtToken);
 
    return true;
}
 // Função assíncrona para alterar os dados do usuário
async function alterarDados() {
    console.clear();
    exibirCabecalho();
    const novoNomeCanal = readline.question('> ' + 'Digite o novo nome do canal: '.cyan);
    const novoNomeUser = readline.question('> ' + 'Digite o novo nome de usuario: '.cyan);
 
    try {
        // Obtém o ID correspondente ao novo nome do canal usando a API do StreamElements
        const responseChannelId = await axios.get(`https://api.streamelements.com/kappa/v2/channels/${novoNomeCanal}`);
        const novoChannelId = responseChannelId.data._id;
 
        const responseUserId = await axios.get(`https://api.streamelements.com/kappa/v2/channels/${novoNomeUser}`);
        const novoUserId = responseUserId.data._id;
 
        const itemId = readline.question('> ' + 'Digite o novo ID do item que deseja verificar: '.cyan);
        const jwtToken = readline.question('> ' + 'Digite o novo token JWT: '.cyan);
 
        // Atualiza o banco de dados com o novo nome do canal e o ID correspondente
        database = {
            channelID: novoChannelId,
            novoNomeCanal,
            novoUserId,
            novoNomeUser,
            itemId,
            jwtToken,
        };
        salvarDadosNoArquivo();
 
        console.log('Pressione Enter para continuar...');
        readline.question(''); // Agora, aguarda o usuário pressionar Enter antes de continuar
    } catch (error) {
        // Trata erros ao obter o ID do novo canal
        console.error('Erro ao obter o ID do novo canal:', error.message);
        console.log('\nContinuando após o erro...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}
 // Função assíncrona para exibir os dados salvos do usuário
async function exibirDadosSalvos() {
    try {
        const responseItens = await axios.get(
            `https://api.streamelements.com/kappa/v2/store/${database.channelID}/items`
        );
        const itens = responseItens.data;
 
        console.clear();
        exibirCabecalho();
 
        console.log('Informações Salvas no Banco de Dados:'.bold);
        console.log('> ' + 'Tempo de espera: '.cyan, database.tempoEspera, 'ms');
        console.log('> ' + 'Nome do Canal: '.cyan, database.novoNomeCanal);
        console.log('> ' + 'Nome de Usuario: '.cyan, database.novoNomeUser);
        console.log('> ' + 'ID do Canal: '.cyan, database.channelID);
        console.log('> ' + 'ID de Usuario: '.cyan, database.novoUserId);
        console.log('> ' + 'ID do Item: '.cyan, database.itemId);
        console.log('> ' + 'Token JWT: '.cyan, database.jwtToken);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
 
        // Adiciona uma pausa após exibir as informações
        console.log('\nPressione Enter para voltar ao menu.');
        readline.question('');
    } catch (error) {
        if (error.response && error.response.status === 520) {
            console.error('Erro 520 ao obter itens da loja via API.'.red);
            console.log('\nContinuando após o erro...'.yellow);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
            console.error(
                'Erro ao obter informações sobre os pontos:'.red,
                error.response ? error.response.data : error.message.red
            );
            console.log('\nContinuando após o erro...'.yellow);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
}
 // Função para alterar o tempo de espera
function alterarTempoEspera() {
    console.clear();
        exibirCabecalho();
    const novoTempoEspera = readline.question('> ' + 'Digite o novo tempo de espera em milissegundos: ');
    database.tempoEspera = parseInt(novoTempoEspera);
    salvarDadosNoArquivo();
}
 // Função assíncrona que representa o menu principal do programa
async function menuPrincipal() {
    let continua = true;
 
    while (continua) {
        console.clear();
        exibirCabecalho();
        console.log('Escolha uma opção:\n'.bold);
        console.log('[1] -', 'Iniciar'.cyan);
        console.log('[2] -', 'Alterar Dados'.cyan);
        console.log('[3] -', 'Verificar Loja'.cyan);
        console.log('[4] -', 'Verificar Dados'.cyan);
        console.log('[5] -', 'Alterar Tempo de Espera'.cyan); // Adicione esta linha
        console.log('\n[0] - Sair');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
 
        const opcao = readline.question('> ' + 'Escolha uma opcao: ');
 
        switch (opcao) {
            case '1':
                await iniciar();
                break;
            case '2':
                await alterarDados();
                break;
            case '3':
                await obterItensDisponiveisNaLoja();
                break;
            case '4':
                await exibirDadosSalvos();
                break;
            case '5': // Adicione este bloco
                alterarTempoEspera(); // Chama a função para alterar o tempo de espera
                break;
            case '0':
                console.clear();
                console.log('\nSaiu do programa.\n');
                process.exit();
            default:
                console.log('\nOpção invalida. Tente novamente.');
        }
    }
}
// Inicia o programa chamando a função menuPrincipal
menuPrincipal();
