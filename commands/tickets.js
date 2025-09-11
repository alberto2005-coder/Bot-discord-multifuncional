const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');

const ticketCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('ticket-panel')
            .setDescription('Create a ticket panel for users to open support tickets')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(interaction) {
            const panelEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🎫 Sistema de Tickets de Soporte')
                .setDescription('¿Necesitas ayuda? ¡Crea un ticket de soporte!\n\n' +
                    '**¿Cómo funciona?**\n' +
                    '• Haz clic en el botón de abajo\n' +
                    '• Se creará un canal privado solo para ti\n' +
                    '• Explica tu problema o pregunta\n' +
                    '• El staff te ayudará lo antes posible\n\n' +
                    '**Tipos de soporte disponibles:**\n' +
                    '🔧 Soporte Técnico\n' +
                    '❓ Preguntas Generales\n' +
                    '📋 Reportar Problemas\n' +
                    '💼 Consultas Administrativas')
                .setFooter({ text: 'Sistema de Tickets • Haz clic en el botón para crear un ticket' })
                .setTimestamp();

            const ticketButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_ticket')
                        .setLabel('📩 Crear Ticket')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('🎫')
                );

            await interaction.reply({ 
                embeds: [panelEmbed], 
                components: [ticketButton] 
            });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('close-ticket')
            .setDescription('Close the current ticket')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(interaction) {
            const channel = interaction.channel;
            
            // Verificar si es un canal de ticket
            if (!channel.name.startsWith('ticket-')) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Este comando solo se puede usar en canales de tickets.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const confirmEmbed = new EmbedBuilder()
                .setColor('#ff9900')
                .setTitle('⚠️ Confirmar Cierre de Ticket')
                .setDescription('¿Estás seguro de que quieres cerrar este ticket?\n\n' +
                    '**Esta acción:**\n' +
                    '• Eliminará este canal permanentemente\n' +
                    '• No se puede deshacer\n' +
                    '• Se perderá todo el historial de conversación')
                .setFooter({ text: 'Tienes 30 segundos para confirmar' });

            const confirmRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm_close_ticket')
                        .setLabel('✅ Confirmar Cierre')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('cancel_close_ticket')
                        .setLabel('❌ Cancelar')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({ 
                embeds: [confirmEmbed], 
                components: [confirmRow] 
            });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('add-to-ticket')
            .setDescription('Add a user to the current ticket')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User to add to the ticket')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(interaction) {
            const channel = interaction.channel;
            const userToAdd = interaction.options.getUser('user');
            
            if (!channel.name.startsWith('ticket-')) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Este comando solo se puede usar en canales de tickets.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            try {
                await channel.permissionOverwrites.create(userToAdd, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true
                });

                const successEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Usuario Agregado')
                    .setDescription(`${userToAdd} ha sido agregado a este ticket.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [successEmbed] });
            } catch (error) {
                console.error('Error adding user to ticket:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se pudo agregar el usuario al ticket.');
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('remove-from-ticket')
            .setDescription('Remove a user from the current ticket')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('User to remove from the ticket')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(interaction) {
            const channel = interaction.channel;
            const userToRemove = interaction.options.getUser('user');
            
            if (!channel.name.startsWith('ticket-')) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Este comando solo se puede usar en canales de tickets.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            try {
                await channel.permissionOverwrites.delete(userToRemove);

                const successEmbed = new EmbedBuilder()
                    .setColor('#ff9900')
                    .setTitle('🚫 Usuario Removido')
                    .setDescription(`${userToRemove} ha sido removido de este ticket.`)
                    .setTimestamp();

                await interaction.reply({ embeds: [successEmbed] });
            } catch (error) {
                console.error('Error removing user from ticket:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se pudo remover el usuario del ticket.');
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        },
    }
];

module.exports = ticketCommands;