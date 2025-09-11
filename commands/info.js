const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const infoCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('serverinfo')
            .setDescription('Get information about the server'),
        async execute(interaction) {
            const guild = interaction.guild;
            const owner = await guild.fetchOwner();
            
            const serverEmbed = new EmbedBuilder()
                .setColor('#7289DA')
                .setTitle(`📊 ${guild.name} Server Information`)
                .setThumbnail(guild.iconURL())
                .addFields(
                    { name: '👑 Owner', value: `${owner.user.tag}`, inline: true },
                    { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                    { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
                    { name: '📝 Channels', value: `${guild.channels.cache.size}`, inline: true },
                    { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                    { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
                    { name: '🚀 Boost Level', value: `${guild.premiumTier}`, inline: true },
                    { name: '💎 Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
                    { name: '🆔 Server ID', value: `${guild.id}`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Server Information' });

            await interaction.reply({ embeds: [serverEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('userinfo')
            .setDescription('Get information about a user')
            .addUserOption(option =>
                option.setName('target')
                    .setDescription('The user to get information about')
                    .setRequired(false)),
        async execute(interaction) {
            const target = interaction.options.getUser('target') || interaction.user;
            const member = interaction.guild.members.cache.get(target.id);
            
            const userEmbed = new EmbedBuilder()
                .setColor('#9932CC')
                .setTitle(`👤 User Information: ${target.tag}`)
                .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
                .addFields(
                    { name: '🏷️ Username', value: `${target.tag}`, inline: true },
                    { name: '🆔 User ID', value: `${target.id}`, inline: true },
                    { name: '📅 Account Created', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:F>`, inline: false },
                    { name: '🤖 Bot', value: target.bot ? 'Yes' : 'No', inline: true }
                );

            if (member) {
                userEmbed.addFields(
                    { name: '📅 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                    { name: '🎭 Roles', value: member.roles.cache.size > 1 ? member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.toString()).slice(0, 10).join(', ') : 'None', inline: false }
                );

                if (member.premiumSince) {
                    userEmbed.addFields(
                        { name: '💎 Boosting Since', value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:F>`, inline: true }
                    );
                }
            }

            userEmbed.setTimestamp().setFooter({ text: 'User Information' });

            await interaction.reply({ embeds: [userEmbed] });
        },
    },
];

module.exports = infoCommands;
