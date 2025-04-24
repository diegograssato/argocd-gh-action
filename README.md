# ArgoCD GitHub Action

GitHub Action para sincronizar múltiplas aplicações ArgoCD via API

## Inputs

| Nome | Descrição | Obrigatório | Padrão |
|------|-----------|-------------|--------|
| `argocd_server` | URL do servidor ArgoCD (ex: https://argo.example.com) | ✅ | - |
| `argocd_token` | Token de autenticação JWT (opcional, substitui  `argocd_username` e `argocd_password`) | ❌ | - |
| `argocd_username` | Nome de usuário ArgoCD | ❌ | - |
| `argocd_password` | Senha do usuário ArgoCD | ❌ | - |
| `argocd_applications` | Lista de aplicações separadas por vírgula | ✅ | - |
| `refresh` | Se deve forçar refresh da aplicação | ❌ | `false` |
| `sync` | Se deve sincronizar a aplicação | ✅ | `true` |
| `insecure` | Ignora verificação TLS | ❌ | `false` |
| `prune` | Remove recursos ausentes nos manifests | ❌ | `false` |

## Exemplo de uso

```yaml
- name: Deploy via ArgoCD utilizando username e password
  uses: diegograssato/argocd-gh-action@v1
  with:
    argocd_server: ${{ secrets.ARGOCD_SERVER }}
    argocd_username: ${{ secrets.ARGOCD_USERNAME }}
    argocd_password: ${{ secrets.ARGOCD_PASSWORD }}
    argocd_applications: "app1,app2"
    refresh: "true"
    sync: "true"
    insecure: "true"
    prune: "true"
```

## Usando token

```yaml
- name: Deploy via ArgoCD utilizando token
  uses: diegograssato/argocd-gh-action@v1
  with:
    argocd_server: ${{ secrets.ARGOCD_SERVER }}
    argocd_token: ${{ secrets.ARGOCD_TOKEN }}
    argocd_applications: "app1,app2"
    refresh: "true"
    sync: "true"
    insecure: "true"
    prune: "true"
```


### Para realizar teste localmente para desenvolvimento

Defina o environment como "debug":

```bash
export NODE_ENV=debug
```

Agora basta exportar as variavis para usar dentro index.js, por convensão:

```bash
export ARGOCD_SERVER=http://argocd.dtux.local
export ARGOCD_TOKEN=xxxxxx
ou
export ARGOCD_USERNAME=diego
export ARGOCD_PASSWORD=diego
export ARGOCD_APPLICATIONS='gha-runner-scale-set-controller,gha-runner-scale-set-jira'
export REFRESH=true
export SYNC=true
export INSECURE=true
```

Agora só executar:

```bash
npm install

npm debug
ou
npm test
```

Output 

```bash
npm test

> argocd-gh-action@1.0.0 test
> npm run test:debug


> argocd-gh-action@1.0.0 test:debug
> NODE_ENV=debug node src/index.js

🔧 DEBUG: 🔄 Conectando em http://argocd.dtux.local/api/v1 (modo insecure)...
🔧 DEBUG: 🔐 Autenticando com usuário e senha...
🔧 DEBUG: 🔄 Refresh: false
🔧 DEBUG: 🔄 Sync: true
🔧 DEBUG: 🎯 Aplicação: gha-runner-scale-set-controller
🔧 DEBUG: ✅ Executando sync...
🔧 DEBUG: ✅ Aplicação gha-runner-scale-set-controller sincronizada com sucesso!
🔧 DEBUG: 🎯 Aplicação: gha-runner-scale-set-jira
🔧 DEBUG: ✅ Executando sync...
🔧 DEBUG: ✅ Aplicação gha-runner-scale-set-jira sincronizada com sucesso!
🔧 DEBUG: 🚀 Sincronização finalizada com sucesso!
```