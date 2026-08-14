# NetBox Mobile — Gerenciador de Datacenter

Cliente React/Capacitor para as funções DCIM do NetBox. A aplicação usa a API REST como única fonte de dados; nenhum cadastro de exemplo é mantido no frontend.

Os DTOs de entrada e as respostas da API são validados em runtime com Zod. Os tipos TypeScript da integração são inferidos dos mesmos schemas, evitando divergência entre tipagem estática e validação real.

## Organização dos serviços

```text
src/services/
├── client/
│   ├── client_api.ts      # Transporte HTTP, paginação e métodos REST
│   ├── client_dto.ts      # Contratos comuns, autenticação e token
│   ├── client_service.ts  # Fachada pública e fluxo de autenticação
│   ├── client_config.ts   # Configuração centralizada da API
│   ├── client_errors.ts   # Normalização dos erros HTTP e Zod
│   └── client_session.ts  # Armazenamento e autorização do token
├── devices/               # Dispositivos, tipos, funções e fabricantes
├── racks/                 # Racks e grupos de racks
├── sites/                 # Sites, locais e regiões
├── load-data.ts           # Carregamento inicial coordenado
├── view_models.ts         # Modelos normalizados consumidos pela interface
└── index.ts               # Fachada pública dos serviços
```

Cada domínio repete três responsabilidades explícitas: `*_dto.ts` contém schemas Zod e tipos inferidos, `*_api.ts` concentra endpoints e chamadas HTTP, e `*_service.ts` expõe a fachada e os mapeamentos usados pela aplicação. Por exemplo, toda manutenção de `/api/dcim/devices/` fica em `services/devices/`.

## Configuração

Copie `.env.example` para `.env` e configure:

```env
VITE_NETBOX_API_URL=http://localhost:8000/api
VITE_NETBOX_REQUEST_TIMEOUT_MS=15000
```

No navegador local, `localhost` aponta para o computador. Em um celular físico, use o IP do computador acessível pela rede, por exemplo `http://192.168.1.20:8000/api`. No emulador Android, normalmente use `http://10.0.2.2:8000/api`.

O arquivo `.env` é local e ignorado pelo Git. Nunca grave usuário, senha ou token nele. O aplicativo provisiona um token v2 após o login e o mantém apenas em `sessionStorage`; no logout, tenta revogar o token no NetBox.

## Execução

```bash
npm install
npm run dev
```

Para gerar o bundle:

```bash
npm run build
```

## Recursos NetBox usados

- autenticação: `/api/users/tokens/provision/` e `/api/authentication-check/`;
- dispositivos, tipos, funções e fabricantes: `/api/dcim/devices/`, `/device-types/`, `/device-roles/` e `/manufacturers/`;
- racks e grupos: `/api/dcim/racks/` e `/rack-groups/`;
- organização: `/api/dcim/sites/`, `/locations/` e `/regions/`.

O usuário do NetBox precisa das permissões de leitura e escrita correspondentes. A permissão efetiva continua sendo controlada pelo NetBox.

## Segurança e aplicativo móvel

A configuração atual permite HTTP claro somente para desenvolvimento com a instância local. Em produção:

1. publique o NetBox com HTTPS;
2. altere `VITE_NETBOX_API_URL` para a URL HTTPS;
3. remova `cleartext: true` do `capacitor.config.ts`;
4. mantenha o CORS restrito aos origins efetivamente usados pelo aplicativo.
