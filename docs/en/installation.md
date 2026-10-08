# Installation and usage

**English** | [Português (Brasil)](../instalacao.md)

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

## Usage

### Browser

Clone the repository and enter the `app/` directory:

```bash
git clone https://github.com/luisfilippe650/netbox-mobile.git
cd netbox-mobile/app
npm ci
cp .env.example .env.local
```

Edit `.env.local` as described in [Configuration](configuration.md), then start the development server:

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
