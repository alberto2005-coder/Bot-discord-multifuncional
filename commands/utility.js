const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

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
    {
        data: new SlashCommandBuilder()
            .setName('embed')
            .setDescription('Crea un mensaje embed personalizado utilizando un formulario interactivo')
            .addChannelOption(option => 
                option.setName('canal')
                    .setDescription('El canal donde se enviará el embed')
                    .setRequired(false)
            ),
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({ content: '❌ No tienes permisos para usar este comando.', ephemeral: true });
            }

            const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
            
            const modal = new ModalBuilder()
                .setTitle('Constructor de Embeds');

            const titleInput = new TextInputBuilder()
                .setCustomId('embed_title')
                .setLabel('Título del Embed')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Escribe el título aquí...')
                .setRequired(true);

            const descInput = new TextInputBuilder()
                .setCustomId('embed_desc')
                .setLabel('Descripción / Contenido')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Escribe el cuerpo del mensaje embed...')
                .setRequired(true);

            const colorInput = new TextInputBuilder()
                .setCustomId('embed_color')
                .setLabel('Color en Hexadecimal')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('#5865F2')
                .setValue('#5865F2')
                .setRequired(false);

            const thumbInput = new TextInputBuilder()
                .setCustomId('embed_thumb')
                .setLabel('URL de la Miniatura (Opcional)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('https://ejemplo.com/imagen.png')
                .setRequired(false);

            const targetChannel = interaction.options.getChannel('canal') || interaction.channel;
            modal.setCustomId(`embed_builder_modal_${targetChannel.id}`);

            modal.addComponents(
                new ActionRowBuilder().addComponents(titleInput),
                new ActionRowBuilder().addComponents(descInput),
                new ActionRowBuilder().addComponents(colorInput),
                new ActionRowBuilder().addComponents(thumbInput)
            );

            await interaction.showModal(modal);
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('serverstats')
            .setDescription('Muestra estadísticas avanzadas y detalladas del servidor actual'),
        async execute(interaction) {
            const { guild } = interaction;
            const client = interaction.client;
            
            const totalMembers = guild.memberCount;
            const botCount = guild.members.cache.filter(m => m.user.bot).size;
            const humanCount = totalMembers - botCount;
            
            const channels = guild.channels.cache;
            const textChannels = channels.filter(c => c.type === 0).size;
            const voiceChannels = channels.filter(c => c.type === 2).size;
            const categories = channels.filter(c => c.type === 4).size;
            
            const roleCount = guild.roles.cache.size;
            const boosterCount = guild.premiumSubscriptionCount || 0;
            const boostLevel = guild.premiumTier;
            
            const statsEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`📊 Estadísticas de ${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }) || client.user.displayAvatarURL())
                .addFields(
                    { name: '👥 Miembros', value: `Total: **${totalMembers}**\n👤 Humanos: **${humanCount}**\n🤖 Bots: **${botCount}**`, inline: true },
                    { name: '💬 Canales', value: `Total: **${channels.size}**\n📝 Texto: **${textChannels}**\n🔊 Voz: **${voiceChannels}**\n📁 Categorías: **${categories}**`, inline: true },
                    { name: '🛡️ Seguridad', value: `Nivel de Verif: **${guild.verificationLevel}**\nRoles: **${roleCount}**\nBoosters: **${boosterCount}** (Nivel ${boostLevel})`, inline: true }
                )
                .setFooter({ text: `ID del Servidor: ${guild.id}` })
                .setTimestamp();
                
            await interaction.reply({ embeds: [statsEmbed] });
        }
    }
];

module.exports = utilityCommands;
