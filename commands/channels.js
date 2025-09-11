const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const channelCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('create-channel')
            .setDescription('Crear un canal con configuraciones específicas')
            .addStringOption(option =>
                option.setName('nombre')
                    .setDescription('Nombre del canal')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('tipo')
                    .setDescription('Tipo de canal')
                    .addChoices(
                        { name: 'Texto', value: 'text' },
                        { name: 'Voz', value: 'voice' },
                        { name: 'Categoría', value: 'category' }
                    )
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('limite-usuarios')
                    .setDescription('Límite de usuarios para canal de voz (0 = sin límite)')
                    .setMinValue(0)
                    .setMaxValue(99)
                    .setRequired(false))
            .addChannelOption(option =>
                option.setName('categoria')
                    .setDescription('Categoría donde crear el canal')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(interaction) {
            const name = interaction.options.getString('nombre');
            const type = interaction.options.getString('tipo');
            const userLimit = interaction.options.getInteger('limite-usuarios') || 0;
            const category = interaction.options.getChannel('categoria');

            await interaction.deferReply();

            try {
                let channelType;
                switch(type) {
                    case 'text':
                        channelType = ChannelType.GuildText;
                        break;
                    case 'voice':
                        channelType = ChannelType.GuildVoice;
                        break;
                    case 'category':
                        channelType = ChannelType.GuildCategory;
                        break;
                }

                const channelOptions = {
                    name: name,
                    type: channelType
                };

                if (category && category.type === ChannelType.GuildCategory) {
                    channelOptions.parent = category.id;
                }

                if (type === 'voice' && userLimit > 0) {
                    channelOptions.userLimit = userLimit;
                }

                const newChannel = await interaction.guild.channels.create(channelOptions);

                const successEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Canal Creado')
                    .setDescription(`El canal ${newChannel} ha sido creado exitosamente.`)
                    .addFields(
                        { name: '📝 Nombre', value: name, inline: true },
                        { name: '🔧 Tipo', value: type === 'text' ? 'Texto' : type === 'voice' ? 'Voz' : 'Categoría', inline: true },
                        { name: '📁 Categoría', value: category ? category.name : 'Sin categoría', inline: true },
                        { name: '👥 Límite de usuarios', value: type === 'voice' && userLimit > 0 ? `${userLimit} usuarios` : 'Sin límite', inline: true },
                        { name: '👮 Creado por', value: interaction.user.tag, inline: true },
                        { name: '🆔 ID del canal', value: newChannel.id, inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [successEmbed] });
            } catch (error) {
                console.error('Error creating channel:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se pudo crear el canal. Verifica mis permisos y que el nombre sea válido.');
                await interaction.editReply({ embeds: [errorEmbed] });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('edit-channel')
            .setDescription('Editar configuraciones de un canal')
            .addChannelOption(option =>
                option.setName('canal')
                    .setDescription('Canal a editar')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('nuevo-nombre')
                    .setDescription('Nuevo nombre para el canal')
                    .setRequired(false))
            .addIntegerOption(option =>
                option.setName('limite-usuarios')
                    .setDescription('Nuevo límite de usuarios (solo canales de voz)')
                    .setMinValue(0)
                    .setMaxValue(99)
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(interaction) {
            const channel = interaction.options.getChannel('canal');
            const newName = interaction.options.getString('nuevo-nombre');
            const newUserLimit = interaction.options.getInteger('limite-usuarios');

            if (!newName && newUserLimit === null) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Debes especificar al menos un cambio (nombre o límite de usuarios).');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            await interaction.deferReply();

            try {
                const changes = [];

                if (newName && newName !== channel.name) {
                    await channel.setName(newName);
                    changes.push(`Nombre: ${channel.name} → ${newName}`);
                }

                if (newUserLimit !== null && channel.type === ChannelType.GuildVoice) {
                    await channel.setUserLimit(newUserLimit);
                    changes.push(`Límite de usuarios: ${newUserLimit === 0 ? 'Sin límite' : `${newUserLimit} usuarios`}`);
                }

                const successEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Canal Editado')
                    .setDescription(`El canal ${channel} ha sido editado exitosamente.`)
                    .addFields(
                        { name: '🔧 Cambios realizados', value: changes.join('\n') || 'Ningún cambio', inline: false },
                        { name: '👮 Editado por', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [successEmbed] });
            } catch (error) {
                console.error('Error editing channel:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se pudo editar el canal. Verifica mis permisos.');
                await interaction.editReply({ embeds: [errorEmbed] });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('delete-channel')
            .setDescription('Eliminar un canal')
            .addChannelOption(option =>
                option.setName('canal')
                    .setDescription('Canal a eliminar')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('razon')
                    .setDescription('Razón para eliminar el canal')
                    .setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
        async execute(interaction) {
            const channel = interaction.options.getChannel('canal');
            const reason = interaction.options.getString('razon') || 'No se especificó razón';

            if (channel.id === interaction.channel.id) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No puedes eliminar el canal desde el mismo canal. Usa este comando desde otro canal.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            await interaction.deferReply();

            try {
                const channelName = channel.name;
                const channelType = channel.type;
                
                await channel.delete(reason);

                const successEmbed = new EmbedBuilder()
                    .setColor('#FF8C00')
                    .setTitle('🗑️ Canal Eliminado')
                    .setDescription(`El canal **${channelName}** ha sido eliminado.`)
                    .addFields(
                        { name: '🔧 Tipo de canal', value: channelType === ChannelType.GuildText ? 'Texto' : channelType === ChannelType.GuildVoice ? 'Voz' : 'Otro', inline: true },
                        { name: '📝 Razón', value: reason, inline: true },
                        { name: '👮 Eliminado por', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                await interaction.editReply({ embeds: [successEmbed] });
            } catch (error) {
                console.error('Error deleting channel:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se pudo eliminar el canal. Verifica mis permisos.');
                await interaction.editReply({ embeds: [errorEmbed] });
            }
        },
    }
];

module.exports = channelCommands;