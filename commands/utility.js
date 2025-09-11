const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const utilityCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Check the bot\'s ping and response time'),
        async execute(interaction) {
            const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            const apiLatency = Math.round(interaction.client.ws.ping);

            const pingEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🏓 Pong!')
                .addFields(
                    { name: '📡 Bot Latency', value: `${latency}ms`, inline: true },
                    { name: '💻 API Latency', value: `${apiLatency}ms`, inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ content: '', embeds: [pingEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('help')
            .setDescription('Get a list of all available commands'),
        async execute(interaction) {
            const helpEmbed = new EmbedBuilder()
                .setColor('#7289DA')
                .setTitle('🤖 Bot Commands Help')
                .setDescription('Here are all the available commands:\n\n**Creado por eldestructor7614** <@1016814881112084533>')
                .addFields(
                    {
                        name: '⚙️ Utility Commands',
                        value: '`/ping` - Check bot latency\n`/help` - Show this help message',
                        inline: false
                    },
                    {
                        name: '📊 Information Commands',
                        value: '`/serverinfo` - Get server information\n`/userinfo [user]` - Get user information',
                        inline: false
                    },
                    {
                        name: '🎉 Fun & Games',
                        value: '`/joke` - Random joke\n`/fact` - Fun fact\n`/roll [sides]` - Roll dice\n`/8ball <question>` - Magic 8-ball\n`/meme` - Random meme\n`/coinflip` - Flip a coin\n`/rps <choice>` - Rock Paper Scissors\n`/random-number [min] [max]` - Random number\n`/love-calculator <person1> [person2]` - Love compatibility\n`/tictactoe <opponent>` - Play tic-tac-toe',
                        inline: false
                    },
                    {
                        name: '🛡️ Moderation Commands',
                        value: '`/kick <user> [reason]` - Kick a member\n`/ban <user> [reason] [days]` - Ban a member\n`/warn <user> <reason>` - Warn a user\n`/warnings <user>` - View user warnings\n`/mute <user> <duration>` - Mute a user\n`/unmute <user>` - Unmute a user',
                        inline: false
                    },
                    {
                        name: '🎫 Ticket System',
                        value: '`/ticket-panel` - Create ticket panel (Admin only)\n`/close-ticket` - Close current ticket (Admin only)\n`/add-to-ticket <user>` - Add user to ticket (Admin only)\n`/remove-from-ticket <user>` - Remove user from ticket (Admin only)',
                        inline: false
                    },
                    {
                        name: '🎭 Role Management',
                        value: '`/add-role <user> <role>` - Add role to user (Admin only)\n`/remove-role <user> <role>` - Remove role from user (Admin only)\n`/list-roles [user]` - List server roles or user roles',
                        inline: false
                    },
                    {
                        name: '🛡️ AntiRaid System',
                        value: '`/antiraid-panel` - Configure antiraid settings (Admin only)\n`/set-mention-limit <number>` - Set max mentions per message (Admin only)\n`/lockdown <duration>` - Emergency server lockdown (Admin only)\n`/unlock` - Remove server lockdown (Admin only)',
                        inline: false
                    },
                    {
                        name: '📝 Channel Management',
                        value: '`/create-channel <name> <type>` - Create new channel (Admin only)\n`/edit-channel <channel>` - Edit channel settings (Admin only)\n`/delete-channel <channel>` - Delete channel (Admin only)',
                        inline: false
                    },
                    {
                        name: '🎊 Welcome System',
                        value: '`/setup-welcome <channel>` - Configure welcome messages\n`/setup-goodbye <channel>` - Configure goodbye messages\n`/welcome-status` - View current configuration\n`/test-welcome` - Test welcome message\n`/disable-welcome` - Disable welcomes\n`/disable-goodbye` - Disable goodbyes',
                        inline: false
                    },
                    {
                        name: '🎉 Giveaway System',
                        value: '`/giveaway <prize> <duration>` - Create a giveaway\n`/end-giveaway <message-id>` - End giveaway immediately\n`/reroll-giveaway <message-id>` - Pick new winners\n`/giveaway-list` - View active giveaways',
                        inline: false
                    },
                    {
                        name: '⚡ Owner Commands',
                        value: 'Comandos especiales disponibles solo para el creador del bot.',
                        inline: false
                    }
                )
                .setTimestamp()
                .setFooter({ text: 'Creado por eldestructor7614 | Use slash commands (/) to interact with the bot!' });

            await interaction.reply({ embeds: [helpEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('info')
            .setDescription('Get information about the bot'),
        async execute(interaction) {
            const client = interaction.client;
            const uptime = Math.floor(client.uptime / 1000);
            const uptimeString = `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`;

            const infoEmbed = new EmbedBuilder()
                .setColor('#7289DA')
                .setTitle('🤖 Bot Information')
                .setDescription('Bot de Discord completo con sistemas avanzados de moderación, diversión y gestión de comunidad.')
                .setThumbnail(client.user.displayAvatarURL())
                .addFields(
                    { name: '🏷️ Bot Name', value: client.user.tag, inline: true },
                    { name: '🆔 Bot ID', value: client.user.id, inline: true },
                    { name: '👨‍💻 Creador', value: '<@1016814881112084533>', inline: true },
                    { name: '⏰ Uptime', value: uptimeString, inline: true },
                    { name: '🏠 Servers', value: `${client.guilds.cache.size}`, inline: true },
                    { name: '👥 Users', value: `${client.users.cache.size}`, inline: true },
                    { name: '📝 Commands', value: `${client.commands.size}`, inline: true },
                    { name: '💾 Memory Usage', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true },
                    { name: '🔧 Discord.js Version', value: require('discord.js').version, inline: true },
                    { name: '🟢 Node.js Version', value: process.version, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Creado por eldestructor7614' });

            await interaction.reply({ embeds: [infoEmbed] });
        },
    },
];

module.exports = utilityCommands;
