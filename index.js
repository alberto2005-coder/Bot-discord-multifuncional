const { Client, GatewayIntentBits, Collection, Events, EmbedBuilder, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
require('dotenv').config();
const { DisTube } = require('distube');
const { initDatabase, getLevel, updateLevel, getGeneralSettings } = require('./database');

// Inicializar la Base de Datos
initDatabase();

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

// Initialize DisTube
client.distube = new DisTube(client, {
    emitNewSongOnly: true
});

// Basic DisTube events
client.distube.on('playSong', (queue, song) => {
    try {
        queue.textChannel.send(`🎶 Reproduciendo ahora: **${song.name}** - \`${song.formattedDuration}\`\nPedido por: ${song.user}`);
    } catch (err) {
        console.error(err);
    }
});

client.distube.on('addSong', (queue, song) => {
    try {
        queue.textChannel.send(`✅ Añadido a la cola: **${song.name}** - \`${song.formattedDuration}\` por ${song.user}`);
    } catch (err) {
        console.error(err);
    }
});

client.distube.on('error', (channel, error) => {
    console.error('DisTube Error:', error);
    try {
        if (channel) channel.send('❌ Ocurrió un error con el reproductor de música.');
    } catch (err) {
        console.error(err);
    }
});

// Create a collection to store commands
client.commands = new Collection();

// Import command files
const moderationCommands = require('./commands/moderation');
const funCommands = require('./commands/fun');
const infoCommands = require('./commands/info');
const utilityCommands = require('./commands/utility');
const ticketCommands = require('./commands/tickets');
const roleCommands = require('./commands/roles');
const channelCommands = require('./commands/channels');
const { commands: antiRaidCommands, getAntiRaidSettings, updateAntiRaidSettings } = require('./commands/antiraid');
const { commands: welcomeCommands, getWelcomeSettings } = require('./commands/welcome');
const { commands: giveawayCommands, handleGiveawayJoin } = require('./commands/giveaways');
const ownerCommands = require('./commands/owner');
const musicCommands = require('./commands/music');
const economyCommands = require('./commands/economy');
const levelCommands = require('./commands/levels');

// Add commands to the collection
const allCommands = [
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
    ...ownerCommands,
    ...musicCommands,
    ...economyCommands,
    ...levelCommands
];

allCommands.forEach(command => {
    client.commands.set(command.data.name, command);
});

// Hacer el cliente accesible globalmente para el sistema de sorteos
global.client = client;

// When the client is ready, run this code
client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Handle slash command interactions
client.on(Events.InteractionCreate, async interaction => {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}:`, error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('There was an error while executing this command!')
                .setTimestamp();

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
            }
        }
    }
    
    // Handle button interactions
    else if (interaction.isButton()) {
        try {
            if (interaction.customId === 'create_ticket') {
                await handleCreateTicket(interaction);
            } else if (interaction.customId === 'confirm_close_ticket') {
                await handleCloseTicket(interaction);
            } else if (interaction.customId === 'cancel_close_ticket') {
                await handleCancelClose(interaction);
            } else if (interaction.customId.startsWith('toggle_')) {
                await handleAntiRaidToggle(interaction);
            } else if (interaction.customId === 'reset_antiraid') {
                await handleAntiRaidReset(interaction);
            } else if (interaction.customId.startsWith('giveaway_join_')) {
                await handleGiveawayJoin(interaction);
            } else if (interaction.customId.startsWith('music_')) {
                await handleMusicButton(interaction);
            } else if (interaction.customId.startsWith('ttt_')) {
                await handleTicTacToeMove(interaction);
            }
        } catch (error) {
            console.error('Error handling button interaction:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('Hubo un error procesando tu solicitud. Inténtalo de nuevo.')
                .setTimestamp();

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
            }
        }
    }
    
    // Handle modal submissions
    else if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('embed_builder_modal_')) {
            const channelId = interaction.customId.split('_').pop();
            const title = interaction.fields.getTextInputValue('embed_title');
            const description = interaction.fields.getTextInputValue('embed_desc');
            const color = interaction.fields.getTextInputValue('embed_color') || '#5865F2';
            const thumbnail = interaction.fields.getTextInputValue('embed_thumb');

            const channel = interaction.guild.channels.cache.get(channelId);
            if (!channel) {
                return interaction.reply({ content: '❌ El canal especificado no existe o no es accesible.', flags: [MessageFlags.Ephemeral] });
            }

            const customEmbed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setTimestamp();

            if (thumbnail && thumbnail.startsWith('http')) {
                customEmbed.setThumbnail(thumbnail);
            }

            try {
                await channel.send({ embeds: [customEmbed] });
                await interaction.reply({ content: `✅ ¡Embed enviado con éxito al canal <#${channelId}>!`, flags: [MessageFlags.Ephemeral] });
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: '❌ Hubo un error al intentar enviar el embed. Verifica que el color sea hexadecimal válido.', flags: [MessageFlags.Ephemeral] });
            }
        }
    }
});

// Handle new member joins
client.on(Events.GuildMemberAdd, member => {
    const settings = getWelcomeSettings(member.guild.id);
    
    if (!settings.welcomeEnabled) return;
    
    const channel = member.guild.channels.cache.get(settings.welcomeChannel);
    if (!channel) return;
    
    const message = settings.welcomeMessage
        .replace('{user}', member.user.toString())
        .replace('{server}', member.guild.name);
    
    const welcomeEmbed = new EmbedBuilder()
        .setColor(settings.welcomeColor || '#00FF00')
        .setTitle('🎉 ¡Nuevo Miembro!')
        .setDescription(message)
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
            { name: '👥 Miembro #', value: `${member.guild.memberCount}`, inline: true },
            { name: '📅 Cuenta Creada', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: '⏰ Se Unió', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `ID: ${member.user.id}` });

    channel.send({ embeds: [welcomeEmbed] });
});

// Handle member leaves
client.on(Events.GuildMemberRemove, member => {
    const settings = getWelcomeSettings(member.guild.id);
    
    if (!settings.goodbyeEnabled) return;
    
    const channel = member.guild.channels.cache.get(settings.goodbyeChannel);
    if (!channel) return;
    
    const message = settings.goodbyeMessage
        .replace('{user}', `**${member.user.tag}**`)
        .replace('{server}', member.guild.name);
    
    const goodbyeEmbed = new EmbedBuilder()
        .setColor(settings.goodbyeColor || '#FF6B6B')
        .setTitle('👋 Miembro Se Fue')
        .setDescription(message)
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
            { name: '👥 Miembros Restantes', value: `${member.guild.memberCount}`, inline: true },
            { name: '📅 Estuvo Aquí', value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : 'Desconocido', inline: true }
        )
        .setTimestamp()
        .setFooter({ text: `ID: ${member.user.id}` });

    channel.send({ embeds: [goodbyeEmbed] });
});

// Ticket system functions
async function handleCreateTicket(interaction) {
    const user = interaction.user;
    const guild = interaction.guild;
    
    // Check if user already has a ticket
    const existingTicket = guild.channels.cache.find(channel => 
        channel.name === `ticket-${user.username.toLowerCase()}` && 
        channel.type === ChannelType.GuildText
    );
    
    if (existingTicket) {
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff9900')
            .setTitle('⚠️ Ticket Existente')
            .setDescription(`Ya tienes un ticket abierto: ${existingTicket}\n\nPor favor, utiliza tu ticket existente o ciérralo antes de crear uno nuevo.`);
        
        return interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
    }
    
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
    
    try {
        // Create ticket channel
        const ticketChannel = await guild.channels.create({
            name: `ticket-${user.username.toLowerCase()}`,
            type: ChannelType.GuildText,
            parent: null, // You can set a category ID here if you want
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ],
                },
                {
                    id: client.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ],
                }
            ],
        });
        
        // Welcome message in ticket
        const welcomeEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎫 Ticket Creado')
            .setDescription(`¡Hola ${user}! Tu ticket ha sido creado exitosamente.\n\n` +
                '**¿Qué hacer ahora?**\n' +
                '• Describe tu problema o pregunta con detalle\n' +
                '• Sé específico sobre lo que necesitas\n' +
                '• El staff será notificado y te ayudará pronto\n\n' +
                '**Información del ticket:**\n' +
                `• Creado por: ${user.tag}\n` +
                `• Fecha: <t:${Math.floor(Date.now() / 1000)}:F>\n` +
                `• ID del ticket: ${ticketChannel.id}`)
            .setFooter({ text: 'Usa el botón de abajo para cerrar el ticket cuando esté resuelto' })
            .setTimestamp();
        
        const closeButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_close_ticket')
                    .setLabel('🗑️ Cerrar Ticket')
                    .setStyle(ButtonStyle.Danger)
            );
        
        await ticketChannel.send({ 
            content: `${user} - ¡Tu ticket ha sido creado!`,
            embeds: [welcomeEmbed], 
            components: [closeButton] 
        });
        
        // Success message to user
        const successEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Ticket Creado')
            .setDescription(`Tu ticket ha sido creado exitosamente: ${ticketChannel}\n\nPuedes escribir tu mensaje allí y el staff te ayudará.`);
        
        await interaction.editReply({ embeds: [successEmbed] });
        
    } catch (error) {
        console.error('Error creating ticket:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Error')
            .setDescription('No se pudo crear el ticket. Por favor, inténtalo de nuevo o contacta con un administrador.');
        
        await interaction.editReply({ embeds: [errorEmbed] });
    }
}

async function handleCloseTicket(interaction) {
    const channel = interaction.channel;
    
    if (!channel.name.startsWith('ticket-')) {
        return interaction.reply({ 
            content: '❌ Este comando solo se puede usar en canales de tickets.', 
            flags: [MessageFlags.Ephemeral] 
        });
    }
    
    await interaction.deferReply();
    
    const closingEmbed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('🗑️ Cerrando Ticket')
        .setDescription('El ticket se cerrará en 5 segundos...\n\n' +
            `**Cerrado por:** ${interaction.user.tag}\n` +
            `**Fecha:** <t:${Math.floor(Date.now() / 1000)}:F>`)
        .setFooter({ text: 'Gracias por usar nuestro sistema de tickets' })
        .setTimestamp();
    
    await interaction.editReply({ embeds: [closingEmbed] });
    
    setTimeout(async () => {
        try {
            await channel.delete();
        } catch (error) {
            console.error('Error deleting ticket channel:', error);
        }
    }, 5000);
}

async function handleCancelClose(interaction) {
    const cancelEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Cierre Cancelado')
        .setDescription('El cierre del ticket ha sido cancelado. Puedes continuar usando este canal.');
    
    await interaction.update({ embeds: [cancelEmbed], components: [] });
}

// AntiRaid system functions
async function handleAntiRaidToggle(interaction) {
    const guildId = interaction.guild.id;
    const settings = getAntiRaidSettings(guildId);
    
    const feature = interaction.customId.replace('toggle_', '');
    
    switch(feature) {
        case 'antilinks':
            settings.antiLinks = !settings.antiLinks;
            break;
        case 'antieveryone':
            settings.antiEveryone = !settings.antiEveryone;
            break;
        case 'antispam':
            settings.antiSpam = !settings.antiSpam;
            break;
        case 'antiinvites':
            settings.antiInvites = !settings.antiInvites;
            break;
        case 'automod':
            settings.autoMod = !settings.autoMod;
            break;
    }
    
    updateAntiRaidSettings(guildId, settings);
    
    const statusEmoji = (enabled) => enabled ? '✅' : '❌';
    const featureNames = {
        antilinks: 'Anti-Links',
        antieveryone: 'Anti-Everyone',
        antispam: 'Anti-Spam',
        antiinvites: 'Anti-Invites',
        automod: 'Auto-Moderación'
    };
    
    const updatedEmbed = new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle('🛡️ Panel de Configuración AntiRaid')
        .setDescription('Configura las protecciones de tu servidor contra raids y spam.\n\n' +
            '**Estado Actual de Protecciones:**')
        .addFields(
            { name: '🔗 Anti-Links', value: `${statusEmoji(settings.antiLinks)} ${settings.antiLinks ? 'Activado' : 'Desactivado'}`, inline: true },
            { name: '📢 Anti-Everyone', value: `${statusEmoji(settings.antiEveryone)} ${settings.antiEveryone ? 'Activado' : 'Desactivado'}`, inline: true },
            { name: '💬 Anti-Spam', value: `${statusEmoji(settings.antiSpam)} ${settings.antiSpam ? 'Activado' : 'Desactivado'}`, inline: true },
            { name: '👥 Anti-Invites', value: `${statusEmoji(settings.antiInvites)} ${settings.antiInvites ? 'Activado' : 'Desactivado'}`, inline: true },
            { name: '🤖 Auto-Moderación', value: `${statusEmoji(settings.autoMod)} ${settings.autoMod ? 'Activado' : 'Desactivado'}`, inline: true },
            { name: '🏷️ Máx. Menciones', value: `${settings.maxMentions} por mensaje`, inline: true }
        )
        .setFooter({ text: `${featureNames[feature]} ${settings[feature] ? 'activado' : 'desactivado'} por ${interaction.user.tag}` })
        .setTimestamp();

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('toggle_antilinks')
                .setLabel('🔗 Anti-Links')
                .setStyle(settings.antiLinks ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('toggle_antieveryone')
                .setLabel('📢 Anti-Everyone')
                .setStyle(settings.antiEveryone ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('toggle_antispam')
                .setLabel('💬 Anti-Spam')
                .setStyle(settings.antiSpam ? ButtonStyle.Success : ButtonStyle.Secondary)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('toggle_antiinvites')
                .setLabel('👥 Anti-Invites')
                .setStyle(settings.antiInvites ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('toggle_automod')
                .setLabel('🤖 Auto-Mod')
                .setStyle(settings.autoMod ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('reset_antiraid')
                .setLabel('🔄 Resetear Todo')
                .setStyle(ButtonStyle.Danger)
        );

    await interaction.update({ embeds: [updatedEmbed], components: [row1, row2] });
}

async function handleAntiRaidReset(interaction) {
    const guildId = interaction.guild.id;
    const defaultSettings = {
        antiLinks: false,
        antiEveryone: false,
        antiSpam: false,
        maxMentions: 3,
        antiInvites: false,
        autoMod: false
    };
    
    updateAntiRaidSettings(guildId, defaultSettings);
    
    const resetEmbed = new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle('🛡️ Panel de Configuración AntiRaid')
        .setDescription('Configura las protecciones de tu servidor contra raids y spam.\n\n' +
            '**Estado Actual de Protecciones:**')
        .addFields(
            { name: '🔗 Anti-Links', value: '❌ Desactivado', inline: true },
            { name: '📢 Anti-Everyone', value: '❌ Desactivado', inline: true },
            { name: '💬 Anti-Spam', value: '❌ Desactivado', inline: true },
            { name: '👥 Anti-Invites', value: '❌ Desactivado', inline: true },
            { name: '🤖 Auto-Moderación', value: '❌ Desactivado', inline: true },
            { name: '🏷️ Máx. Menciones', value: '3 por mensaje', inline: true }
        )
        .setFooter({ text: `Configuraciones reseteadas por ${interaction.user.tag}` })
        .setTimestamp();

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('toggle_antilinks')
                .setLabel('🔗 Anti-Links')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('toggle_antieveryone')
                .setLabel('📢 Anti-Everyone')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('toggle_antispam')
                .setLabel('💬 Anti-Spam')
                .setStyle(ButtonStyle.Secondary)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('toggle_antiinvites')
                .setLabel('👥 Anti-Invites')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('toggle_automod')
                .setLabel('🤖 Auto-Mod')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('reset_antiraid')
                .setLabel('🔄 Resetear Todo')
                .setStyle(ButtonStyle.Danger)
        );

    await interaction.update({ embeds: [resetEmbed], components: [row1, row2] });
}

// AutoMod message checking
client.on(Events.MessageCreate, async message => {
    if (message.author.bot || !message.guild) return;
    
    const settings = getAntiRaidSettings(message.guild.id);
    const member = message.member;
    
    // Skip if user has admin permissions
    if (member && member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
    
    // --- LÓGICA DE NIVELES (XP) ---
    const now = Date.now();
    const levelData = getLevel(message.author.id, message.guild.id);
    const xpCooldown = 60000; // 1 minuto (en ms) para ganar XP y evitar spam
    
    if (now - levelData.lastMessage > xpCooldown) {
        const generalSettings = getGeneralSettings(message.guild.id);
        const xpMin = generalSettings.xpMin !== undefined ? generalSettings.xpMin : 15;
        const xpMax = generalSettings.xpMax !== undefined ? generalSettings.xpMax : 25;
        
        const xpEarned = Math.floor(Math.random() * (xpMax - xpMin + 1)) + xpMin;
        levelData.xp += xpEarned;
        levelData.lastMessage = now;
        
        const xpNeeded = (levelData.level + 1) * 100;
        
        if (levelData.xp >= xpNeeded) {
            levelData.level += 1;
            levelData.xp = levelData.xp - xpNeeded; // Guarda el remanente
            
            if (generalSettings.levelUpMessage !== false) {
                const levelUpEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('🎉 ¡Subida de Nivel!')
                    .setDescription(`¡Felicidades ${message.author}! Has subido al nivel **${levelData.level}** 🚀.`)
                    .setThumbnail(message.author.displayAvatarURL());
                    
                message.channel.send({ embeds: [levelUpEmbed] }).catch(() => {});
            }
        }
        
        updateLevel(message.author.id, message.guild.id, levelData.xp, levelData.level, levelData.lastMessage);
    }
    
    // --- LÓGICA DE ANTIRAID ---
    let shouldDelete = false;
    let reason = '';
    
    // Anti-Links
    if (settings.antiLinks) {
        const linkRegex = /(https?:\/\/[^\s]+)/g;
        if (linkRegex.test(message.content)) {
            shouldDelete = true;
            reason = 'Enlaces no permitidos';
        }
    }
    
    // Anti-Everyone
    if (settings.antiEveryone) {
        if (message.content.includes('@everyone') || message.content.includes('@here')) {
            shouldDelete = true;
            reason = 'Menciones masivas no permitidas';
        }
    }
    
    // Anti-Invites
    if (settings.antiInvites) {
        const inviteRegex = /discord\.gg\/[a-zA-Z0-9]+|discordapp\.com\/invite\/[a-zA-Z0-9]+/g;
        if (inviteRegex.test(message.content)) {
            shouldDelete = true;
            reason = 'Invitaciones de Discord no permitidas';
        }
    }
    
    // Max mentions check
    const mentions = message.mentions.users.size;
    if (mentions > settings.maxMentions) {
        shouldDelete = true;
        reason = `Demasiadas menciones (${mentions}/${settings.maxMentions})`;
    }
    
    // Delete message and warn user if needed
    if (shouldDelete && settings.autoMod) {
        try {
            await message.delete();
            
            const warningEmbed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle('⚠️ Mensaje Eliminado')
                .setDescription(`${message.author}, tu mensaje fue eliminado automáticamente.`)
                .addFields(
                    { name: '📋 Razón', value: reason, inline: true },
                    { name: '👤 Usuario', value: message.author.tag, inline: true }
                )
                .setTimestamp();
            
            const warningMsg = await message.channel.send({ embeds: [warningEmbed] });
            
            // Delete warning after 5 seconds
            setTimeout(() => {
                warningMsg.delete().catch(() => {});
            }, 5000);
            
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    }
});

// Music button handler
async function handleMusicButton(interaction) {
    const member = interaction.member;
    const voiceChannel = member.voice.channel;
    
    if (!voiceChannel) {
        return await interaction.reply({
            content: '❌ Debes estar en un canal de voz para usar los controles de música.',
            flags: [MessageFlags.Ephemeral]
        });
    }
    
    let responseEmbed;
    
    try {
        switch (interaction.customId) {
            case 'music_pause': {
                const queuePause = client.distube.getQueue(interaction.guild.id);
                if (!queuePause) {
                    responseEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('No hay canciones en la cola.');
                    break;
                }
                if (queuePause.paused) {
                    queuePause.resume();
                    responseEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('▶️ Música Reanudada')
                        .setDescription('La música ha sido reanudada exitosamente.')
                        .setTimestamp();
                } else {
                    queuePause.pause();
                    responseEmbed = new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('⏸️ Música Pausada')
                        .setDescription('La música ha sido pausada.')
                        .setTimestamp();
                }
                break;
            }
                
            case 'music_skip': {
                const queueSkip = client.distube.getQueue(interaction.guild.id);
                if (!queueSkip) {
                    responseEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('No hay canciones en la cola.');
                    break;
                }
                try {
                    await queueSkip.skip();
                    responseEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('⏭️ Canción Saltada')
                        .setDescription('Reproduciendo la siguiente canción...')
                        .setTimestamp();
                } catch (e) {
                    await queueSkip.stop();
                    responseEmbed = new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('⏭️ Cola vacía')
                        .setDescription('No hay más canciones en la cola. Bot desconectado.')
                        .setTimestamp();
                }
                break;
            }
                
            case 'music_stop': {
                const queueStop = client.distube.getQueue(interaction.guild.id);
                if (!queueStop) {
                    responseEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('No hay canciones en la cola.');
                    break;
                }
                await queueStop.stop();
                responseEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('⏹️ Música Detenida')
                    .setDescription('La música se ha detenido y el bot se ha desconectado.')
                    .setTimestamp();
                break;
            }
                
            case 'music_loop': {
                const queueLoop = client.distube.getQueue(interaction.guild.id);
                if (!queueLoop) {
                    responseEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('No hay canciones en la cola.');
                    break;
                }
                const newMode = queueLoop.setRepeatMode(queueLoop.repeatMode === 0 ? 1 : 0);
                responseEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🔁 Modo de Repetición')
                    .setDescription(newMode === 1 ? 'Repetición activada para la canción actual.' : 'Repetición desactivada.')
                    .setTimestamp();
                break;
            }
                
            case 'music_queue': {
                const queueShow = client.distube.getQueue(interaction.guild.id);
                if (!queueShow) {
                    responseEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('No hay canciones en la cola.');
                    break;
                }
                const qList = queueShow.songs
                    .map((song, i) => `${i === 0 ? '▶️' : `${i}.`} ${song.name} - \`${song.formattedDuration}\``)
                    .slice(0, 5)
                    .join('\n');
                responseEmbed = new EmbedBuilder()
                    .setColor('#0099FF')
                    .setTitle('📋 Cola de Música (Primeras 5)')
                    .setDescription(qList || 'No hay canciones en la cola.')
                    .setFooter({ text: `Total de canciones: ${queueShow.songs.length}` })
                    .setTimestamp();
                break;
            }
                
            default:
                responseEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Botón no reconocido.')
                    .setTimestamp();
        }
        
        await interaction.reply({ embeds: [responseEmbed], flags: [MessageFlags.Ephemeral] });
        
    } catch (error) {
        console.error('Error en handleMusicButton:', error);
        await interaction.reply({
            content: '❌ Error al procesar el control de música.',
            flags: [MessageFlags.Ephemeral]
        });
    }
}

// Tic-Tac-Toe button handler
async function handleTicTacToeMove(interaction) {
    const [, gameId, position] = interaction.customId.split('_');
    const ticTacToeGames = new Map(); // This should be imported from fun.js, but for simplicity we'll recreate
    
    const game = ticTacToeGames.get(gameId);
    if (!game) {
        return await interaction.reply({
            content: '❌ Esta partida ya no existe.',
            flags: [MessageFlags.Ephemeral]
        });
    }
    
    if (interaction.user.id !== game.currentPlayer) {
        return await interaction.reply({
            content: '❌ No es tu turno.',
            flags: [MessageFlags.Ephemeral]
        });
    }
    
    const pos = parseInt(position);
    if (game.board[pos] !== '⬜') {
        return await interaction.reply({
            content: '❌ Esa posición ya está ocupada.',
            flags: [MessageFlags.Ephemeral]
        });
    }
    
    // Make move
    const symbol = game.currentPlayer === game.player1 ? game.player1Symbol : game.player2Symbol;
    game.board[pos] = symbol;
    
    // Check for winner
    const winner = checkWinnerTTT(game.board);
    let embed;
    let components = [];
    
    if (winner) {
        if (winner === 'tie') {
            embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('🤝 ¡Empate!')
                .setDescription('La partida terminó en empate.')
                .addFields({
                    name: '🎯 Tablero Final',
                    value: formatBoardTTT(game.board),
                    inline: false
                });
        } else {
            const winnerUser = winner === game.player1Symbol ? `<@${game.player1}>` : `<@${game.player2}>`;
            embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎉 ¡Tenemos un ganador!')
                .setDescription(`${winnerUser} (${winner}) ha ganado!`)
                .addFields({
                    name: '🎯 Tablero Final',
                    value: formatBoardTTT(game.board),
                    inline: false
                });
        }
        ticTacToeGames.delete(gameId);
    } else {
        // Switch turns
        game.currentPlayer = game.currentPlayer === game.player1 ? game.player2 : game.player1;
        const currentPlayerMention = `<@${game.currentPlayer}>`;
        const currentSymbol = game.currentPlayer === game.player1 ? game.player1Symbol : game.player2Symbol;
        
        embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🎮 Tic-Tac-Toe')
            .setDescription(`<@${game.player1}> vs <@${game.player2}>\n\n${currentPlayerMention} (${currentSymbol}) es tu turno!`)
            .addFields({
                name: '🎯 Tablero',
                value: formatBoardTTT(game.board),
                inline: false
            })
            .setFooter({ text: 'Haz clic en un botón para hacer tu movimiento' });
        
        components = createGameBoardTTT(gameId, game.board);
    }
    
    await interaction.update({ embeds: [embed], components });
}

// Helper functions for Tic-Tac-Toe (duplicated for index.js access)
function formatBoardTTT(board) {
    return `${board[0]}${board[1]}${board[2]}\n${board[3]}${board[4]}${board[5]}\n${board[6]}${board[7]}${board[8]}`;
}

function createGameBoardTTT(gameId, board) {
    const rows = [];
    for (let i = 0; i < 3; i++) {
        const row = new ActionRowBuilder();
        for (let j = 0; j < 3; j++) {
            const position = i * 3 + j;
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`ttt_${gameId}_${position}`)
                    .setLabel(board[position])
                    .setStyle(board[position] === '⬜' ? ButtonStyle.Secondary : ButtonStyle.Primary)
                    .setDisabled(board[position] !== '⬜')
            );
        }
        rows.push(row);
    }
    return rows;
}

function checkWinnerTTT(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] !== '⬜' && board[a] === board[b] && board[b] === board[c]) {
            return board[a];
        }
    }
    
    return board.includes('⬜') ? null : 'tie';
}

// Express Web Server Dashboard Configuration
const express = require('express');
const app = express();
const path = require('path');
const db = require('./database');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the static assets
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API Endpoint to get bot statistics
app.get('/api/status', (req, res) => {
    res.json({
        status: client.readyAt ? 'online' : 'offline',
        guilds: client.guilds.cache.size,
        users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
        ping: client.ws.ping,
        uptime: client.uptime || 0
    });
});

// API Endpoint to get all channels for a guild
app.get('/api/channels', (req, res) => {
    const guildId = req.query.guildId;
    if (!guildId) {
        return res.status(400).json({ error: 'Missing guildId' });
    }
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        return res.status(404).json({ error: 'Guild not found' });
    }
    const textChannels = guild.channels.cache
        .filter(c => c.type === 0) // GuildText
        .map(c => ({ id: c.id, name: c.name }));
    res.json(textChannels);
});

// API Endpoint to get guilds list
app.get('/api/guilds', (req, res) => {
    const guilds = client.guilds.cache.map(g => ({ id: g.id, name: g.name }));
    res.json(guilds);
});

// API Endpoint to list server members
app.get('/api/members', async (req, res) => {
    const guildId = req.query.guildId;
    if (!guildId) {
        return res.status(400).json({ error: 'Missing guildId' });
    }
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'Guild not found' });
        }
        
        // Fetch all members
        const members = await guild.members.fetch();
        const memberList = members.map(m => ({
            id: m.id,
            username: m.user.username,
            nickname: m.nickname || '',
            avatar: m.user.displayAvatarURL({ size: 128 }),
            roles: m.roles.cache.filter(r => r.name !== '@everyone').map(r => ({ id: r.id, name: r.name, color: r.hexColor })),
            joinedAt: m.joinedTimestamp
        }));
        res.json(memberList);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// API Endpoint to execute moderation actions
app.post('/api/moderation', async (req, res) => {
    const { guildId, action, userId, reason } = req.body;
    if (!guildId || !action || !userId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            return res.status(404).json({ error: 'Guild not found' });
        }
        
        const targetMember = await guild.members.fetch(userId).catch(() => null);
        if (!targetMember) {
            return res.status(404).json({ error: 'Member not found' });
        }
        
        const finalReason = reason || 'Acción ejecutada desde el Panel Web';
        
        if (action === 'kick') {
            if (!targetMember.kickable) {
                return res.status(403).json({ error: 'No tengo permisos para expulsar a este usuario.' });
            }
            await targetMember.kick(finalReason);
            return res.json({ success: true, message: `Usuario ${targetMember.user.username} expulsado.` });
        }
        
        if (action === 'ban') {
            if (!targetMember.bannable) {
                return res.status(403).json({ error: 'No tengo permisos para banear a este usuario.' });
            }
            await targetMember.ban({ reason: finalReason });
            return res.json({ success: true, message: `Usuario ${targetMember.user.username} baneado.` });
        }
        
        if (action === 'warn') {
            try {
                await targetMember.send(`⚠️ Has recibido una advertencia en **${guild.name}**\nRazón: ${finalReason}`);
            } catch (err) {
                console.log('No se pudo enviar DM al usuario advertido:', err.message);
            }
            return res.json({ success: true, message: `Advertencia enviada a ${targetMember.user.username}.` });
        }
        
        return res.status(400).json({ error: 'Acción no válida' });
    } catch (error) {
        console.error('Error executing moderation action:', error);
        res.status(500).json({ error: 'Error al ejecutar la acción de moderación.' });
    }
});

// API Endpoint to get current settings
app.get('/api/settings', (req, res) => {
    const guildId = req.query.guildId;
    if (!guildId) {
        return res.status(400).json({ error: 'Missing guildId' });
    }
    res.json(db.getGuildSettings(guildId));
});

// API Endpoint to update settings
app.post('/api/settings', (req, res) => {
    const { guildId, welcome, antiraid, general } = req.body;
    if (!guildId) {
        return res.status(400).json({ error: 'Missing guildId' });
    }

    if (welcome) {
        db.saveWelcomeSettings(guildId, welcome);
    }
    if (antiraid) {
        db.saveAntiRaidSettings(guildId, antiraid);
    }
    if (general) {
        db.saveGeneralSettings(guildId, general);
    }

    res.json({ success: true, settings: db.getGuildSettings(guildId) });
});

// API Endpoint to get roles
app.get('/api/roles', (req, res) => {
    const guildId = req.query.guildId;
    if (!guildId) return res.status(400).json({ error: 'Missing guildId' });
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found' });
    
    const roles = guild.roles.cache
        .filter(r => r.name !== '@everyone')
        .sort((a, b) => b.position - a.position)
        .map(r => ({ id: r.id, name: r.name, color: r.hexColor, position: r.position }));
    res.json(roles);
});

// API Endpoint to send a ticket panel
app.post('/api/tickets/panel', async (req, res) => {
    const { guildId, channelId, title, description, color } = req.body;
    if (!guildId || !channelId) return res.status(400).json({ error: 'Missing parameters' });
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return res.status(404).json({ error: 'Guild not found' });
        
        const channel = guild.channels.cache.get(channelId);
        if (!channel) return res.status(404).json({ error: 'Channel not found' });
        
        const ticketEmbed = new EmbedBuilder()
            .setColor(color || '#0099ff')
            .setTitle(title || '🎫 Soporte')
            .setDescription(description || 'Haz clic en el botón de abajo para crear un ticket de soporte.')
            .setTimestamp();
            
        const createButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('Crear Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫')
            );
            
        await channel.send({ embeds: [ticketEmbed], components: [createButton] });
        res.json({ success: true, message: 'Panel de tickets enviado correctamente' });
    } catch (error) {
        console.error('Error sending ticket panel:', error);
        res.status(500).json({ error: 'Failed to send panel' });
    }
});

// API Endpoint to send an embed
app.post('/api/embeds', async (req, res) => {
    const { guildId, channelId, title, description, color, image, footer } = req.body;
    if (!guildId || !channelId || !title || !description) return res.status(400).json({ error: 'Missing parameters' });
    
    try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) return res.status(404).json({ error: 'Guild not found' });
        
        const channel = guild.channels.cache.get(channelId);
        if (!channel) return res.status(404).json({ error: 'Channel not found' });
        
        const embed = new EmbedBuilder()
            .setColor(color || '#5865F2')
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
            
        if (image) embed.setImage(image);
        if (footer) embed.setFooter({ text: footer });
            
        await channel.send({ embeds: [embed] });
        res.json({ success: true, message: 'Embed enviado correctamente' });
    } catch (error) {
        console.error('Error sending embed:', error);
        res.status(500).json({ error: 'Failed to send embed' });
    }
});

// Start Express Dashboard
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[Dashboard] Web interface listening on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('Error al iniciar el bot de Discord:', err.message);
    console.log('[Dashboard] El servidor web sigue en ejecución para configuración.');
});
