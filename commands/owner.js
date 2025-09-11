const { SlashCommandBuilder, EmbedBuilder, ActivityType, MessageFlags } = require('discord.js');

// ID del creador del bot (solo eldestructor7614 puede usar estos comandos)
const OWNER_ID = '1016814881112084533';

function isOwner(userId) {
    return userId === OWNER_ID;
}

module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('set-status')
            .setDescription('[OWNER ONLY] Cambiar el estado/actividad del bot')
            .addStringOption(option =>
                option.setName('tipo')
                    .setDescription('Tipo de actividad')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Playing (Jugando)', value: 'playing' },
                        { name: 'Streaming (Transmitiendo)', value: 'streaming' },
                        { name: 'Listening (Escuchando)', value: 'listening' },
                        { name: 'Watching (Viendo)', value: 'watching' },
                        { name: 'Competing (Compitiendo)', value: 'competing' },
                        { name: 'Custom (Personalizado)', value: 'custom' }
                    ))
            .addStringOption(option =>
                option.setName('texto')
                    .setDescription('Texto del estado')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('url')
                    .setDescription('URL para streaming (solo si tipo es "streaming")')
                    .setRequired(false)),
        async execute(interaction) {
            if (!isOwner(interaction.user.id)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Acceso Denegado')
                    .setDescription('Solo el creador del bot puede usar este comando.')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                return await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }

            const tipo = interaction.options.getString('tipo');
            const texto = interaction.options.getString('texto');
            const url = interaction.options.getString('url');

            let activityType;
            let activityOptions = { name: texto };

            switch (tipo) {
                case 'playing':
                    activityType = ActivityType.Playing;
                    break;
                case 'streaming':
                    activityType = ActivityType.Streaming;
                    if (url) activityOptions.url = url;
                    break;
                case 'listening':
                    activityType = ActivityType.Listening;
                    break;
                case 'watching':
                    activityType = ActivityType.Watching;
                    break;
                case 'competing':
                    activityType = ActivityType.Competing;
                    break;
                case 'custom':
                    activityType = ActivityType.Custom;
                    activityOptions.state = texto;
                    break;
            }

            try {
                await interaction.client.user.setActivity(activityOptions, { type: activityType });

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Estado Actualizado')
                    .setDescription(`Estado del bot cambiado exitosamente.`)
                    .addFields(
                        { name: 'Tipo', value: tipo.charAt(0).toUpperCase() + tipo.slice(1), inline: true },
                        { name: 'Texto', value: texto, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Creado por eldestructor7614' });

                if (url && tipo === 'streaming') {
                    embed.addFields({ name: 'URL', value: url, inline: true });
                }

                await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });

            } catch (error) {
                console.error('Error al cambiar estado:', error);
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Error al cambiar el estado del bot.')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('set-avatar')
            .setDescription('[OWNER ONLY] Cambiar el avatar del bot')
            .addAttachmentOption(option =>
                option.setName('imagen')
                    .setDescription('Nueva imagen para el avatar del bot')
                    .setRequired(true)),
        async execute(interaction) {
            if (!isOwner(interaction.user.id)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Acceso Denegado')
                    .setDescription('Solo el creador del bot puede usar este comando.')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                return await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }

            const imagen = interaction.options.getAttachment('imagen');

            // Verificar que sea una imagen
            if (!imagen.contentType?.startsWith('image/')) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Archivo Inválido')
                    .setDescription('Por favor, sube un archivo de imagen válido (PNG, JPG, GIF).')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                return await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }

            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            try {
                await interaction.client.user.setAvatar(imagen.url);

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Avatar Actualizado')
                    .setDescription('El avatar del bot ha sido cambiado exitosamente.')
                    .setImage(imagen.url)
                    .setTimestamp()
                    .setFooter({ text: 'Creado por eldestructor7614' });

                await interaction.editReply({ embeds: [embed] });

            } catch (error) {
                console.error('Error al cambiar avatar:', error);
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Error al cambiar el avatar del bot. Asegúrate de que la imagen sea válida y no supere los límites de Discord.')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                await interaction.editReply({ embeds: [embed] });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('set-username')
            .setDescription('[OWNER ONLY] Cambiar el nombre del bot')
            .addStringOption(option =>
                option.setName('nombre')
                    .setDescription('Nuevo nombre para el bot')
                    .setRequired(true)
                    .setMinLength(2)
                    .setMaxLength(32)),
        async execute(interaction) {
            if (!isOwner(interaction.user.id)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Acceso Denegado')
                    .setDescription('Solo el creador del bot puede usar este comando.')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                return await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }

            const nuevoNombre = interaction.options.getString('nombre');

            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

            try {
                const nombreAnterior = interaction.client.user.username;
                await interaction.client.user.setUsername(nuevoNombre);

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Nombre Actualizado')
                    .setDescription('El nombre del bot ha sido cambiado exitosamente.')
                    .addFields(
                        { name: 'Nombre Anterior', value: nombreAnterior, inline: true },
                        { name: 'Nuevo Nombre', value: nuevoNombre, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Creado por eldestructor7614' });

                await interaction.editReply({ embeds: [embed] });

            } catch (error) {
                console.error('Error al cambiar nombre:', error);
                let errorMessage = 'Error al cambiar el nombre del bot.';
                
                if (error.code === 50035) {
                    errorMessage = 'Nombre inválido. Debe tener entre 2-32 caracteres y no contener caracteres especiales.';
                } else if (error.code === 50013) {
                    errorMessage = 'No tienes permisos para cambiar el nombre del bot.';
                }

                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription(errorMessage)
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                await interaction.editReply({ embeds: [embed] });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('bot-info-owner')
            .setDescription('[OWNER ONLY] Información completa del bot para el propietario'),
        async execute(interaction) {
            if (!isOwner(interaction.user.id)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Acceso Denegado')
                    .setDescription('Solo el creador del bot puede usar este comando.')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                return await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }

            const client = interaction.client;
            const uptime = Math.floor(client.uptime / 1000);
            const uptimeString = `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`;

            const embed = new EmbedBuilder()
                .setColor('#7289DA')
                .setTitle('🔧 Información Completa del Bot (Owner)')
                .setDescription('Información detallada y estadísticas del bot.')
                .setThumbnail(client.user.displayAvatarURL())
                .addFields(
                    { name: '🏷️ Nombre del Bot', value: client.user.tag, inline: true },
                    { name: '🆔 ID del Bot', value: client.user.id, inline: true },
                    { name: '👨‍💻 Propietario', value: '<@1016814881112084533>', inline: true },
                    { name: '⏰ Tiempo Activo', value: uptimeString, inline: true },
                    { name: '🏠 Servidores', value: `${client.guilds.cache.size}`, inline: true },
                    { name: '👥 Usuarios', value: `${client.users.cache.size}`, inline: true },
                    { name: '📝 Comandos Totales', value: `${client.commands.size}`, inline: true },
                    { name: '🎵 Estado Actual', value: client.user.presence?.activities[0]?.name || 'Sin estado', inline: true },
                    { name: '🔗 Canales', value: `${client.channels.cache.size}`, inline: true },
                    { name: '💾 Uso de Memoria', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true },
                    { name: '🔧 Discord.js', value: require('discord.js').version, inline: true },
                    { name: '🟢 Node.js', value: process.version, inline: true },
                    { name: '📊 Ping API', value: `${Math.round(client.ws.ping)}ms`, inline: true },
                    { name: '🕒 Iniciado', value: `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:F>`, inline: true },
                    { name: '🎯 Latencia', value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Panel de Control del Propietario | Creado por eldestructor7614' });

            await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('clear-status')
            .setDescription('[OWNER ONLY] Limpiar el estado del bot'),
        async execute(interaction) {
            if (!isOwner(interaction.user.id)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Acceso Denegado')
                    .setDescription('Solo el creador del bot puede usar este comando.')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                return await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }

            try {
                await interaction.client.user.setActivity(null);

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Estado Limpiado')
                    .setDescription('El estado del bot ha sido limpiado exitosamente.')
                    .setTimestamp()
                    .setFooter({ text: 'Creado por eldestructor7614' });

                await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });

            } catch (error) {
                console.error('Error al limpiar estado:', error);
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Error al limpiar el estado del bot.')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('server-list')
            .setDescription('[OWNER ONLY] Ver lista de servidores donde está el bot'),
        async execute(interaction) {
            if (!isOwner(interaction.user.id)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Acceso Denegado')
                    .setDescription('Solo el creador del bot puede usar este comando.')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                return await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }

            const guilds = interaction.client.guilds.cache;
            let serverList = '';
            let totalMembers = 0;

            guilds.forEach((guild, index) => {
                totalMembers += guild.memberCount;
                serverList += `${index + 1}. **${guild.name}** (${guild.memberCount} miembros)\n   ID: \`${guild.id}\`\n`;
            });

            if (serverList.length > 4096) {
                serverList = serverList.substring(0, 4090) + '...';
            }

            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('🏠 Lista de Servidores')
                .setDescription(serverList || 'No hay servidores.')
                .addFields(
                    { name: '📊 Total de Servidores', value: `${guilds.size}`, inline: true },
                    { name: '👥 Total de Miembros', value: `${totalMembers}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Panel del Propietario | Creado por eldestructor7614' });

            await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('restart-bot')
            .setDescription('[OWNER ONLY] Reinicia el bot completamente'),
        async execute(interaction) {
            if (!isOwner(interaction.user.id)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Acceso Denegado')
                    .setDescription('Solo el creador del bot puede usar este comando.')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                return await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }

            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('🔄 Reiniciando Bot')
                .setDescription('El bot se está reiniciando... Esto puede tomar unos segundos.')
                .addFields(
                    { name: '⏰ Tiempo Estimado', value: '10-15 segundos', inline: true },
                    { name: '📊 Estado', value: 'Desconectando...', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Reinicio iniciado por eldestructor7614' });

            await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });

            // Dar tiempo para que se envíe el mensaje antes de reiniciar
            setTimeout(() => {
                console.log('🔄 Reinicio del bot iniciado por el propietario...');
                process.exit(0); // Termina el proceso actual, Replit lo reiniciará automáticamente
            }, 2000);
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('shutdown-bot')
            .setDescription('[OWNER ONLY] Apaga el bot completamente')
            .addBooleanOption(option =>
                option.setName('confirmar')
                    .setDescription('Confirma que quieres apagar el bot')
                    .setRequired(true)),
        async execute(interaction) {
            if (!isOwner(interaction.user.id)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Acceso Denegado')
                    .setDescription('Solo el creador del bot puede usar este comando.')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                return await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }

            const confirmar = interaction.options.getBoolean('confirmar');

            if (!confirmar) {
                const embed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('⚠️ Apagado Cancelado')
                    .setDescription('Debes confirmar el apagado estableciendo el parámetro "confirmar" en verdadero.')
                    .setFooter({ text: 'Creado por eldestructor7614' });
                
                return await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
            }

            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🔴 Apagando Bot')
                .setDescription('El bot se está apagando... ¡Hasta la próxima!')
                .addFields(
                    { name: '📊 Estado', value: 'Desconectando de Discord...', inline: true },
                    { name: '⚠️ Nota', value: 'El bot no se reiniciará automáticamente', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Apagado iniciado por eldestructor7614' });

            await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });

            // Dar tiempo para que se envíe el mensaje antes de apagar
            setTimeout(() => {
                console.log('🔴 Apagado del bot iniciado por el propietario...');
                interaction.client.destroy(); // Desconecta de Discord
                process.exit(1); // Termina el proceso sin reiniciar automáticamente
            }, 2000);
        },
    }
];