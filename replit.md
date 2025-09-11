# Discord Bot Project

## Overview

This is a comprehensive Discord bot built with Discord.js v14 that provides a wide range of functionality across multiple categories. The bot features modular command organization, slash command integration, and various utility systems including music playback, ticket management, anti-raid protection, and giveaway systems.

**Created by:** eldestructor7614

## System Architecture

### Backend Architecture
- **Runtime**: Node.js
- **Main Framework**: Discord.js v14 with slash commands
- **Architecture Pattern**: Event-driven with modular command handlers
- **Data Storage**: In-memory storage for settings and state (ready for database integration)
- **Audio Processing**: @discordjs/voice for music functionality with YouTube integration

### Key Components

1. **Main Application (`index.js`)**
   - Discord client initialization with comprehensive intents (Guilds, Members, Messages, Voice)
   - Command collection management and registration
   - Event handling for interactions and member events
   - Centralized command routing

2. **Command Deployment (`deploy-commands.js`)**
   - Automated global slash command registration
   - REST API integration for command management
   - Modular command collection from all categories

3. **Command Modules** (organized by functionality):
   - **Moderation** (`commands/moderation.js`): User management (kick, ban, warn, timeout)
   - **Fun** (`commands/fun.js`): Entertainment features (jokes, facts, games, memes)
   - **Information** (`commands/info.js`): Server and user information retrieval
   - **Utility** (`commands/utility.js`): Basic bot utilities (ping, help, avatar)
   - **Tickets** (`commands/tickets.js`): Complete support ticket system with private channels
   - **Roles** (`commands/roles.js`): Advanced role management with hierarchy checks
   - **Channels** (`commands/channels.js`): Channel creation and management tools
   - **AntiRaid** (`commands/antiraid.js`): Comprehensive server protection system
   - **Welcome** (`commands/welcome.js`): Customizable welcome/goodbye message system
   - **Giveaways** (`commands/giveaways.js`): Complete giveaway management with timers
   - **Music** (`commands/music.js`): Full-featured YouTube music player with queue
   - **Owner** (`commands/owner.js`): Exclusive bot management commands

4. **Web Interface (`index.html`)**
   - Spanish-language landing page
   - Bot feature showcase and documentation
   - Responsive design with Discord-themed styling

## Data Flow

1. **Command Processing**:
   - User triggers slash command → Discord API → Bot receives interaction
   - Command validation and permission checks
   - Execute command logic and return response

2. **Music System**:
   - YouTube search/URL processing → Audio stream creation → Voice channel playback
   - Queue management with loop and volume controls

3. **Ticket System**:
   - Button interaction → Private channel creation → Role-based access control
   - Automatic cleanup and logging

4. **Anti-Raid Protection**:
   - Real-time message monitoring → Pattern detection → Automatic moderation actions

## External Dependencies

- **Discord.js v14**: Core Discord API wrapper
- **@discordjs/voice**: Voice channel audio processing
- **ytdl-core**: YouTube video/audio downloading
- **youtube-sr**: YouTube search functionality
- **ffmpeg-static**: Audio format conversion
- **dotenv**: Environment variable management

## Deployment Strategy

- **Environment Variables**: Discord token and client ID configuration
- **Modular Structure**: Easy feature addition/removal
- **Memory-based Storage**: Ready for database migration (PostgreSQL recommended)
- **Global Command Deployment**: Single-step command registration across all servers

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 05, 2025. Initial setup