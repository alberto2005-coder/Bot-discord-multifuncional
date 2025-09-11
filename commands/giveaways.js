const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

// Sistema de sorteos en memoria (en producción usarías una base de datos)
const activeGiveaways = new Map();

const giveawayCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('giveaway')
            .setDescription('Crear un sorteo')
            .addStringOption(option =>
                option.setName('premio')
                    .setDescription('Premio del sorteo')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('duracion')
                    .setDescription('Duración en minutos')
                    .setMinValue(1)
                    .setMaxValue(10080) // 7 días máximo
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('ganadores')
                    .setDescription('Número de ganadores (por defecto: 1)')
                    .setMinValue(1)
                    .setMaxValue(20)
                    .setRequired(false))
            .addStringOption(option =>
                option.setName('descripcion')
                    .setDescription('Descripción adicional del sorteo')
                    .setRequired(false))
            .addChannelOption(option =>
                option.setName('canal')
                    .setDescription('Canal donde publicar el sorteo (por defecto: canal actual)')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        async execute(interaction) {
            const prize = interaction.options.getString('premio');
            const duration = interaction.options.getInteger('duracion');
            const winners = interaction.options.getInteger('ganadores') || 1;
            const description = interaction.options.getString('descripcion') || '';
            const channel = interaction.options.getChannel('canal') || interaction.channel;

            const endTime = Date.now() + (duration * 60 * 1000);
            const giveawayId = `${interaction.guild.id}-${Date.now()}`;

            const giveawayEmbed = new EmbedBuilder()
                .setColor('#FF6B9D')
                .setTitle('🎉 ¡SORTEO ACTIVO!')
                .setDescription(`**Premio:** ${prize}\n\n${description}`)
                .addFields(
                    { name: '🏆 Ganadores', value: `${winners}`, inline: true },
                    { name: '⏰ Termina', value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true },
                    { name: '👑 Organizador', value: interaction.user.toString(), inline: true },
                    { name: '🎫 Participantes', value: '0', inline: true }
                )
                .setFooter({ text: 'Haz clic en 🎉 para participar!' })
                .setTimestamp(endTime);

            const giveawayButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`giveaway_join_${giveawayId}`)
                        .setLabel('🎉 Participar')
                        .setStyle(ButtonStyle.Primary)
                );

            const giveawayMessage = await channel.send({ 
                embeds: [giveawayEmbed], 
                components: [giveawayButton] 
            });

            // Guardar sorteo en memoria
            activeGiveaways.set(giveawayId, {
                messageId: giveawayMessage.id,
                channelId: channel.id,
                guildId: interaction.guild.id,
                prize: prize,
                winners: winners,
                endTime: endTime,
                participants: new Set(),
                hostId: interaction.user.id,
                description: description,
                ended: false
            });

            // Programar finalización automática
            setTimeout(() => {
                endGiveaway(giveawayId);
            }, duration * 60 * 1000);

            const confirmEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Sorteo Creado')
                .setDescription(`Sorteo creado exitosamente en ${channel}`)
                .addFields(
                    { name: '🏆 Premio', value: prize, inline: true },
                    { name: '⏰ Duración', value: `${duration} minutos`, inline: true },
                    { name: '👑 Ganadores', value: `${winners}`, inline: true }
                );

            await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('end-giveaway')
            .setDescription('Terminar un sorteo inmediatamente')
            .addStringOption(option =>
                option.setName('mensaje-id')
                    .setDescription('ID del mensaje del sorteo')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        async execute(interaction) {
            const messageId = interaction.options.getString('mensaje-id');
            
            // Buscar el sorteo por mensaje ID
            let giveawayId = null;
            for (const [id, giveaway] of activeGiveaways.entries()) {
                if (giveaway.messageId === messageId && giveaway.guildId === interaction.guild.id) {
                    giveawayId = id;
                    break;
                }
            }

            if (!giveawayId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se encontró un sorteo activo con esa ID de mensaje.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const giveaway = activeGiveaways.get(giveawayId);
            
            if (giveaway.ended) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF9900')
                    .setTitle('⚠️ Advertencia')
                    .setDescription('Este sorteo ya ha terminado.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Verificar permisos (solo el organizador o admin puede terminar)
            if (giveaway.hostId !== interaction.user.id && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Sin Permisos')
                    .setDescription('Solo el organizador del sorteo o un administrador puede terminarlo.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            await endGiveaway(giveawayId, interaction.user);

            const successEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Sorteo Terminado')
                .setDescription('El sorteo ha sido terminado manualmente.');

            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('reroll-giveaway')
            .setDescription('Sortear nuevos ganadores para un sorteo terminado')
            .addStringOption(option =>
                option.setName('mensaje-id')
                    .setDescription('ID del mensaje del sorteo terminado')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('nuevos-ganadores')
                    .setDescription('Número de nuevos ganadores (opcional)')
                    .setMinValue(1)
                    .setMaxValue(20)
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        async execute(interaction) {
            const messageId = interaction.options.getString('mensaje-id');
            const newWinnerCount = interaction.options.getInteger('nuevos-ganadores');
            
            // Buscar el sorteo por mensaje ID
            let giveawayId = null;
            for (const [id, giveaway] of activeGiveaways.entries()) {
                if (giveaway.messageId === messageId && giveaway.guildId === interaction.guild.id) {
                    giveawayId = id;
                    break;
                }
            }

            if (!giveawayId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se encontró un sorteo con esa ID de mensaje.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const giveaway = activeGiveaways.get(giveawayId);

            if (!giveaway.ended) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF9900')
                    .setTitle('⚠️ Advertencia')
                    .setDescription('Este sorteo aún está activo. Usa `/end-giveaway` primero.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Verificar permisos
            if (giveaway.hostId !== interaction.user.id && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Sin Permisos')
                    .setDescription('Solo el organizador del sorteo o un administrador puede hacer un re-sorteo.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const participants = Array.from(giveaway.participants);
            if (participants.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF9900')
                    .setTitle('😅 Sin Participantes')
                    .setDescription('No hay participantes para hacer un re-sorteo.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const winnersToSelect = newWinnerCount || giveaway.winners;
            const selectedWinners = selectRandomWinners(participants, winnersToSelect);

            const channel = interaction.guild.channels.cache.get(giveaway.channelId);
            if (channel) {
                const rerollEmbed = new EmbedBuilder()
                    .setColor('#9B59B6')
                    .setTitle('🔄 ¡Re-sorteo!')
                    .setDescription(`**Premio:** ${giveaway.prize}\n\n**Nuevos Ganadores:**\n${selectedWinners.map(id => `🎉 <@${id}>`).join('\n')}`)
                    .addFields(
                        { name: '👑 Re-sorteado por', value: interaction.user.toString(), inline: true },
                        { name: '🎫 Total Participantes', value: `${participants.length}`, inline: true }
                    )
                    .setTimestamp();

                await channel.send({ 
                    content: selectedWinners.map(id => `<@${id}>`).join(' '),
                    embeds: [rerollEmbed] 
                });
            }

            const confirmEmbed = new EmbedBuilder()
                .setColor('#9B59B6')
                .setTitle('🔄 Re-sorteo Completado')
                .setDescription(`Se han seleccionado ${selectedWinners.length} nuevos ganadores.`);

            await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('giveaway-list')
            .setDescription('Ver todos los sorteos activos en el servidor')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
        async execute(interaction) {
            const guildGiveaways = Array.from(activeGiveaways.entries())
                .filter(([id, giveaway]) => giveaway.guildId === interaction.guild.id && !giveaway.ended);

            if (guildGiveaways.length === 0) {
                const noGiveawaysEmbed = new EmbedBuilder()
                    .setColor('#FF9900')
                    .setTitle('📋 Sin Sorteos Activos')
                    .setDescription('No hay sorteos activos en este servidor.');
                return interaction.reply({ embeds: [noGiveawaysEmbed] });
            }

            const giveawayList = guildGiveaways.map(([id, giveaway]) => {
                const channel = interaction.guild.channels.cache.get(giveaway.channelId);
                return `**${giveaway.prize}**\n` +
                       `Canal: ${channel ? channel.toString() : 'Canal eliminado'}\n` +
                       `Termina: <t:${Math.floor(giveaway.endTime / 1000)}:R>\n` +
                       `Participantes: ${giveaway.participants.size}\n` +
                       `ID: \`${giveaway.messageId}\``;
            }).join('\n\n');

            const listEmbed = new EmbedBuilder()
                .setColor('#7289DA')
                .setTitle('🎉 Sorteos Activos')
                .setDescription(giveawayList)
                .setFooter({ text: `${guildGiveaways.length} sorteo(s) activo(s)` })
                .setTimestamp();

            await interaction.reply({ embeds: [listEmbed] });
        },
    }
];

// Función para seleccionar ganadores aleatorios
function selectRandomWinners(participants, count) {
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, participants.length));
}

// Función para terminar un sorteo
async function endGiveaway(giveawayId, endedBy = null) {
    const giveaway = activeGiveaways.get(giveawayId);
    if (!giveaway || giveaway.ended) return;

    giveaway.ended = true;
    
    const participants = Array.from(giveaway.participants);
    let winners = [];
    
    if (participants.length === 0) {
        // Sin participantes
        winners = [];
    } else {
        winners = selectRandomWinners(participants, giveaway.winners);
    }

    try {
        const channel = global.client?.channels?.cache?.get(giveaway.channelId);
        if (!channel) return;

        const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
        if (!message) return;

        // Actualizar mensaje original
        const endedEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🏁 ¡SORTEO TERMINADO!')
            .setDescription(`**Premio:** ${giveaway.prize}\n\n${giveaway.description}`)
            .addFields(
                { name: '🏆 Ganadores', value: `${giveaway.winners}`, inline: true },
                { name: '🎫 Participantes', value: `${participants.length}`, inline: true },
                { name: '👑 Organizador', value: `<@${giveaway.hostId}>`, inline: true }
            )
            .setFooter({ text: endedBy ? `Terminado por ${endedBy.tag}` : 'Sorteo terminado automáticamente' })
            .setTimestamp();

        await message.edit({ embeds: [endedEmbed], components: [] });

        // Anunciar ganadores
        if (winners.length > 0) {
            const winnerEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🎊 ¡FELICIDADES!')
                .setDescription(`**Premio:** ${giveaway.prize}\n\n**Ganador${winners.length > 1 ? 'es' : ''}:**\n${winners.map(id => `🎉 <@${id}>`).join('\n')}`)
                .addFields(
                    { name: '🎫 Total Participantes', value: `${participants.length}`, inline: true }
                )
                .setTimestamp();

            await channel.send({ 
                content: winners.map(id => `<@${id}>`).join(' '),
                embeds: [winnerEmbed] 
            });
        } else {
            const noWinnerEmbed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle('😅 Sin Ganadores')
                .setDescription(`**Premio:** ${giveaway.prize}\n\nNo hubo suficientes participantes para este sorteo.`)
                .setTimestamp();

            await channel.send({ embeds: [noWinnerEmbed] });
        }

    } catch (error) {
        console.error('Error ending giveaway:', error);
    }
}

// Función para manejar participación en sorteos
async function handleGiveawayJoin(interaction) {
    const giveawayId = interaction.customId.replace('giveaway_join_', '');
    const giveaway = activeGiveaways.get(giveawayId);

    if (!giveaway) {
        return interaction.reply({ content: '❌ Este sorteo ya no existe.', ephemeral: true });
    }

    if (giveaway.ended) {
        return interaction.reply({ content: '❌ Este sorteo ya ha terminado.', ephemeral: true });
    }

    const userId = interaction.user.id;
    
    if (giveaway.participants.has(userId)) {
        giveaway.participants.delete(userId);
        await interaction.reply({ content: '📤 Has salido del sorteo.', ephemeral: true });
    } else {
        giveaway.participants.add(userId);
        await interaction.reply({ content: '🎉 ¡Te has unido al sorteo! Buena suerte.', ephemeral: true });
    }

    // Actualizar el embed con el nuevo número de participantes
    try {
        const channel = interaction.guild.channels.cache.get(giveaway.channelId);
        const message = await channel.messages.fetch(giveaway.messageId);
        
        const updatedEmbed = EmbedBuilder.from(message.embeds[0])
            .setFields(
                { name: '🏆 Ganadores', value: `${giveaway.winners}`, inline: true },
                { name: '⏰ Termina', value: `<t:${Math.floor(giveaway.endTime / 1000)}:R>`, inline: true },
                { name: '👑 Organizador', value: `<@${giveaway.hostId}>`, inline: true },
                { name: '🎫 Participantes', value: `${giveaway.participants.size}`, inline: true }
            );

        await message.edit({ embeds: [updatedEmbed] });
    } catch (error) {
        console.error('Error updating giveaway embed:', error);
    }
}

module.exports = { 
    commands: giveawayCommands, 
    handleGiveawayJoin,
    endGiveaway
};