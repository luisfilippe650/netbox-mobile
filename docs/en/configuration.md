# Configuration

**English** | [Português (Brasil)](../configuracao.md)

[`app/.env.example`](https://github.com/luisfilippe650/netbox-mobile/blob/main/app/.env.example) contains a detailed guide. Create a local copy at `app/.env.local`:

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
