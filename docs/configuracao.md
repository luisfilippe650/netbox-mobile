# Configuração

**Português (Brasil)** | [English](en/configuration.md)

O arquivo [`app/.env.example`](https://github.com/luisfilippe650/netbox-mobile/blob/main/app/.env.example) contém um guia detalhado. Use uma cópia local em `app/.env.local`:

```env
VITE_NETBOX_API_URL=http://localhost:8000/api
VITE_NETBOX_REQUEST_TIMEOUT_MS=15000
```

| Variável | Descrição |
| --- | --- |
| `VITE_NETBOX_API_URL` | URL absoluta da API REST do NetBox, incluindo `/api`. Obrigatória. |
| `VITE_NETBOX_REQUEST_TIMEOUT_MS` | Tempo limite de cada requisição, em milissegundos. Padrão: `15000` (15 segundos). |

### Endereço da API por ambiente

| Ambiente | Exemplo de URL |
| --- | --- |
| Navegador no computador do NetBox | `http://localhost:8000/api` |
| Emulador padrão do Android Studio | `http://10.0.2.2:8000/api` |
| Celular físico na mesma rede | `http://192.168.1.20:8000/api` |
| Produção web ou Android | `https://netbox.empresa.com/api` |

Substitua os endereços de exemplo pelos do seu servidor. No Android, `localhost` aponta para o próprio dispositivo, exceto quando o encaminhamento de porta pelo ADB está configurado. O IP usado deve estar acessível pelo Wi-Fi ou VPN, com a porta liberada no servidor.

HTTP é permitido nos fluxos de desenvolvimento e no APK debug. Builds de produção exigem HTTPS; a variante Android release bloqueia tráfego HTTP.

### CORS e permissões no NetBox

Configure no servidor as origens realmente utilizadas pelo frontend, sem acrescentar `/api`:

- Desenvolvimento web: `http://localhost:5173`, ou a origem exibida pelo Vite.
- APK debug: `http://localhost`.
- APK release: `https://localhost`.
- Site publicado: a origem HTTPS do seu site.

As permissões são verificadas por tipo de objeto e pelas ações `view`, `add`, `change` e `delete`. Conceda também leitura dos objetos relacionados necessários aos formulários, como sites, racks, tipos e funções ao cadastrar um equipamento. O NetBox continua responsável pela autorização efetiva das operações.

### Ambiente e sessão

- Reinicie o Vite após alterar os arquivos de ambiente. Para o Android, gere e instale novamente o APK.
- Arquivos específicos de modo, como `.env.production.local`, podem sobrescrever `.env.local`; variáveis definidas no terminal têm prioridade.
- Variáveis `VITE_` são incorporadas ao frontend. Configure apenas os dados públicos de conexão; usuário e senha são informados na tela de login.
- No navegador, o token permanece em memória. No Android, a sessão é persistida de forma protegida com Android Keystore. Ao sair, o aplicativo tenta revogar o token no NetBox e limpa a sessão local.
