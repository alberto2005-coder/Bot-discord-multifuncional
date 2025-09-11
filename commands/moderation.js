const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

// Sistema de warns en memoria (en producción usarías una base de datos)
const userWarns = new Map();

const moderationCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('kick')
            .setDescription('Kick a member from the server')
            .addUserOption(option =>
                option.setName('target')
                    .setDescription('The member to kick')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for the kick')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
        async execute(interaction) {
            const target = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            const member = interaction.guild.members.cache.get(target.id);

            if (!member) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('User not found in this server!');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (!member.kickable) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('I cannot kick this member! They may have higher permissions.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (member.id === interaction.user.id) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('You cannot kick yourself!');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            try {
                await member.kick(reason);
                
                const successEmbed = new EmbedBuilder()
                    .setColor('#FF8C00')
                    .setTitle('🦶 Member Kicked')
                    .setDescription(`${target.tag} has been kicked from the server.`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Moderator', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [successEmbed] });
            } catch (error) {
                console.error('Error kicking member:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Failed to kick the member. Please try again.');
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('ban')
            .setDescription('Ban a member from the server')
            .addUserOption(option =>
                option.setName('target')
                    .setDescription('The member to ban')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for the ban')
                    .setRequired(false))
            .addIntegerOption(option =>
                option.setName('days')
                    .setDescription('Number of days of messages to delete (0-7)')
                    .setMinValue(0)
                    .setMaxValue(7)
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
        async execute(interaction) {
            const target = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason') || 'No reason provided';
            const days = interaction.options.getInteger('days') || 0;
            const member = interaction.guild.members.cache.get(target.id);

            if (member && !member.bannable) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('I cannot ban this member! They may have higher permissions.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (target.id === interaction.user.id) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('You cannot ban yourself!');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            try {
                await interaction.guild.members.ban(target, { 
                    reason: reason,
                    deleteMessageDays: days
                });
                
                const successEmbed = new EmbedBuilder()
                    .setColor('#DC143C')
                    .setTitle('🔨 Member Banned')
                    .setDescription(`${target.tag} has been banned from the server.`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Moderator', value: interaction.user.tag, inline: true },
                        { name: 'Messages Deleted', value: `${days} days`, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [successEmbed] });
            } catch (error) {
                console.error('Error banning member:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Failed to ban the member. Please try again.');
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('warn')
            .setDescription('Advertir a un usuario')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario a advertir')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('razon')
                    .setDescription('Razón de la advertencia')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(interaction) {
            const targetUser = interaction.options.getUser('usuario');
            const reason = interaction.options.getString('razon');
            const member = interaction.guild.members.cache.get(targetUser.id);

            if (!member) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Usuario no encontrado en este servidor.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (targetUser.id === interaction.user.id) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No puedes advertirte a ti mismo.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const guildId = interaction.guild.id;
            const userId = targetUser.id;
            const warnKey = `${guildId}-${userId}`;
            
            if (!userWarns.has(warnKey)) {
                userWarns.set(warnKey, []);
            }
            
            const warns = userWarns.get(warnKey);
            warns.push({
                id: warns.length + 1,
                reason: reason,
                moderator: interaction.user.id,
                date: new Date().toISOString()
            });
            
            userWarns.set(warnKey, warns);

            const warnEmbed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle('⚠️ Usuario Advertido')
                .setDescription(`${targetUser} ha recibido una advertencia.`)
                .addFields(
                    { name: '📋 Razón', value: reason, inline: true },
                    { name: '👮 Moderador', value: interaction.user.tag, inline: true },
                    { name: '📊 Total de Warns', value: `${warns.length}`, inline: true }
                )
                .setTimestamp();

            // Acción automática según número de warns
            if (warns.length >= 3) {
                warnEmbed.addFields(
                    { name: '🚨 Acción Automática', value: 'Usuario alcanzó 3 advertencias. Considera sanciones adicionales.', inline: false }
                );
                warnEmbed.setColor('#FF0000');
            }

            await interaction.reply({ embeds: [warnEmbed] });

            // Enviar DM al usuario
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#FF9900')
                    .setTitle('⚠️ Has recibido una advertencia')
                    .setDescription(`Has sido advertido en **${interaction.guild.name}**`)
                    .addFields(
                        { name: '📋 Razón', value: reason, inline: true },
                        { name: '📊 Advertencias totales', value: `${warns.length}`, inline: true }
                    )
                    .setTimestamp();

                await targetUser.send({ embeds: [dmEmbed] });
            } catch (error) {
                console.log('No se pudo enviar DM al usuario');
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('warnings')
            .setDescription('Ver las advertencias de un usuario')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario del que ver las advertencias')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(interaction) {
            const targetUser = interaction.options.getUser('usuario');
            const guildId = interaction.guild.id;
            const userId = targetUser.id;
            const warnKey = `${guildId}-${userId}`;
            
            const warns = userWarns.get(warnKey) || [];

            if (warns.length === 0) {
                const noWarnsEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Sin Advertencias')
                    .setDescription(`${targetUser.tag} no tiene advertencias.`);
                return interaction.reply({ embeds: [noWarnsEmbed] });
            }

            const warningsText = warns.map(warn => 
                `**${warn.id}.** ${warn.reason}\n` +
                `*Moderador: <@${warn.moderator}> | ${new Date(warn.date).toLocaleDateString()}*`
            ).join('\n\n');

            const warningsEmbed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle(`⚠️ Advertencias de ${targetUser.tag}`)
                .setDescription(warningsText)
                .addFields(
                    { name: '📊 Total', value: `${warns.length} advertencias`, inline: true }
                )
                .setThumbnail(targetUser.displayAvatarURL())
                .setTimestamp();

            await interaction.reply({ embeds: [warningsEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('clear-warnings')
            .setDescription('Limpiar todas las advertencias de un usuario')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario del que limpiar las advertencias')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
            const targetUser = interaction.options.getUser('usuario');
            const guildId = interaction.guild.id;
            const userId = targetUser.id;
            const warnKey = `${guildId}-${userId}`;
            
            const warns = userWarns.get(warnKey) || [];
            userWarns.delete(warnKey);

            const clearEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🧹 Advertencias Limpiadas')
                .setDescription(`Se eliminaron **${warns.length}** advertencias de ${targetUser.tag}.`)
                .addFields(
                    { name: '👮 Limpiado por', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [clearEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('mute')
            .setDescription('Silenciar a un usuario temporalmente')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario a silenciar')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('duracion')
                    .setDescription('Duración del silencio')
                    .addChoices(
                        { name: '5 minutos', value: '5m' },
                        { name: '15 minutos', value: '15m' },
                        { name: '30 minutos', value: '30m' },
                        { name: '1 hora', value: '1h' },
                        { name: '6 horas', value: '6h' },
                        { name: '12 horas', value: '12h' },
                        { name: '1 día', value: '1d' },
                        { name: '1 semana', value: '7d' }
                    )
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('razon')
                    .setDescription('Razón del silencio')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(interaction) {
            const targetUser = interaction.options.getUser('usuario');
            const duration = interaction.options.getString('duracion');
            const reason = interaction.options.getString('razon') || 'No se especificó razón';
            const member = interaction.guild.members.cache.get(targetUser.id);

            if (!member) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Usuario no encontrado en este servidor.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (targetUser.id === interaction.user.id) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No puedes silenciarte a ti mismo.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Convertir duración a milisegundos
            const durationMap = {
                '5m': 5 * 60 * 1000,
                '15m': 15 * 60 * 1000,
                '30m': 30 * 60 * 1000,
                '1h': 60 * 60 * 1000,
                '6h': 6 * 60 * 60 * 1000,
                '12h': 12 * 60 * 60 * 1000,
                '1d': 24 * 60 * 60 * 1000,
                '7d': 7 * 24 * 60 * 60 * 1000
            };

            const durationMs = durationMap[duration];
            const durationText = {
                '5m': '5 minutos',
                '15m': '15 minutos', 
                '30m': '30 minutos',
                '1h': '1 hora',
                '6h': '6 horas',
                '12h': '12 horas',
                '1d': '1 día',
                '7d': '1 semana'
            };

            try {
                await member.timeout(durationMs, reason);
                
                const muteEmbed = new EmbedBuilder()
                    .setColor('#FF8C00')
                    .setTitle('🔇 Usuario Silenciado')
                    .setDescription(`${targetUser} ha sido silenciado.`)
                    .addFields(
                        { name: '⏰ Duración', value: durationText[duration], inline: true },
                        { name: '📋 Razón', value: reason, inline: true },
                        { name: '👮 Moderador', value: interaction.user.tag, inline: true },
                        { name: '⏱️ Termina', value: `<t:${Math.floor((Date.now() + durationMs) / 1000)}:R>`, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [muteEmbed] });

                // Enviar DM al usuario
                try {
                    const dmEmbed = new EmbedBuilder()
                        .setColor('#FF8C00')
                        .setTitle('🔇 Has sido silenciado')
                        .setDescription(`Has sido silenciado en **${interaction.guild.name}**`)
                        .addFields(
                            { name: '⏰ Duración', value: durationText[duration], inline: true },
                            { name: '📋 Razón', value: reason, inline: true }
                        )
                        .setTimestamp();

                    await targetUser.send({ embeds: [dmEmbed] });
                } catch (error) {
                    console.log('No se pudo enviar DM al usuario');
                }

            } catch (error) {
                console.error('Error muting user:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se pudo silenciar al usuario. Verifica mis permisos.');
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('unmute')
            .setDescription('Quitar el silencio a un usuario')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario a des-silenciar')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
        async execute(interaction) {
            const targetUser = interaction.options.getUser('usuario');
            const member = interaction.guild.members.cache.get(targetUser.id);

            if (!member) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Usuario no encontrado en este servidor.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (!member.isCommunicationDisabled()) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF9900')
                    .setTitle('⚠️ Advertencia')
                    .setDescription('Este usuario no está silenciado.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            try {
                await member.timeout(null);
                
                const unmuteEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🔊 Usuario Des-silenciado')
                    .setDescription(`${targetUser} ya puede hablar nuevamente.`)
                    .addFields(
                        { name: '👮 Des-silenciado por', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [unmuteEmbed] });

            } catch (error) {
                console.error('Error unmuting user:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se pudo des-silenciar al usuario. Verifica mis permisos.');
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        },
    }
];

module.exports = moderationCommands;
