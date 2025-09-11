const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

// Sistema de configuración antiraid (en memoria - en producción usarías una base de datos)
const antiRaidSettings = new Map();

const antiRaidCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('antiraid-panel')
            .setDescription('Mostrar el panel de configuración antiraid')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
            const guildId = interaction.guild.id;
            const settings = antiRaidSettings.get(guildId) || {
                antiLinks: false,
                antiEveryone: false,
                antiSpam: false,
                maxMentions: 3,
                antiInvites: false,
                autoMod: false
            };

            const statusEmoji = (enabled) => enabled ? '✅' : '❌';
            
            const panelEmbed = new EmbedBuilder()
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
                .setFooter({ text: 'Usa los botones para activar/desactivar las protecciones' })
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

            await interaction.reply({ embeds: [panelEmbed], components: [row1, row2] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('set-mention-limit')
            .setDescription('Establecer el límite máximo de menciones por mensaje')
            .addIntegerOption(option =>
                option.setName('limite')
                    .setDescription('Número máximo de menciones permitidas (1-10)')
                    .setMinValue(1)
                    .setMaxValue(10)
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
            const limit = interaction.options.getInteger('limite');
            const guildId = interaction.guild.id;
            
            const settings = antiRaidSettings.get(guildId) || {
                antiLinks: false,
                antiEveryone: false,
                antiSpam: false,
                maxMentions: 3,
                antiInvites: false,
                autoMod: false
            };
            
            settings.maxMentions = limit;
            antiRaidSettings.set(guildId, settings);

            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Límite de Menciones Actualizado')
                .setDescription(`El límite máximo de menciones por mensaje se estableció en **${limit}**.`)
                .addFields(
                    { name: '📊 Nuevo límite', value: `${limit} menciones`, inline: true },
                    { name: '⚙️ Configurado por', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('lockdown')
            .setDescription('Bloquear el servidor temporalmente contra raids')
            .addStringOption(option =>
                option.setName('duracion')
                    .setDescription('Duración del bloqueo')
                    .addChoices(
                        { name: '5 minutos', value: '5' },
                        { name: '15 minutos', value: '15' },
                        { name: '30 minutos', value: '30' },
                        { name: '1 hora', value: '60' },
                        { name: 'Manual', value: 'manual' }
                    )
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('razon')
                    .setDescription('Razón del bloqueo')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
            const duration = interaction.options.getString('duracion');
            const reason = interaction.options.getString('razon') || 'Protección contra raid';
            
            await interaction.deferReply();

            try {
                // Bloquear todos los canales de texto
                const textChannels = interaction.guild.channels.cache.filter(channel => 
                    channel.type === 0 && // GuildText
                    !channel.name.includes('mod') && 
                    !channel.name.includes('admin')
                );

                for (const [channelId, channel] of textChannels) {
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                        SendMessages: false,
                        AddReactions: false,
                        CreatePublicThreads: false,
                        CreatePrivateThreads: false
                    });
                }

                const lockdownEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('🔒 Servidor en Modo Bloqueo')
                    .setDescription(`El servidor ha sido bloqueado para prevenir raids.\n\n` +
                        `**Duración:** ${duration === 'manual' ? 'Hasta desbloqueo manual' : `${duration} minutos`}\n` +
                        `**Razón:** ${reason}\n` +
                        `**Activado por:** ${interaction.user.tag}`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [lockdownEmbed] });

                // Auto-desbloqueo si no es manual
                if (duration !== 'manual') {
                    setTimeout(async () => {
                        try {
                            for (const [channelId, channel] of textChannels) {
                                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                                    SendMessages: null,
                                    AddReactions: null,
                                    CreatePublicThreads: null,
                                    CreatePrivateThreads: null
                                });
                            }

                            const unlockEmbed = new EmbedBuilder()
                                .setColor('#00FF00')
                                .setTitle('🔓 Bloqueo Automático Finalizado')
                                .setDescription('El servidor ha sido desbloqueado automáticamente.')
                                .setTimestamp();

                            await interaction.followUp({ embeds: [unlockEmbed] });
                        } catch (error) {
                            console.error('Error auto-unlocking:', error);
                        }
                    }, parseInt(duration) * 60 * 1000);
                }

            } catch (error) {
                console.error('Error during lockdown:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se pudo activar el modo bloqueo. Verifica mis permisos.');
                await interaction.editReply({ embeds: [errorEmbed] });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('unlock')
            .setDescription('Desbloquear el servidor manualmente')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
            await interaction.deferReply();

            try {
                const textChannels = interaction.guild.channels.cache.filter(channel => 
                    channel.type === 0 // GuildText
                );

                for (const [channelId, channel] of textChannels) {
                    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                        SendMessages: null,
                        AddReactions: null,
                        CreatePublicThreads: null,
                        CreatePrivateThreads: null
                    });
                }

                const unlockEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🔓 Servidor Desbloqueado')
                    .setDescription(`El servidor ha sido desbloqueado exitosamente.\n\n` +
                        `**Desbloqueado por:** ${interaction.user.tag}`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [unlockEmbed] });

            } catch (error) {
                console.error('Error unlocking server:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se pudo desbloquear el servidor. Verifica mis permisos.');
                await interaction.editReply({ embeds: [errorEmbed] });
            }
        },
    }
];

// Funciones para obtener y actualizar configuraciones antiraid
function getAntiRaidSettings(guildId) {
    return antiRaidSettings.get(guildId) || {
        antiLinks: false,
        antiEveryone: false,
        antiSpam: false,
        maxMentions: 3,
        antiInvites: false,
        autoMod: false
    };
}

function updateAntiRaidSettings(guildId, settings) {
    antiRaidSettings.set(guildId, settings);
}

module.exports = { 
    commands: antiRaidCommands, 
    getAntiRaidSettings, 
    updateAntiRaidSettings 
};