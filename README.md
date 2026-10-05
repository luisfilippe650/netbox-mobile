# Datacenter Manager

**English** | [Português (Brasil)](README_PT-BR.md)

Datacenter Manager is an independent, community-oriented open-source project for viewing and managing datacenter infrastructure from a browser or Android device. It connects to the **[NetBox](https://netboxlabs.com/products/netbox/)** REST API to work with devices, racks, sites, locations, regions and physical connections.

The application reads and updates data directly in your NetBox instance and respects the authenticated user's permissions. **English is the default interface language**; Portuguese (Brazil) is also available through **Home → menu → Languages**, and the selection is saved on the device.

This project is an independent mobile client of NetBox. It is not an official product of the NetBox project or NetBox Labs. For advanced configuration and operations outside the app's scope, use the NetBox web interface.

## Status

**Under development.** The project includes a React web interface, an Android application built with Capacitor, and automated tests with Vitest. The frontend package is named `datacenter-manager` and its current version is `0.0.0`. Available functionality is described below.

## Features

- **Authentication and permissions:** sign in using NetBox credentials, action-level access control, and identification of read-only sessions.
- **Devices:** paginated lists, search by name or asset tag, creation, detail views, editing and deletion according to permissions.
- **Device catalogs:** view, create and delete manufacturers, device types and device roles.
- **QR Codes:** scan codes with the camera to find devices, and generate codes to save as images.
- **Custom fields:** display and edit fields according to the definitions and validation configured in NetBox.
- **Racks:** list, create and delete racks, manage rack groups and roles, and view rack occupancy and devices in a rack diagram.
- **Organization:** view, create and delete sites, locations and regions.
- **Physical connections:** view cables, termination details and connection diagrams, and create connections according to permissions.
- **Browser and Android support:** a web frontend and Android APK packaging through Capacitor.
- **English and Portuguese:** switch the interface language from the home menu without reloading the application.

## Screenshots

Application screenshots are available in [`fotos_do_projeto`](fotos_do_projeto/). They illustrate the workflows and may show an earlier version of the visual identity.

<table>
  <tr>
    <th>Login</th>
    <th>Home</th>
  </tr>
  <tr>
    <td><img src="fotos_do_projeto/login.png" alt="Datacenter Manager login screen" width="280"></td>
    <td><img src="fotos_do_projeto/home.png" alt="Home screen with access to application features" width="280"></td>
  </tr>
  <tr>
    <th>Rack list</th>
    <th>Rack details and occupancy</th>
  </tr>
  <tr>
    <td><img src="fotos_do_projeto/listagem_racks.png" alt="List of racks registered in NetBox" width="280"></td>
    <td><img src="fotos_do_projeto/informacoes_racks.png" alt="Rack details showing occupied and available units and the device diagram" width="280"></td>
  </tr>
</table>

## Technologies

| Technology | Purpose |
| --- | --- |
| React 19 | Interface and components |
| TypeScript 6 | Frontend and integration types |
| Vite 8 | Development server and build |
| Capacitor 8 | Android integration |
| NetBox REST API | Data, authentication and permissions |
| Zod 4 | Input and API response validation |
| jsQR and qrcode | QR Code scanning and generation |
| CSS | Styling and responsive layout |
| Vitest and jsdom | Automated tests |
| Oxlint | Static code analysis |
| Gradle and Android SDK | Android application builds |

## Prerequisites

To run in a browser:

- **Node.js 22.12 or later** and npm, meeting the requirements of the project's dependencies.
- A **NetBox** instance with an accessible REST API, token provisioning, and the `/api/authentication-check/` endpoint.
- A NetBox user with permission to view or modify the required objects.
- Server CORS settings allowing the frontend origin.
- A camera and access permission for QR Code scanning. In a browser, use HTTPS or `localhost` to access the camera.

To build and run on Android, you also need:

- **Android Studio**, **Android SDK 36** and **JDK 21**.
- The SDK configured in the environment or in `app/android/local.properties`.
- An emulator or device running **Android 7.0 (API 24) or later**.
- Android SDK Platform-Tools (`adb`) for installation from the terminal.

## Installation and usage

### Browser

Clone the repository and enter the `app/` directory:

```bash
git clone https://github.com/luisfilippe650/netbox-mobile.git
cd netbox-mobile/app
npm ci
cp .env.example .env.local
```

Edit `.env.local` as described in [Configuration](#configuration), then start the development server:

```bash
npm run dev
```

Open the address printed by Vite, usually `http://localhost:5173`, and sign in with your NetBox credentials. NetBox must run separately and be reachable from the browser.

### Web build

Configure an **HTTPS** API before building for production:

```bash
npm run build
npm run preview
```

The output is generated in `app/dist/`. The `preview` command lets you inspect the build locally.

### Android debug APK

From `app/`, build the development frontend, synchronize Capacitor, and compile the APK:

```bash
npm run android:build:debug
```

To connect the standard Android Studio emulator to NetBox on your computer, in Bash/Linux/macOS:

```bash
VITE_NETBOX_API_URL=http://10.0.2.2:8000/api npm run android:build:debug
```

The APK is generated at `app/android/app/build/outputs/apk/debug/app-debug.apk`. Install it on the connected device or emulator from `app/`:

```bash
adb devices
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

When multiple devices are connected, select the target using `adb -s SERIAL install -r ...`.

For an emulator or USB-connected Android device using `http://localhost:8000/api` in the app, you can forward the port instead:

```bash
adb reverse tcp:8000 tcp:8000
```

This forwarding belongs to the active ADB connection; configure it again if the connection is lost. The APK includes the frontend and does not require Vite to be running, but it still needs access to the NetBox API.

### Production Android build

Configure an HTTPS API and run these commands from `app/`:

```bash
npm run android:sync
npx cap open android
```

In Android Studio, use **Build > Generate Signed App Bundle or APK** to create a signed **release** build. Store the signing key outside the repository and retain it for future updates.

The Android platform is already included. After changing the frontend or environment variables, synchronize, rebuild and reinstall the APK.

### Project checks

From `app/`:

```bash
npm run lint
npm test
```

## Configuration

[`app/.env.example`](app/.env.example) contains a detailed guide. Create a local copy at `app/.env.local`:

```env
VITE_NETBOX_API_URL=http://localhost:8000/api
VITE_NETBOX_REQUEST_TIMEOUT_MS=15000
```

| Variable | Description |
| --- | --- |
| `VITE_NETBOX_API_URL` | Absolute URL of the NetBox REST API, including `/api`. Required. |
| `VITE_NETBOX_REQUEST_TIMEOUT_MS` | Request timeout in milliseconds. Default: `15000` (15 seconds). |

### API address by environment

| Environment | Example URL |
| --- | --- |
| Browser on the NetBox computer | `http://localhost:8000/api` |
| Standard Android Studio emulator | `http://10.0.2.2:8000/api` |
| Physical phone on the same network | `http://192.168.1.20:8000/api` |
| Production web or Android app | `https://netbox.example.com/api` |

Replace the examples with your server's address. On Android, `localhost` refers to the Android device itself unless ADB port forwarding is configured. A network IP must be reachable through Wi-Fi or VPN, and the server must accept connections on the configured port.

HTTP is allowed for development and debug APKs. Production builds require HTTPS, and Android release builds block HTTP traffic.

### CORS and NetBox permissions

Configure the frontend origins actually used, without adding `/api`:

- Web development: `http://localhost:5173`, or the origin printed by Vite.
- Debug APK: `http://localhost`.
- Release APK: `https://localhost`.
- Published website: your website's HTTPS origin.

Permissions are checked by object type and the `view`, `add`, `change` and `delete` actions. Also grant read access to related objects needed by forms, such as sites, racks, device types and roles when creating a device. NetBox remains responsible for authorizing every API operation.

### Environment and sessions

- Restart Vite after changing environment files. On Android, rebuild and reinstall the APK.
- Mode-specific files, such as `.env.production.local`, can override `.env.local`; environment variables set in the terminal take precedence.
- `VITE_` variables are bundled into the frontend. Only configure public connection settings; enter usernames and passwords on the login screen.
- In a browser, the token stays in memory. On Android, the session is stored using Android Keystore. Signing out attempts to revoke the NetBox token and clears the local session.

## Development and origins

Developed by **[Luis Filippe Reis Nogueira](https://github.com/luisfilippe650)** as part of his internship activities at the **Divisão de Infraestrutura de Dados e Supercomputação (COIDS)** of **[INPE — Instituto Nacional de Pesquisas Espaciais](https://www.gov.br/inpe/pt-br)**, Brazil's National Institute for Space Research.

The project grew out of datacenter management needs, with the goal of making infrastructure information easier to view and update from a mobile phone. This community-oriented version makes the source code available for collaboration and further development.

## Credits and NetBox integration

Datacenter Manager uses the NetBox REST API as its backend integration. Credit goes to the **NetBox community and maintainers** for the infrastructure platform, APIs and documentation that make this integration possible.

- [NetBox website](https://netboxlabs.com/products/netbox/)
- [NetBox source code and community](https://github.com/netbox-community/netbox)
- [NetBox documentation](https://netboxlabs.com/docs/netbox/)
- [NetBox Labs](https://netboxlabs.com/)

NetBox is a separate project with its own license and maintainers. Datacenter Manager is not an official application of the NetBox project or NetBox Labs. Third-party libraries retain their respective licenses and credits.

## Contributing

Contributions, bug reports, documentation improvements and translations are welcome.

1. Open an [issue](https://github.com/luisfilippe650/netbox-mobile/issues) describing the problem or proposed improvement. For bugs, include reproduction steps and relevant browser, Android and NetBox versions.
2. Fork the [repository](https://github.com/luisfilippe650/netbox-mobile) and create a branch for your change.
3. Make focused changes, update both README translations when relevant, and run `npm run lint` and `npm test` from `app/`.
4. Submit a [pull request](https://github.com/luisfilippe650/netbox-mobile/pulls) explaining the change and how it was verified.

Do not include credentials, tokens or private infrastructure data in issues, screenshots or commits.

## License

A project license has not yet been added to this repository. The license for Datacenter Manager remains to be specified; it is separate from the license of NetBox and the other dependencies.
