 
const axios = require('axios');
const https = require('https');

// Verifica se o ambiente está em modo de depuração
const core = process.env.NODE_ENV === 'debug' ? {
    getInput: (name) => process.env[name.toUpperCase()] || null,
    info: (message) => console.log(`🔧 DEBUG: ${message}`),
    setFailed: (msg) => console.error(`🔧 DEBUG: ${msg}`)
} : require('@actions/core'); // Usa o core real caso não esteja em modo de debug

// Função para pegar as flags
function getBooleanInput(name, defaultValue = false) {
    return core.getInput(name) === 'true' || defaultValue;
}

// Função para pegar o token de autenticação
async function getAuthToken(client, tokenInput, username, password) {
    if (tokenInput) {
      core.info('🔐 Usando token de autenticação fornecido...');
      return tokenInput;
    }
  
    if (!username || !password) {
      throw new Error('Username e password são obrigatórios se o token não for fornecido.');
    }
  
    core.info('🔐 Autenticando com usuário e senha...');
    // Fazendo a autenticação com o usuário e senha e pegando o token
    try {
        const response = await client.post('/session', { username, password });
        return response.data.token;
    } catch (error) {
        throw new Error('Erro ao autenticar: ' + error.message);
    }
}

// Função para atualizar a aplicação
async function refreshApplication(client, app) {
    try {
        core.info('🔄 Executando refresh...');
        await client.get(
          `/applications/${app}?refresh=true`
        );
        core.info(`🔄 Aplicação ${app} atualizada com sucesso!`);
    } catch (error) {
        core.setFailed(`❌ Erro ao atualizar a aplicação ${app}: ${error.message}`);
    }
}

// Função para sincronizar a aplicação
async function syncApplication(client, app) {
    try {
        // Pegando a flag de prune
        const prune = getBooleanInput('prune');
        core.info(`✅ Executando sync${prune ? ' (com prune)' : ''}...`);

        // Sincronizando a aplicação
        await client.post(
            `/applications/${app}/sync`,
            prune ? { prune: true } : {}
        );

        core.info(`✅ Aplicação ${app} sincronizada com sucesso!`);
    } catch (error) {
        core.setFailed(`❌ Erro ao sincronizar a aplicação ${app}: ${error.message}`);
    }
}

async function run() {
  try {
    const server = core.getInput('argocd_server');
    if (!server) throw new Error('URL do servidor ArgoCD é obrigatória.');

    const baseURL = `${server}/api/v1`;
    const insecure = getBooleanInput('insecure');
    const client = axios.create({
      baseURL,
      httpsAgent: insecure ? new https.Agent({ rejectUnauthorized: false }) : undefined,
    });
      
    core.info(`🔄 Conectando em ${baseURL}${insecure ? ' (modo insecure)' : ''}...`);
    // Pegando o token de autenticação
    const token = await getAuthToken(
        client,
        core.getInput('argocd_token'),
        core.getInput('argocd_username'),
        core.getInput('argocd_password')
    );
    if (!token) throw new Error('Token de autenticação é obrigatório.');

    // Montando o header de autenticação
    const authHeaders = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
    // Setando o header de autenticação
    client.defaults.headers.common = authHeaders.headers;
    // Pegando as aplicações separadas por vírgula e removendo espaços em branco e traforma em array

    const apps = core.getInput('argocd_applications').split(',').map(app => app.trim()).filter(Boolean);

    // Pegando as flags
    const doRefresh = getBooleanInput('refresh');
    core.info(`🔄 Refresh: ${doRefresh}`);
    const doSync = getBooleanInput('sync');
    core.info(`🔄 Sync: ${doSync}`);
    
    // Iterando sobre as aplicações
    for (const app of apps) {
      core.info(`🎯 Aplicação: ${app}`);
      if (doRefresh) {
        await refreshApplication(client, app);
      }
      if (doSync) {
        await syncApplication(client, app);
      }
    }

    core.info('🚀 Sincronização finalizada com sucesso!');
  } catch (error) {
    core.setFailed(`❌ Erro na Action: ${error.message}`);
  }
}

// Executando a função
run();
