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
src/context/
└── AccessContext.tsx      # Usuário, grupos e permissões efetivas da interface
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
- racks, grupos e funções: `/api/dcim/racks/`, `/rack-groups/` e `/rack-roles/`;
- organização: `/api/dcim/sites/`, `/locations/` e `/regions/`.

O usuário do NetBox precisa das permissões de leitura e escrita correspondentes. A permissão efetiva continua sendo controlada pelo NetBox.

## Permissões por página

Após o login, o aplicativo lê o usuário retornado por `/api/authentication-check/`, incluindo permissões diretas e permissões herdadas dos grupos. Cada permissão é conferida pelo tipo de objeto do NetBox e por uma destas ações:

- `view`: visualizar a página e os objetos;
- `add`: cadastrar objetos e exibir botões de adição;
- `change`: alterar objetos existentes;
- `delete`: exibir seleção e excluir objetos.

Superusuários possuem acesso administrativo. Para usuários sem nenhuma ação de escrita, o menu identifica a sessão como **Somente leitura**.

| Página ou ação                                 | Tipo de objeto no NetBox | Permissões utilizadas                                                        |
| ---------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------- |
| Scanner e Buscar dispositivo                   | `dcim.device`            | `view`                                                                       |
| Visualizar dispositivos                        | `dcim.device`            | `view`; `add` mostra **Adicionar**; `delete` mostra checkboxes e **Excluir** |
| Informações do dispositivo                     | `dcim.device`            | `view`; `change` mostra **Personalizar** e permite salvar alterações         |
| Criar dispositivo                              | `dcim.device`            | `add`                                                                        |
| Criar função dentro do cadastro de dispositivo | `dcim.devicerole`        | `add`                                                                        |
| Criar tipo dentro do cadastro de dispositivo   | `dcim.devicetype`        | `add`                                                                        |
| Tipos de dispositivos                          | `dcim.devicetype`        | `view`, `add` e `delete`                                                     |
| Criar fabricante dentro do cadastro de tipo    | `dcim.manufacturer`      | `add`                                                                        |
| Fabricantes                                    | `dcim.manufacturer`      | `view`, `add` e `delete`                                                     |
| Funções de dispositivos                        | `dcim.devicerole`        | `view`, `add` e `delete`                                                     |
| Visualizar racks e detalhes do rack            | `dcim.rack`              | `view`; `add` mostra **Adicionar**; `delete` mostra checkboxes e **Excluir** |
| Criar rack                                     | `dcim.rack`              | `add`                                                                        |
| Criar grupo dentro do cadastro de rack         | `dcim.rackgroup`         | `add`                                                                        |
| Criar função dentro do cadastro de rack        | `dcim.rackrole`          | `add`                                                                        |
| Grupos de racks                                | `dcim.rackgroup`         | `view`, `add` e `delete`                                                     |
| Funções de racks                               | `dcim.rackrole`          | `view`, `add` e `delete`                                                     |
| Sites                                          | `dcim.site`              | `view`, `add` e `delete`                                                     |
| Locais                                         | `dcim.location`          | `view`, `add` e `delete`                                                     |
| Regiões                                        | `dcim.region`            | `view`, `add` e `delete`                                                     |

### Permissões de referência recomendadas

Alguns formulários precisam consultar objetos relacionados para preencher seleções. Além da permissão de criação do objeto principal, conceda `view` para as referências usadas:

| Formulário                | Permissões de leitura recomendadas                                               |
| ------------------------- | -------------------------------------------------------------------------------- |
| Criar dispositivo         | `dcim.site`, `dcim.location`, `dcim.rack`, `dcim.devicetype` e `dcim.devicerole` |
| Criar tipo de dispositivo | `dcim.manufacturer`                                                              |
| Criar rack                | `dcim.site`, `dcim.location`, `dcim.rackgroup` e `dcim.rackrole`                 |
| Criar local               | `dcim.site`                                                                      |
| Criar site                | `dcim.region`                                                                    |

No painel de permissões do NetBox, selecione os tipos de objeto e marque as ações equivalentes. Exemplos:

- somente consulta de dispositivos: `dcim.device` com `view`;
- operador de dispositivos: `dcim.device` com `view`, `add` e `change`;
- gestão completa de racks: `dcim.rack`, `dcim.rackgroup` e `dcim.rackrole` com `view`, `add`, `change` e `delete`;
- consulta geral sem escrita: conceda apenas `view` para todos os tipos listados na tabela.

Restrições condicionais configuradas nas Object Permissions continuam sendo avaliadas pela API do NetBox. O frontend usa as ações gerais para decidir quais controles exibir, mas o NetBox é a autoridade final para permitir ou negar cada objeto específico.

## Segurança e aplicativo móvel

A configuração atual permite HTTP claro somente para desenvolvimento com a instância local. Em produção:

1. publique o NetBox com HTTPS;
2. altere `VITE_NETBOX_API_URL` para a URL HTTPS;
3. remova `cleartext: true` do `capacitor.config.ts`;
4. mantenha o CORS restrito aos origins efetivamente usados pelo aplicativo.
