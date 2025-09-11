const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

// Sistema de configuración de bienvenidas y despedidas (en memoria)
const welcomeSettings = new Map();

const welcomeCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('setup-welcome')
            .setDescription('Configurar mensajes de bienvenida')
            .addChannelOption(option =>
                option.setName('canal')
                    .setDescription('Canal donde enviar mensajes de bienvenida')
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('mensaje')
                    .setDescription('Mensaje personalizado (usa {user} para mencionar, {server} para nombre del servidor)')
                    .setRequired(false))
            .addStringOption(option =>
                option.setName('color')
                    .setDescription('Color del embed en hexadecimal (ej: #00FF00)')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
            const channel = interaction.options.getChannel('canal');
            const customMessage = interaction.options.getString('mensaje') || 
                '¡Bienvenido/a a **{server}**, {user}! 🎉\n\nEsperamos que disfrutes tu estadía aquí. No olvides leer las reglas y presentarte si gustas.';
            const color = interaction.options.getString('color') || '#00FF00';
            
            // Validar color hexadecimal
            const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (!hexColorRegex.test(color)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Color inválido. Usa formato hexadecimal como #00FF00');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
            
            const guildId = interaction.guild.id;
            const settings = welcomeSettings.get(guildId) || {};
            
            settings.welcomeEnabled = true;
            settings.welcomeChannel = channel.id;
            settings.welcomeMessage = customMessage;
            settings.welcomeColor = color;
            
            welcomeSettings.set(guildId, settings);
            
            const setupEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Bienvenidas Configuradas')
                .setDescription('El sistema de bienvenidas ha sido configurado exitosamente.')
                .addFields(
                    { name: '📍 Canal', value: channel.toString(), inline: true },
                    { name: '🎨 Color', value: color, inline: true },
                    { name: '📝 Mensaje', value: customMessage.length > 100 ? customMessage.substring(0, 100) + '...' : customMessage, inline: false }
                )
                .setFooter({ text: `Configurado por ${interaction.user.tag}` })
                .setTimestamp();
            
            await interaction.reply({ embeds: [setupEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('setup-goodbye')
            .setDescription('Configurar mensajes de despedida')
            .addChannelOption(option =>
                option.setName('canal')
                    .setDescription('Canal donde enviar mensajes de despedida')
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('mensaje')
                    .setDescription('Mensaje personalizado (usa {user} para mencionar, {server} para nombre del servidor)')
                    .setRequired(false))
            .addStringOption(option =>
                option.setName('color')
                    .setDescription('Color del embed en hexadecimal (ej: #FF0000)')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
            const channel = interaction.options.getChannel('canal');
            const customMessage = interaction.options.getString('mensaje') || 
                '👋 **{user}** ha dejado **{server}**.\n\nEsperamos verte de nuevo pronto. ¡Que tengas un buen día!';
            const color = interaction.options.getString('color') || '#FF6B6B';
            
            // Validar color hexadecimal
            const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (!hexColorRegex.test(color)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Color inválido. Usa formato hexadecimal como #FF0000');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
            
            const guildId = interaction.guild.id;
            const settings = welcomeSettings.get(guildId) || {};
            
            settings.goodbyeEnabled = true;
            settings.goodbyeChannel = channel.id;
            settings.goodbyeMessage = customMessage;
            settings.goodbyeColor = color;
            
            welcomeSettings.set(guildId, settings);
            
            const setupEmbed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setTitle('✅ Despedidas Configuradas')
                .setDescription('El sistema de despedidas ha sido configurado exitosamente.')
                .addFields(
                    { name: '📍 Canal', value: channel.toString(), inline: true },
                    { name: '🎨 Color', value: color, inline: true },
                    { name: '📝 Mensaje', value: customMessage.length > 100 ? customMessage.substring(0, 100) + '...' : customMessage, inline: false }
                )
                .setFooter({ text: `Configurado por ${interaction.user.tag}` })
                .setTimestamp();
            
            await interaction.reply({ embeds: [setupEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('welcome-status')
            .setDescription('Ver el estado de la configuración de bienvenidas y despedidas')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
            const guildId = interaction.guild.id;
            const settings = welcomeSettings.get(guildId) || {};
            
            const statusEmbed = new EmbedBuilder()
                .setColor('#7289DA')
                .setTitle('📊 Estado del Sistema de Bienvenidas')
                .addFields(
                    { name: '🎉 Bienvenidas', value: settings.welcomeEnabled ? '✅ Activado' : '❌ Desactivado', inline: true },
                    { name: '👋 Despedidas', value: settings.goodbyeEnabled ? '✅ Activado' : '❌ Desactivado', inline: true },
                    { name: '\u200b', value: '\u200b', inline: true }
                )
                .setTimestamp();
            
            if (settings.welcomeEnabled) {
                const welcomeChannel = interaction.guild.channels.cache.get(settings.welcomeChannel);
                statusEmbed.addFields(
                    { name: '📍 Canal de Bienvenida', value: welcomeChannel ? welcomeChannel.toString() : 'Canal no encontrado', inline: true },
                    { name: '🎨 Color de Bienvenida', value: settings.welcomeColor || '#00FF00', inline: true },
                    { name: '\u200b', value: '\u200b', inline: true }
                );
            }
            
            if (settings.goodbyeEnabled) {
                const goodbyeChannel = interaction.guild.channels.cache.get(settings.goodbyeChannel);
                statusEmbed.addFields(
                    { name: '📍 Canal de Despedida', value: goodbyeChannel ? goodbyeChannel.toString() : 'Canal no encontrado', inline: true },
                    { name: '🎨 Color de Despedida', value: settings.goodbyeColor || '#FF6B6B', inline: true },
                    { name: '\u200b', value: '\u200b', inline: true }
                );
            }
            
            if (!settings.welcomeEnabled && !settings.goodbyeEnabled) {
                statusEmbed.setDescription('No hay configuraciones activas. Usa `/setup-welcome` o `/setup-goodbye` para configurar.');
            }
            
            await interaction.reply({ embeds: [statusEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('disable-welcome')
            .setDescription('Desactivar mensajes de bienvenida')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
            const guildId = interaction.guild.id;
            const settings = welcomeSettings.get(guildId) || {};
            
            settings.welcomeEnabled = false;
            welcomeSettings.set(guildId, settings);
            
            const disableEmbed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle('🔕 Bienvenidas Desactivadas')
                .setDescription('Los mensajes de bienvenida han sido desactivados.')
                .setFooter({ text: `Desactivado por ${interaction.user.tag}` })
                .setTimestamp();
            
            await interaction.reply({ embeds: [disableEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('disable-goodbye')
            .setDescription('Desactivar mensajes de despedida')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
            const guildId = interaction.guild.id;
            const settings = welcomeSettings.get(guildId) || {};
            
            settings.goodbyeEnabled = false;
            welcomeSettings.set(guildId, settings);
            
            const disableEmbed = new EmbedBuilder()
                .setColor('#FF9900')
                .setTitle('🔕 Despedidas Desactivadas')
                .setDescription('Los mensajes de despedida han sido desactivados.')
                .setFooter({ text: `Desactivado por ${interaction.user.tag}` })
                .setTimestamp();
            
            await interaction.reply({ embeds: [disableEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('test-welcome')
            .setDescription('Probar el mensaje de bienvenida')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        async execute(interaction) {
            const guildId = interaction.guild.id;
            const settings = welcomeSettings.get(guildId) || {};
            
            if (!settings.welcomeEnabled) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('El sistema de bienvenidas no está activado. Usa `/setup-welcome` primero.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
            
            const channel = interaction.guild.channels.cache.get(settings.welcomeChannel);
            if (!channel) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Canal de bienvenida no encontrado.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
            
            // Crear mensaje de prueba
            const message = settings.welcomeMessage
                .replace('{user}', interaction.user.toString())
                .replace('{server}', interaction.guild.name);
            
            const welcomeEmbed = new EmbedBuilder()
                .setColor(settings.welcomeColor)
                .setTitle('🎉 ¡Nuevo Miembro!')
                .setDescription(message)
                .setThumbnail(interaction.user.displayAvatarURL())
                .addFields(
                    { name: '👥 Miembro #', value: `${interaction.guild.memberCount}`, inline: true },
                    { name: '📅 Cuenta Creada', value: `<t:${Math.floor(interaction.user.createdTimestamp / 1000)}:R>`, inline: true }
                )
                .setFooter({ text: '🔧 Mensaje de Prueba' })
                .setTimestamp();
            
            await channel.send({ embeds: [welcomeEmbed] });
            
            const testEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('✅ Prueba Enviada')
                .setDescription(`Mensaje de bienvenida de prueba enviado a ${channel}.`);
            
            await interaction.reply({ embeds: [testEmbed], ephemeral: true });
        },
    }
];

// Funciones para obtener configuraciones
function getWelcomeSettings(guildId) {
    return welcomeSettings.get(guildId) || {};
}

module.exports = { 
    commands: welcomeCommands, 
    getWelcomeSettings 
};