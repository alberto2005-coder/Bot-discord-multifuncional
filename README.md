# Bot de Discord multifuncional

[Español](#español) · [English](#english)

---

## Español

### Índice

- [Descripción](#descripción)
- [Funcionalidades](#funcionalidades)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Despliegue de comandos](#despliegue-de-comandos)
- [Panel web](#panel-web)
- [Permisos del bot](#permisos-del-bot)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Registro de cambios](#registro-de-cambios)
- [Licencia](#licencia)

### Descripción

Bot de Discord construido con **Discord.js v14** que agrupa moderación, diversión, información, utilidades, tickets, economía, música y administración en un único bot con **comandos slash**. La estructura es modular: cada categoría vive en su propio archivo dentro de `commands/`, lo que facilita añadir o quitar funciones.

**Creado por:** eldestructor7614.

### Funcionalidades

**Sistema de economía y niveles**

- Base de datos **SQLite** con `better-sqlite3`.
- Comandos de economía: balance, trabajo, recompensa diaria, transferencias y tienda.
- XP por mensaje con enfriamiento para evitar spam, niveles y leaderboard.
- Mensaje de felicitación al subir de nivel.

**Tickets de soporte**

- Panel interactivo con botones.
- Creación automática de canales privados.
- Cierre con confirmación y un solo ticket abierto por usuario.
- Respuestas con embeds.

**Roles y canales**

- Asignación de roles con validación jerárquica: no se pueden tocar roles iguales o superiores al tuyo.
- Creación, edición y borrado de canales de texto, voz y categorías, con límite de usuarios en voz.

**AntiRaid**

- Panel para activar y desactivar protecciones.
- Bloqueo de enlaces, menciones `@everyone`/`@here` e invitaciones.
- Límite configurable de menciones por mensaje.
- Moderación automática con borrado y avisos, y bloqueo de emergencia del servidor.

**Moderación**

- Advertencias con escalada automática e historial.
- Silencios temporales con duración configurable.
- Expulsiones y baneos con registro y aviso por MD.

**Diversión**

- Bola 8, piedra-papel-tijera, calculadora del amor.
- Dados, números aleatorios, moneda y memes.

**Bienvenida y despedida**

- Mensajes, canales, colores y plantillas configurables, con variables dinámicas.

**Sorteos**

- Participación por reacción o botones, duración de 1 minuto a 7 días.
- Varios ganadores, actualización en vivo y control manual para finalizar o repetir.

**Música**

- Reproducción desde YouTube con DisTube: cola, pausa, salto, parada y volumen (0-100 %).
- Modos de repetición y colas independientes por servidor.

**Comandos del propietario**

- Cambiar estado, avatar y nombre del bot.
- Estadísticas, lista de servidores, reinicio y apagado con confirmación.
- Restringidos al creador.

### Arquitectura

**Componentes clave**

1. **`index.js`** — cliente de Discord con los *intents* necesarios, colección de comandos y manejo de eventos.
2. **`deploy-commands.js`** — recoge los comandos de todos los módulos y los registra en la API de Discord.
3. **`commands/*.js`** — un módulo por categoría: `moderation`, `fun`, `info`, `utility`, `tickets`, `roles`, `channels`, `antiraid`, `welcome`, `giveaways`, `music`, `owner`.
4. **`database.js`** — persistencia de la configuración de cada servidor en JSON.

**Flujo de una interacción**

1. Discord envía la interacción al bot por el Gateway.
2. Se valida el comando y los permisos.
3. Se ejecuta la lógica correspondiente.
4. Se responde con un embed o texto.

Cada comando se define con `SlashCommandBuilder`, comprueba permisos cuando hace falta y responde con embeds.

### Requisitos

- **Node.js 18 o superior**.
- Una aplicación de Discord con bot creada en <https://discord.com/developers/applications>.
- `DISCORD_TOKEN` y `CLIENT_ID` del portal de desarrolladores.

### Instalación

```bash
git clone https://github.com/alberto2005-coder/Bot-discord-multifuncional.git
cd Bot-discord-multifuncional
npm install
```

Crea un archivo `.env` en la raíz:

```env
DISCORD_TOKEN=tu_token_del_bot
CLIENT_ID=tu_client_id
```

> No subas nunca el `.env` al repositorio.

### Despliegue de comandos

Los comandos slash hay que registrarlos antes de usarlos:

```bash
node deploy-commands.js
node index.js
```

Tras cambiar cualquier comando, vuelve a ejecutar `deploy-commands.js`.

### Panel web

El bot incluye un **dashboard** en <http://localhost:3000/dashboard> con:

- Despliegue de paneles de tickets y creador de embeds.
- Visor de roles del servidor.
- Configuración de la XP por mensaje.
- Modo claro/oscuro y soporte bilingüe (ES/EN).

### Permisos del bot

- Leer mensajes y ver canales.
- Enviar mensajes y usar comandos slash.
- Expulsar y banear miembros.
- Gestionar mensajes y canales.
- Crear canales privados (tickets).
- Conectarse y hablar en canales de voz (música).

### Estructura del proyecto

```text
Bot-discord-multifuncional/
├── index.js                 # Cliente, eventos y carga de comandos
├── deploy-commands.js       # Registro de comandos slash
├── database.js              # Configuración por servidor (JSON)
├── dashboard.html           # Panel web de control
├── commands/
│   ├── moderation.js
│   ├── fun.js
│   ├── info.js
│   ├── utility.js
│   ├── tickets.js
│   ├── roles.js
│   ├── channels.js
│   ├── antiraid.js
│   ├── welcome.js
│   ├── giveaways.js
│   ├── music.js
│   └── owner.js
├── package.json
├── .env                     # No versionado
└── README.md
```

### Registro de cambios

| Fecha | Cambio |
|---|---|
| 30 jun 2025 | Versión inicial con comandos básicos |
| 30 jun 2025 | Sistema de tickets con paneles y botones |
| 30 jun 2025 | Roles con validación jerárquica |
| 30 jun 2025 | AntiRaid con panel interactivo y bloqueo de emergencia |
| 30 jun 2025 | Gestión de canales y moderación con advertencias y muteos |
| 30 jun 2025 | Ampliación de diversión, bienvenida y sorteos |
| 30 jun 2025 | Música con YouTube y comandos de propietario |
| 10 jul 2026 | Persistencia de configuración por servidor (`database.js`) |
| 10 jul 2026 | Dashboard web con modo claro/oscuro y bilingüe |
| 10 jul 2026 | Controles de música con DisTube |
| 10 ago 2026 | Economía y niveles con SQLite (`better-sqlite3`) |
| 10 ago 2026 | Herramientas remotas en el dashboard (tickets, embeds, roles, XP) |
| 10 ago 2026 | Licencia actualizada a términos propietarios con créditos obligatorios |

### Licencia

El proyecto usa **términos propietarios con requisito de créditos** desde el 10 de agosto de 2026. Consulta el archivo [LICENSE](LICENSE) y conserva la atribución a **eldestructor7614**.

---

## English

### Table of contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Requirements](#requirements)
- [Installation](#installation)
- [Deploying commands](#deploying-commands)
- [Web dashboard](#web-dashboard)
- [Bot permissions](#bot-permissions)
- [Project structure](#project-structure)
- [Changelog](#changelog)
- [License](#license)

### Overview

A Discord bot built with **Discord.js v14** that bundles moderation, fun, information, utilities, tickets, economy, music and administration into a single bot with **slash commands**. The structure is modular: each category lives in its own file under `commands/`, which makes adding or removing features easy.

**Created by:** eldestructor7614.

### Features

**Economy and levels**

- **SQLite** database via `better-sqlite3`.
- Economy commands: balance, work, daily reward, transfers and shop.
- Per-message XP with cooldown to prevent spam, levels and a leaderboard.
- Level-up congratulation messages.

**Support tickets**

- Interactive panel with buttons.
- Automatic private channel creation.
- Confirmation-based closing and one open ticket per user.
- Embed responses.

**Roles and channels**

- Role assignment with hierarchy validation: you cannot touch roles equal to or above your own.
- Create, edit and delete text, voice and category channels, with a user limit for voice.

**AntiRaid**

- Panel to enable and disable protections.
- Blocks links, `@everyone`/`@here` mentions and invites.
- Configurable mention limit per message.
- Automatic moderation with deletion and warnings, plus an emergency server lockdown.

**Moderation**

- Warnings with automatic escalation and history.
- Temporary mutes with configurable duration.
- Kicks and bans with logging and DM notifications.

**Fun**

- Magic 8-ball, rock-paper-scissors, love calculator.
- Dice, random numbers, coin flip and memes.

**Welcome and goodbye**

- Configurable messages, channels, colors and templates with dynamic variables.

**Giveaways**

- Entry by reaction or buttons, duration from 1 minute to 7 days.
- Multiple winners, live updates and manual controls to end or reroll.

**Music**

- YouTube playback via DisTube: queue, pause, skip, stop and volume (0-100 %).
- Repeat modes and per-server independent queues.

**Owner commands**

- Change the bot's status, avatar and username.
- Statistics, server list, restart and shutdown with confirmation.
- Restricted to the creator.

### Architecture

**Key components**

1. **`index.js`** — Discord client with the required *intents*, command collection and event handling.
2. **`deploy-commands.js`** — gathers commands from every module and registers them with the Discord API.
3. **`commands/*.js`** — one module per category: `moderation`, `fun`, `info`, `utility`, `tickets`, `roles`, `channels`, `antiraid`, `welcome`, `giveaways`, `music`, `owner`.
4. **`database.js`** — per-server configuration persisted as JSON.

**Interaction flow**

1. Discord sends the interaction to the bot over the Gateway.
2. The command and permissions are validated.
3. The matching logic runs.
4. The reply goes out as an embed or plain text.

Every command is defined with `SlashCommandBuilder`, checks permissions where needed and replies with embeds.

### Requirements

- **Node.js 18 or later**.
- A Discord application with a bot created at <https://discord.com/developers/applications>.
- `DISCORD_TOKEN` and `CLIENT_ID` from the developer portal.

### Installation

```bash
git clone https://github.com/alberto2005-coder/Bot-discord-multifuncional.git
cd Bot-discord-multifuncional
npm install
```

Create a `.env` file in the root:

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
```

> Never commit `.env` to the repository.

### Deploying commands

Slash commands must be registered before use:

```bash
node deploy-commands.js
node index.js
```

Re-run `deploy-commands.js` after changing any command.

### Web dashboard

The bot ships a **dashboard** at <http://localhost:3000/dashboard> with:

- Ticket panel deployment and a custom embed builder.
- Server role viewer.
- Per-message XP configuration.
- Light/dark mode and bilingual support (ES/EN).

### Bot permissions

- Read messages and view channels.
- Send messages and use slash commands.
- Kick and ban members.
- Manage messages and channels.
- Create private channels (tickets).
- Connect and speak in voice channels (music).

### Project structure

```text
Bot-discord-multifuncional/
├── index.js                 # Client, events and command loading
├── deploy-commands.js       # Slash command registration
├── database.js              # Per-server configuration (JSON)
├── dashboard.html           # Web control panel
├── commands/
│   ├── moderation.js
│   ├── fun.js
│   ├── info.js
│   ├── utility.js
│   ├── tickets.js
│   ├── roles.js
│   ├── channels.js
│   ├── antiraid.js
│   ├── welcome.js
│   ├── giveaways.js
│   ├── music.js
│   └── owner.js
├── package.json
├── .env                     # Not versioned
└── README.md
```

### Changelog

| Date | Change |
|---|---|
| Jun 30, 2025 | Initial release with basic commands |
| Jun 30, 2025 | Ticket system with panels and buttons |
| Jun 30, 2025 | Roles with hierarchy validation |
| Jun 30, 2025 | AntiRaid with interactive panel and emergency lockdown |
| Jun 30, 2025 | Channel management and moderation with warnings and mutes |
| Jun 30, 2025 | Expanded fun, welcome and giveaways |
| Jun 30, 2025 | YouTube music and owner commands |
| Jul 10, 2026 | Per-server config persistence (`database.js`) |
| Jul 10, 2026 | Web dashboard with light/dark and bilingual UI |
| Jul 10, 2026 | Music controls with DisTube |
| Aug 10, 2026 | Economy and levels with SQLite (`better-sqlite3`) |
| Aug 10, 2026 | Remote dashboard tools (tickets, embeds, roles, XP) |
| Aug 10, 2026 | License updated to proprietary terms with mandatory credits |

### License

The project uses **proprietary terms with a credits requirement** since August 10, 2026. See the [LICENSE](LICENSE) file and keep the attribution to **eldestructor7614**.
