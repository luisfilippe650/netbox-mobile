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

### Organização das páginas

Cada tela possui uma pasta própria. Quando houver estilos exclusivos, o componente e o CSS usam o mesmo nome. Páginas sem estilos próprios reutilizam diretamente o CSS do componente compartilhado, sem manter arquivos vazios:

```text
src/pages/
├── devices/
│   ├── AddDevice/
│   │   ├── AddDevice.tsx
│   │   └── AddDevice.css
│   ├── DeviceTypes/
│   │   └── DeviceTypes.tsx
│   ├── Devices/
│   ├── Manufacturers/
│   ├── ObjectInfo/
│   └── shared/             # Tipos e componentes usados por várias telas de dispositivos
├── racks/
│   ├── AddRack/
│   ├── RackDetails/
│   ├── RackGroups/
│   ├── RackInfo/
│   └── shared/             # Tipos e funções comuns das telas de racks
├── organization/
│   ├── Locations/
│   ├── Regions/
│   ├── Sites/
│   └── OrganizationList/   # Estrutura visual compartilhada pelas listas
├── home/
├── login/
└── scanner/
```

Ao criar uma tela, siga `Dominio/NomeDaPagina/NomeDaPagina.tsx`. Se ela precisar de estilos exclusivos, mantenha-os em `NomeDaPagina.css`; não crie CSS vazio. Coloque em `shared/` apenas código realmente reutilizado por duas ou mais telas.

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

## Gerar o APK Android com Capacitor

### Requisitos

- Node.js e as dependências do projeto instaladas com `npm install`;
- Android Studio instalado com o Android SDK;
- Java/JDK compatível com a versão do Android Studio;
- NetBox publicado em um endereço HTTPS acessível pelos celulares.

Antes de gerar o aplicativo, configure no `.env` a API de produção. O endereço é incorporado ao bundle durante o build:

```env
VITE_NETBOX_API_URL=https://netbox.empresa.com/api
VITE_NETBOX_REQUEST_TIMEOUT_MS=15000
```

Não coloque usuário, senha ou token no `.env`.

### Primeira configuração

A plataforma Android só precisa ser adicionada uma vez:

```bash
npm install
npx cap add android
npm run build
npx cap sync android
```

A pasta `android/` gerada pelo Capacitor deve ser versionada no Git. Arquivos locais, builds e chaves de assinatura já estão protegidos pelo `.gitignore`.

### APK de teste

No Linux ou macOS:

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

No Windows, execute `gradlew.bat assembleDebug` dentro da pasta `android`.

O arquivo será criado em:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Esse APK é adequado para testes internos. Para distribuição em produção, gere um APK assinado.

### APK assinado de produção

Atualize o frontend e sincronize o projeto Android:

```bash
npm run build
npx cap sync android
npx cap open android
```

No Android Studio, use **Build > Generate Signed App Bundle or APK**, selecione **APK**, escolha ou crie uma chave de assinatura e gere a variante **release**.

Guarde a chave e suas senhas em local seguro, fora do repositório. A mesma chave será necessária para instalar atualizações sobre uma versão já publicada.

### Atualizações futuras

Depois de alterar o frontend ou o `.env`, não execute `npx cap add android` novamente. Use:

```bash
npm run build
npx cap sync android
```

Depois, gere um novo APK pelo Android Studio ou com o Gradle. Mudanças no frontend não aparecem automaticamente em um APK já instalado: é necessário gerar e instalar uma nova versão. O site publicado, por outro lado, é atualizado diretamente no navegador.

O APK contém o frontend e não precisa que este site esteja hospedado. Ele precisa apenas conseguir acessar a mesma API HTTPS do NetBox. Se site e APK forem usados em produção ao mesmo tempo, configure no NetBox as origens CORS de ambos conforme documentado no `.env.example`.

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
