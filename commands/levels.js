const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require('discord.js');
const { getLevel, getLeaderboard, resetLevels } = require('../database');

const levelCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('rank')
            .setDescription('Muestra tu nivel y XP actual, o el de otro usuario')
            .addUserOption(option => 
                option.setName('usuario')
                    .setDescription('El usuario que quieres comprobar')
                    .setRequired(false)
            ),
        async execute(interaction) {
            const user = interaction.options.getUser('usuario') || interaction.user;
            const guildId = interaction.guild.id;
            
            const levelData = getLevel(user.id, guildId);
            const xpNeeded = (levelData.level + 1) * 100;
            const progress = Math.round((levelData.xp / xpNeeded) * 100);
            
            // Un embed simple (también se podría usar canvacord, pero requires más dependencias)
            const rankEmbed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({ name: `Tarjeta de Nivel de ${user.username}`, iconURL: user.displayAvatarURL() })
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: '⭐ Nivel', value: `${levelData.level}`, inline: true },
                    { name: '✨ XP', value: `${levelData.xp} / ${xpNeeded}`, inline: true },
                    { name: '📈 Progreso', value: `${progress}% a siguiente nivel`, inline: false }
                )
                .setFooter({ text: 'Gana más XP enviando mensajes' })
                .setTimestamp();
                
            await interaction.reply({ embeds: [rankEmbed] });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('leaderboard')
            .setDescription('Muestra los usuarios con más nivel del servidor'),
        async execute(interaction) {
            const guildId = interaction.guild.id;
            const topUsers = getLeaderboard(guildId, 10);
            
            if (!topUsers || topUsers.length === 0) {
                return interaction.reply({ content: 'No hay datos de niveles en este servidor aún.', ephemeral: true });
            }
            
            const leaderboardEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`🏆 Tabla de Clasificación - ${interaction.guild.name}`)
                .setDescription('Top 10 usuarios con más nivel:\n\n' + 
                    topUsers.map((data, index) => {
                        let medal = '🏅';
                        if (index === 0) medal = '🥇';
                        if (index === 1) medal = '🥈';
                        if (index === 2) medal = '🥉';
                        
                        return `${medal} **#${index + 1}** <@${data.userId}>\n ↳ Nivel: **${data.level}** | XP: **${data.xp}**`;
                    }).join('\n\n')
                )
                .setTimestamp();
                
            await interaction.reply({ embeds: [leaderboardEmbed] });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('level-reset')
            .setDescription('Reiniciar los niveles (Solo Admins)')
            .addUserOption(option => 
                option.setName('usuario')
                    .setDescription('Usuario a reiniciar (Si en blanco, se reinicia todo el servidor)')
                    .setRequired(false)
            ),
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: '❌ No tienes permisos de Administrador para usar este comando.', ephemeral: true });
            }
            
            const user = interaction.options.getUser('usuario');
            const guildId = interaction.guild.id;
            
            if (user) {
                resetLevels(user.id, guildId);
                return interaction.reply(`✅ El nivel del usuario **${user.tag}** ha sido reiniciado a cero.`);
            } else {
                resetLevels(null, guildId);
                return interaction.reply('⚠️ **ATENCIÓN:** Todos los niveles del servidor han sido reiniciados a cero.');
            }
        }
    }
];

module.exports = levelCommands;
