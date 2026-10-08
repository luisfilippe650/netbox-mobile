# Datacenter Manager

**English** | [Português (Brasil)](../index.md)

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


## Guides

- [About the project: author and motivation](about.md)
- [Installation and usage](installation.md)
- [NetBox configuration](configuration.md)
- [Development and contribution](development.md)
- [Documentation maintenance](documentation.md)
