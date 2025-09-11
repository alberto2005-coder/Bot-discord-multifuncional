# Discord Bot Project

## Overview

This is a Discord bot built with Discord.js v14 that provides various commands across multiple categories including moderation, fun, information, and utility features. The bot uses slash commands and is designed with a modular command structure for easy maintenance and expansion.

**Created by:** eldestructor7614 (<@1016814881112084533>)

## System Architecture

### Backend Architecture
- **Runtime**: Node.js
- **Main Framework**: Discord.js v14
- **Architecture Pattern**: Event-driven with command handlers
- **File Structure**: Modular command organization by category

### Key Components

1. **Main Application (`index.js`)**
   - Bot client initialization with required intents
   - Command collection management
   - Event handling for client ready and interaction events
   - Central hub for all bot functionality

2. **Command Deployment (`deploy-commands.js`)**
   - Automated slash command registration with Discord API
   - Collects commands from all modules and deploys globally
   - Uses Discord REST API for command management

3. **Command Modules** (organized by category):
   - **Moderation Commands** (`commands/moderation.js`): Server management features like kick/ban
   - **Fun Commands** (`commands/fun.js`): Entertainment features like jokes and facts
   - **Info Commands** (`commands/info.js`): Information retrieval for servers and users
   - **Utility Commands** (`commands/utility.js`): Basic bot utilities like ping and help
   - **Ticket System** (`commands/tickets.js`): Complete support ticket management system
   - **Role Management** (`commands/roles.js`): Advanced role assignment and management
   - **Channel Management** (`commands/channels.js`): Channel creation, editing, and deletion
   - **AntiRaid System** (`commands/antiraid.js`): Comprehensive protection against raids and spam
   - **Welcome System** (`commands/welcome.js`): Customizable welcome and goodbye messages
   - **Giveaway System** (`commands/giveaways.js`): Complete raffle and contest management
   - **Music System** (`commands/music.js`): Complete YouTube music player with queue management
   - **Owner Commands** (`commands/owner.js`): Exclusive bot management commands for the creator

### Command Structure
Each command follows a standardized structure:
- Uses SlashCommandBuilder for command definition
- Implements permission checks where necessary
- Returns rich embeds for better user experience
- Includes error handling and validation

## Data Flow

1. **Bot Initialization**:
   - Load environment variables
   - Initialize Discord client with required intents
   - Register all commands from modules
   - Connect to Discord gateway

2. **Command Processing**:
   - Receive interaction from Discord
   - Validate command existence and permissions
   - Execute command logic
   - Send response with embeds or plain text

3. **Command Deployment**:
   - Separate process to register commands with Discord
   - Collects all command definitions
   - Pushes to Discord API for global availability

## External Dependencies

### Core Dependencies
- **discord.js v14.21.0**: Main Discord API wrapper
- **dotenv v17.0.0**: Environment variable management

### Discord API Integration
- Uses Discord Gateway for real-time events
- REST API for command registration and management
- Requires bot token and client ID from Discord Developer Portal

### Required Environment Variables
- `DISCORD_TOKEN`: Bot authentication token
- `CLIENT_ID`: Discord application client ID

## Deployment Strategy

### Current Setup
- Simple Node.js application deployment
- Environment-based configuration
- Manual command deployment via separate script

### Bot Permissions Required
- Read Messages/View Channels
- Send Messages
- Use Slash Commands
- Kick Members (for moderation features)
- Ban Members (for moderation features)
- Manage Messages (implied for moderation)

### Deployment Process
1. Install dependencies: `npm install`
2. Configure environment variables
3. Deploy commands: `node deploy-commands.js`
4. Start bot: `node index.js`

## Key Architectural Decisions

### Modular Command Structure
**Problem**: Need organized, maintainable command system
**Solution**: Separate commands by category into different modules
**Rationale**: Easier maintenance, better code organization, scalable structure

### Slash Commands Over Prefix Commands
**Problem**: Discord moving away from message-based commands
**Solution**: Implement exclusively slash commands
**Benefits**: Better user experience, built-in Discord integration, automatic permission handling

### Rich Embed Responses
**Problem**: Plain text responses lack visual appeal
**Solution**: Use Discord embeds for most command responses
**Benefits**: Better user experience, consistent branding, structured information display

### Permission-Based Command Access
**Problem**: Need to restrict dangerous commands
**Solution**: Use Discord's built-in permission system
**Benefits**: Server-level control, automatic permission checking, secure by default

## Key Features

### Ticket System
- **Interactive Panel**: Create ticket panels with embedded buttons
- **Private Channels**: Automatic creation of private ticket channels
- **User Management**: Add/remove users from tickets
- **Auto-Close**: Tickets close automatically after confirmation
- **Duplicate Prevention**: Users can only have one ticket at a time
- **Rich Embeds**: Professional-looking ticket messages and responses

### Role Management System
- **Smart Role Assignment**: Add/remove roles with hierarchy validation
- **Permission Checking**: Prevents unauthorized role modifications
- **Role Listing**: Display server roles or specific user roles
- **Safety Features**: Cannot modify roles equal or higher than user's highest role

### AntiRaid Protection
- **Interactive Panel**: Configure protections with toggle buttons
- **Anti-Links**: Block messages containing URLs
- **Anti-Everyone**: Prevent @everyone and @here mentions
- **Anti-Invites**: Block Discord server invitations
- **Mention Limits**: Configurable maximum mentions per message
- **Auto-Moderation**: Automatic message deletion with warnings
- **Emergency Lockdown**: Temporary server-wide message blocking
- **Real-time Monitoring**: Automatic detection and response to violations

### Channel Management
- **Create Channels**: Text, voice, and category channels with custom settings
- **User Limits**: Set voice channel capacity limits
- **Channel Editing**: Modify names and settings of existing channels
- **Safe Deletion**: Delete channels with confirmation and logging

### Advanced Moderation System
- **Warning System**: Track user warnings with automatic escalation
- **Timeout/Mute**: Temporary user silencing with configurable durations
- **Enhanced Moderation**: Improved kick/ban commands with detailed logging
- **Warning Management**: View, clear, and track user warning histories
- **DM Notifications**: Automatic notifications to sanctioned users

### Fun & Games Collection
- **Interactive Games**: 8-ball, rock-paper-scissors, love calculator
- **Random Generators**: Dice, numbers, coin flip, memes
- **Entertainment**: Jokes, facts, and meme integration
- **Social Features**: User interaction games and compatibility tests

### Welcome & Goodbye System
- **Customizable Messages**: Personalized welcome and goodbye messages
- **Flexible Configuration**: Custom channels, colors, and message templates
- **Variable Support**: Dynamic user and server name insertion
- **Professional Embeds**: Rich, branded message displays
- **Testing Tools**: Preview and test message configurations

### Giveaway & Contest System
- **Interactive Giveaways**: Create contests with reaction-based participation
- **Flexible Duration**: Set custom time limits (1 minute to 7 days)
- **Multiple Winners**: Support for multiple winners per giveaway
- **Manual Control**: End giveaways early or reroll winners
- **Real-time Updates**: Live participant count updates
- **Join/Leave System**: Users can toggle participation with button clicks
- **Administrative Tools**: List active giveaways and manage ongoing contests

### Music System
- **YouTube Integration**: Play songs directly from YouTube with search capability
- **Queue Management**: Add songs to queue, view current playlist, shuffle songs
- **Playback Controls**: Play, pause, skip, stop with interactive button controls
- **Volume Control**: Adjustable volume levels (0-100%)
- **Loop Modes**: Loop single song, entire queue, or disable looping
- **Voice Channel Integration**: Automatic voice channel joining and management
- **Rich Embeds**: Professional music display with song info, thumbnails, and duration
- **Multi-Server Support**: Independent music queues per Discord server

### Owner Commands System
- **Status Control**: Change bot activity status (Playing, Listening, Watching, Streaming, etc.)
- **Avatar Management**: Update bot profile picture with image uploads
- **Username Control**: Change bot's display name
- **Advanced Bot Info**: Detailed statistics and information panel for owner
- **Server Management**: View complete list of servers where bot is active
- **Bot Restart**: Restart bot completely with automatic process recovery
- **Bot Shutdown**: Safely shutdown bot with confirmation requirement
- **Security**: Commands restricted exclusively to bot creator (eldestructor7614)
- **Status Clearing**: Remove current bot status when needed

### Bot Permissions Required
- Read Messages/View Channels
- Send Messages
- Use Slash Commands
- Kick Members (for moderation features)
- Ban Members (for moderation features)
- Manage Messages (implied for moderation)
- Manage Channels (for ticket system)
- Create Private Channels (for ticket system)
- Connect to Voice Channels (for music system)
- Speak in Voice Channels (for music system)
- Use Voice Activity (for music system)

## Changelog
- June 30, 2025: Initial setup with basic commands
- June 30, 2025: Added complete ticket system with interactive panels and buttons
- June 30, 2025: Added role management system with hierarchy validation
- June 30, 2025: Added comprehensive antiraid system with interactive panel
- June 30, 2025: Added channel management commands for creation/editing/deletion
- June 30, 2025: Added emergency lockdown system for raid protection
- June 30, 2025: Enhanced moderation with warning system, mute/unmute, and detailed tracking
- June 30, 2025: Expanded fun commands with games (8ball, RPS, memes, love calculator)
- June 30, 2025: Added comprehensive welcome/goodbye system with customization
- June 30, 2025: Integrated professional member join/leave event handling
- June 30, 2025: Added complete giveaway system with interactive participation
- June 30, 2025: Fixed warning system to be server-specific instead of global
- June 30, 2025: Implemented complete music system with YouTube integration, queue management, and voice controls
- June 30, 2025: Added exclusive owner commands for bot management (status, avatar, username control)
- June 30, 2025: Implemented bot restart and shutdown commands with owner-only access and confirmation systems

## User Preferences
Preferred communication style: Simple, everyday language.
Bot creator: eldestructor7614 (<@1016814881112084533>)