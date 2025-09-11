const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const roleCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('add-role')
            .setDescription('Agregar un rol a un usuario')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario al que agregar el rol')
                    .setRequired(true))
            .addRoleOption(option =>
                option.setName('rol')
                    .setDescription('Rol a agregar')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        async execute(interaction) {
            const targetUser = interaction.options.getUser('usuario');
            const role = interaction.options.getRole('rol');
            const member = interaction.guild.members.cache.get(targetUser.id);

            if (!member) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Usuario no encontrado en este servidor.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Verificar jerarquía de roles
            if (role.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No puedes agregar un rol que está en tu mismo nivel o superior.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (role.position >= interaction.guild.members.me.roles.highest.position) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No puedo gestionar este rol porque está por encima de mi rol más alto.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (member.roles.cache.has(role.id)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF9900')
                    .setTitle('⚠️ Advertencia')
                    .setDescription(`${targetUser.tag} ya tiene el rol ${role.name}.`);
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            try {
                await member.roles.add(role);
                
                const successEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('✅ Rol Agregado')
                    .setDescription(`Se agregó el rol ${role} a ${targetUser}.`)
                    .addFields(
                        { name: '👤 Usuario', value: targetUser.tag, inline: true },
                        { name: '🎭 Rol', value: role.name, inline: true },
                        { name: '👮 Moderador', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [successEmbed] });
            } catch (error) {
                console.error('Error adding role:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se pudo agregar el rol. Verifica mis permisos.');
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('remove-role')
            .setDescription('Quitar un rol de un usuario')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario al que quitar el rol')
                    .setRequired(true))
            .addRoleOption(option =>
                option.setName('rol')
                    .setDescription('Rol a quitar')
                    .setRequired(true))
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
        async execute(interaction) {
            const targetUser = interaction.options.getUser('usuario');
            const role = interaction.options.getRole('rol');
            const member = interaction.guild.members.cache.get(targetUser.id);

            if (!member) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('Usuario no encontrado en este servidor.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Verificar jerarquía de roles
            if (role.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No puedes quitar un rol que está en tu mismo nivel o superior.');
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (!member.roles.cache.has(role.id)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF9900')
                    .setTitle('⚠️ Advertencia')
                    .setDescription(`${targetUser.tag} no tiene el rol ${role.name}.`);
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            try {
                await member.roles.remove(role);
                
                const successEmbed = new EmbedBuilder()
                    .setColor('#FF8C00')
                    .setTitle('🗑️ Rol Removido')
                    .setDescription(`Se quitó el rol ${role} de ${targetUser}.`)
                    .addFields(
                        { name: '👤 Usuario', value: targetUser.tag, inline: true },
                        { name: '🎭 Rol', value: role.name, inline: true },
                        { name: '👮 Moderador', value: interaction.user.tag, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [successEmbed] });
            } catch (error) {
                console.error('Error removing role:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('No se pudo quitar el rol. Verifica mis permisos.');
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('list-roles')
            .setDescription('Ver todos los roles del servidor o de un usuario específico')
            .addUserOption(option =>
                option.setName('usuario')
                    .setDescription('Usuario del que ver los roles (opcional)')
                    .setRequired(false)),
        async execute(interaction) {
            const targetUser = interaction.options.getUser('usuario');
            
            if (targetUser) {
                // Mostrar roles de un usuario específico
                const member = interaction.guild.members.cache.get(targetUser.id);
                
                if (!member) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Error')
                        .setDescription('Usuario no encontrado en este servidor.');
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }

                const userRoles = member.roles.cache
                    .filter(role => role.name !== '@everyone')
                    .sort((a, b) => b.position - a.position)
                    .map(role => role.toString());

                const rolesEmbed = new EmbedBuilder()
                    .setColor('#7289DA')
                    .setTitle(`🎭 Roles de ${targetUser.tag}`)
                    .setThumbnail(targetUser.displayAvatarURL())
                    .setDescription(userRoles.length > 0 ? userRoles.join(', ') : 'Este usuario no tiene roles adicionales.')
                    .addFields(
                        { name: '📊 Total de roles', value: `${userRoles.length}`, inline: true },
                        { name: '🎯 Rol más alto', value: member.roles.highest.toString(), inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [rolesEmbed] });
            } else {
                // Mostrar todos los roles del servidor
                const serverRoles = interaction.guild.roles.cache
                    .filter(role => role.name !== '@everyone')
                    .sort((a, b) => b.position - a.position)
                    .map(role => `${role} - ${role.members.size} miembros`);

                // Dividir en páginas si hay muchos roles
                const rolesPerPage = 10;
                const totalPages = Math.ceil(serverRoles.length / rolesPerPage);
                const currentPage = serverRoles.slice(0, rolesPerPage);

                const rolesEmbed = new EmbedBuilder()
                    .setColor('#7289DA')
                    .setTitle(`🎭 Roles del Servidor: ${interaction.guild.name}`)
                    .setDescription(currentPage.length > 0 ? currentPage.join('\n') : 'No hay roles en este servidor.')
                    .addFields(
                        { name: '📊 Total de roles', value: `${serverRoles.length}`, inline: true },
                        { name: '📄 Página', value: `1/${totalPages}`, inline: true }
                    )
                    .setTimestamp();

                if (serverRoles.length > rolesPerPage) {
                    rolesEmbed.setFooter({ text: 'Mostrando los primeros 10 roles. Usa comandos específicos para ver más.' });
                }

                await interaction.reply({ embeds: [rolesEmbed] });
            }
        },
    }
];

module.exports = roleCommands;