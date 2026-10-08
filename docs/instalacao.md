# Instalação e execução

**Português (Brasil)** | [English](en/installation.md)

## Pré-requisitos

Para executar no navegador:

- **Node.js 22.12 ou superior** e npm, atendendo às exigências das dependências do projeto.
- Uma instância do **NetBox** com API REST acessível, provisionamento de tokens e endpoint `/api/authentication-check/` disponíveis.
- Usuário do NetBox com permissões para os objetos que pretende consultar ou modificar.
- CORS do servidor configurado para permitir a origem do frontend.
- Para leitura de QR Code, câmera disponível e permissão de acesso. No navegador, use HTTPS ou `localhost` para acessar a câmera.

Para compilar e executar no Android, também são necessários:

- **Android Studio**, **Android SDK 36** e **JDK 21**.
- SDK configurado no ambiente ou em `app/android/local.properties`.
- Emulador ou aparelho com **Android 7.0 (API 24) ou superior**.
- Android SDK Platform-Tools (`adb`) para instalação pelo terminal.

## Execução

### Navegador

Clone o repositório e entre na pasta `app/`:

```bash
git clone https://github.com/luisfilippe650/netbox-mobile.git
cd netbox-mobile/app
npm ci
cp .env.example .env.local
```

Edite `.env.local` conforme a seção [Configuração](configuracao.md) e inicie o servidor:

```bash
npm run dev
```

Abra o endereço exibido pelo Vite no terminal, normalmente `http://localhost:5173`, e entre com suas credenciais do NetBox. O servidor NetBox deve estar em execução separadamente.

### Build web

Configure uma API **HTTPS** antes de gerar o build de produção:

```bash
npm run build
npm run preview
```

O build é gerado em `app/dist/`. O comando `preview` permite conferir localmente o resultado.

### APK Android de teste

Dentro de `app/`, gere o frontend de desenvolvimento, sincronize o Capacitor e compile o APK:

```bash
npm run android:build:debug
```

Para usar o NetBox do computador no emulador padrão do Android Studio, em Bash/Linux/macOS:

```bash
VITE_NETBOX_API_URL=http://10.0.2.2:8000/api npm run android:build:debug
```

O APK será gerado em `app/android/app/build/outputs/apk/debug/app-debug.apk`. Para instalar no aparelho ou emulador conectado, ainda dentro de `app/`:

```bash
adb devices
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Havendo vários dispositivos conectados, selecione o destino com `adb -s SERIAL install -r ...`.

Para um emulador ou Android conectado por USB que utilize `http://localhost:8000/api` no aplicativo, você pode encaminhar a porta:

```bash
adb reverse tcp:8000 tcp:8000
```

Esse encaminhamento depende da conexão ADB ativa; configure-o novamente caso a conexão seja perdida. O APK contém o frontend e não precisa do Vite aberto, mas continua dependendo de acesso à API do NetBox.

### Android de produção

Configure uma API HTTPS e execute, dentro de `app/`:

```bash
npm run android:sync
npx cap open android
```

No Android Studio, use **Build > Generate Signed App Bundle or APK** para gerar a variante **release** assinada. Guarde a chave de assinatura fora do repositório para utilizá-la nas futuras atualizações.

A plataforma Android já está incluída no projeto. Após alterar o frontend ou as variáveis de ambiente, sincronize, gere e instale novamente o APK.

### Verificações do projeto

Dentro de `app/`:

```bash
npm run lint
npm test
```
