const { REST, Routes } = require('discord.js');
require('dotenv').config();

// Import command files
const moderationCommands = require('./commands/moderation');
const funCommands = require('./commands/fun');
const infoCommands = require('./commands/info');
const utilityCommands = require('./commands/utility');
const ticketCommands = require('./commands/tickets');
const roleCommands = require('./commands/roles');
const channelCommands = require('./commands/channels');
const { commands: antiRaidCommands } = require('./commands/antiraid');
const { commands: welcomeCommands } = require('./commands/welcome');
const { commands: giveawayCommands } = require('./commands/giveaways');
const ownerCommands = require('./commands/owner');

// Collect all commands
const commands = [
    ...moderationCommands,
    ...funCommands,
    ...infoCommands,
    ...utilityCommands,
    ...ticketCommands,
    ...roleCommands,
    ...channelCommands,
    ...antiRaidCommands,
    ...welcomeCommands,
    ...giveawayCommands,
    ...ownerCommands
].map(command => command.data.toJSON());

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
})();
