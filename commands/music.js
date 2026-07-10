const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const musicCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('play')
            .setDescription('Reproduce una canción de YouTube en tu canal de voz')
            .addStringOption(option =>
                option.setName('cancion')
                    .setDescription('Nombre de la canción o enlace de YouTube')
                    .setRequired(true)),
        async execute(interaction) {
            const songName = interaction.options.getString('cancion');
            const voiceChannel = interaction.member.voice.channel;

            if (!voiceChannel) {
                return interaction.reply({
                    content: '❌ ¡Debes estar en un canal de voz para reproducir música!',
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            try {
                const client = interaction.client;
                await client.distube.play(voiceChannel, songName, {
                    textChannel: interaction.channel,
                    member: interaction.member,
                    message: interaction.message
                });
                
                const playEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🔍 Buscando canción')
                    .setDescription(`Buscando y reproduciendo: **${songName}**`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [playEmbed] });
            } catch (error) {
                console.error('Error al reproducir música:', error);
                await interaction.editReply({
                    content: '❌ Ocurrió un error al intentar reproducir la canción.'
                });
            }
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('skip')
            .setDescription('Salta la canción actual'),
        async execute(interaction) {
            const queue = interaction.client.distube.getQueue(interaction.guild.id);
            if (!queue) {
                return interaction.reply({ content: '❌ No hay música reproduciéndose en este servidor.', ephemeral: true });
            }

            try {
                await queue.skip();
                return interaction.reply({ content: '⏭️ ¡Canción saltada!' });
            } catch (error) {
                // Si no hay más canciones en la cola
                await queue.stop();
                return interaction.reply({ content: '⏭️ Canción saltada y cola vaciada. Desconectando...' });
            }
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('stop')
            .setDescription('Detiene la música y saca al bot del canal de voz'),
        async execute(interaction) {
            const queue = interaction.client.distube.getQueue(interaction.guild.id);
            if (!queue) {
                return interaction.reply({ content: '❌ No hay música reproduciéndose en este servidor.', ephemeral: true });
            }

            await queue.stop();
            return interaction.reply({ content: '⏹️ ¡Música detenida y bot desconectado!' });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('pause')
            .setDescription('Pausa la reproducción actual'),
        async execute(interaction) {
            const queue = interaction.client.distube.getQueue(interaction.guild.id);
            if (!queue) {
                return interaction.reply({ content: '❌ No hay música reproduciéndose en este servidor.', ephemeral: true });
            }

            if (queue.paused) {
                return interaction.reply({ content: '⏸️ La música ya está pausada.', ephemeral: true });
            }

            queue.pause();
            return interaction.reply({ content: '⏸️ Reproducción pausada.' });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('resume')
            .setDescription('Reanuda la reproducción pausada'),
        async execute(interaction) {
            const queue = interaction.client.distube.getQueue(interaction.guild.id);
            if (!queue) {
                return interaction.reply({ content: '❌ No hay música reproduciéndose en este servidor.', ephemeral: true });
            }

            if (!queue.paused) {
                return interaction.reply({ content: '▶️ La música ya se está reproduciendo.', ephemeral: true });
            }

            queue.resume();
            return interaction.reply({ content: '▶️ Reproducción reanudada.' });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('queue')
            .setDescription('Muestra la cola de reproducción actual'),
        async execute(interaction) {
            const queue = interaction.client.distube.getQueue(interaction.guild.id);
            if (!queue) {
                return interaction.reply({ content: '❌ No hay música reproduciéndose en este servidor.', ephemeral: true });
            }

            const q = queue.songs
                .map((song, i) => `${i === 0 ? '▶️' : `${i}.`} ${song.name} - \`${song.formattedDuration}\``)
                .slice(0, 10)
                .join('\n');

            const queueEmbed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('📋 Cola de Reproducción')
                .setDescription(q || 'No hay canciones en la cola.')
                .setFooter({ text: `Total de canciones: ${queue.songs.length}` })
                .setTimestamp();

            return interaction.reply({ embeds: [queueEmbed] });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('volume')
            .setDescription('Ajusta el volumen de la música')
            .addIntegerOption(option =>
                option.setName('nivel')
                    .setDescription('Nivel de volumen (1-100)')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(100)),
        async execute(interaction) {
            const volume = interaction.options.getInteger('nivel');
            const queue = interaction.client.distube.getQueue(interaction.guild.id);
            if (!queue) {
                return interaction.reply({ content: '❌ No hay música reproduciéndose en este servidor.', ephemeral: true });
            }

            queue.setVolume(volume);
            return interaction.reply({ content: `🔊 Volumen ajustado al **${volume}%**` });
        }
    }
];

module.exports = musicCommands;
