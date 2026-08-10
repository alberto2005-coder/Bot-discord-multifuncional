const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getEconomy, updateEconomy, resetEconomy } = require('../database');

const economyCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('balance')
            .setDescription('Ver tu dinero o el de otro usuario')
            .addUserOption(option => 
                option.setName('usuario')
                    .setDescription('El usuario que quieres comprobar')
                    .setRequired(false)
            ),
        async execute(interaction) {
            const user = interaction.options.getUser('usuario') || interaction.user;
            const eco = getEconomy(user.id);
            
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`💰 Balance de ${user.username}`)
                .addFields(
                    { name: '👛 Cartera', value: `${eco.wallet} 🪙`, inline: true },
                    { name: '🏦 Banco', value: `${eco.bank} 🪙`, inline: true },
                    { name: '💵 Total', value: `${eco.wallet + eco.bank} 🪙`, inline: true }
                )
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp();
                
            await interaction.reply({ embeds: [embed] });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('work')
            .setDescription('Trabaja para ganar algunas monedas'),
        async execute(interaction) {
            const eco = getEconomy(interaction.user.id);
            const now = Date.now();
            const cooldownAmount = 60 * 60 * 1000; // 1 hora en ms
            
            if (now - eco.lastWork < cooldownAmount) {
                const timeLeft = Math.round((cooldownAmount - (now - eco.lastWork)) / 1000 / 60);
                return interaction.reply({ content: `⏳ ¡Ya has trabajado hace poco! Vuelve en **${timeLeft} minutos**.`, ephemeral: true });
            }
            
            const earnings = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
            eco.wallet += earnings;
            eco.lastWork = now;
            
            updateEconomy(interaction.user.id, eco);
            
            const jobs = ['Programador', 'Streamer', 'Repartidor', 'Chef', 'Youtuber', 'Médico', 'Diseñador'];
            const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
            
            await interaction.reply(`💼 Trabajaste como **${randomJob}** y ganaste **${earnings} 🪙**.`);
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('daily')
            .setDescription('Reclama tu recompensa diaria'),
        async execute(interaction) {
            const eco = getEconomy(interaction.user.id);
            const now = Date.now();
            const cooldownAmount = 24 * 60 * 60 * 1000; // 24 horas en ms
            
            if (now - eco.lastDaily < cooldownAmount) {
                const timeLeft = Math.round((cooldownAmount - (now - eco.lastDaily)) / 1000 / 60 / 60);
                return interaction.reply({ content: `⏳ Ya has reclamado tu recompensa diaria. Vuelve en **${timeLeft} horas**.`, ephemeral: true });
            }
            
            const reward = 1000;
            eco.wallet += reward;
            eco.lastDaily = now;
            
            updateEconomy(interaction.user.id, eco);
            
            await interaction.reply(`🎁 ¡Has reclamado tu recompensa diaria de **${reward} 🪙**!`);
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('deposit')
            .setDescription('Deposita dinero de tu cartera a tu banco')
            .addIntegerOption(option => 
                option.setName('cantidad')
                    .setDescription('Cantidad a depositar')
                    .setRequired(true)
            ),
        async execute(interaction) {
            const amount = interaction.options.getInteger('cantidad');
            
            if (amount <= 0) {
                return interaction.reply({ content: '❌ La cantidad debe ser mayor que cero.', ephemeral: true });
            }
            
            const eco = getEconomy(interaction.user.id);
            
            if (eco.wallet < amount) {
                return interaction.reply({ content: `❌ No tienes suficientes monedas en la cartera. Tienes **${eco.wallet} 🪙**.`, ephemeral: true });
            }
            
            eco.wallet -= amount;
            eco.bank += amount;
            updateEconomy(interaction.user.id, eco);
            
            await interaction.reply(`✅ Has depositado **${amount} 🪙** en tu banco.`);
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('withdraw')
            .setDescription('Retira dinero de tu banco a tu cartera')
            .addIntegerOption(option => 
                option.setName('cantidad')
                    .setDescription('Cantidad a retirar')
                    .setRequired(true)
            ),
        async execute(interaction) {
            const amount = interaction.options.getInteger('cantidad');
            
            if (amount <= 0) {
                return interaction.reply({ content: '❌ La cantidad debe ser mayor que cero.', ephemeral: true });
            }
            
            const eco = getEconomy(interaction.user.id);
            
            if (eco.bank < amount) {
                return interaction.reply({ content: `❌ No tienes suficientes monedas en el banco. Tienes **${eco.bank} 🪙**.`, ephemeral: true });
            }
            
            eco.bank -= amount;
            eco.wallet += amount;
            updateEconomy(interaction.user.id, eco);
            
            await interaction.reply(`✅ Has retirado **${amount} 🪙** de tu banco.`);
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('shop')
            .setDescription('Muestra la tienda de ítems'),
        async execute(interaction) {
            const shopEmbed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle('🛒 Tienda del Servidor')
                .setDescription('Para comprar algo usa `/buy [id]`')
                .addFields(
                    { name: '1️⃣ Rol VIP | 10000 🪙', value: 'Obtén el rol VIP exclusivo.', inline: false },
                    { name: '2️⃣ VIP Plus | 25000 🪙', value: 'Obtén beneficios superiores.', inline: false },
                    { name: '3️⃣ Título Personalizado | 50000 🪙', value: 'Pide un rol a medida.', inline: false }
                )
                .setTimestamp();
                
            await interaction.reply({ embeds: [shopEmbed] });
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('buy')
            .setDescription('Compra un ítem de la tienda')
            .addIntegerOption(option => 
                option.setName('id')
                    .setDescription('ID del ítem a comprar (1, 2, 3)')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Rol VIP (10,000 🪙)', value: 1 },
                        { name: 'VIP Plus (25,000 🪙)', value: 2 },
                        { name: 'Título Personalizado (50,000 🪙)', value: 3 }
                    )
            ),
        async execute(interaction) {
            const itemId = interaction.options.getInteger('id');
            const eco = getEconomy(interaction.user.id);
            
            const items = {
                1: { name: 'Rol VIP', price: 10000 },
                2: { name: 'VIP Plus', price: 25000 },
                3: { name: 'Título Personalizado', price: 50000 }
            };
            
            const item = items[itemId];
            
            if (eco.wallet < item.price) {
                return interaction.reply({ content: `❌ Necesitas **${item.price} 🪙** en tu cartera para comprar **${item.name}**. Tienes **${eco.wallet} 🪙**.`, ephemeral: true });
            }
            
            // Deduct the money
            eco.wallet -= item.price;
            updateEconomy(interaction.user.id, eco);
            
            // As a placeholder, we just announce the purchase. To give roles we need actual role IDs setup.
            await interaction.reply(`🎉 ¡Has comprado **${item.name}** por **${item.price} 🪙**!\n*(Nota: Como no hay roles configurados con ID específico aún, contacta a un administrador para reclamar tu premio si es necesario)*`);
        }
    },
    {
        data: new SlashCommandBuilder()
            .setName('eco-reset')
            .setDescription('Reiniciar economía (Solo Admins)')
            .addUserOption(option => 
                option.setName('usuario')
                    .setDescription('Usuario a reiniciar (Si se deja en blanco se reinicia TODO el servidor)')
                    .setRequired(false)
            ),
        async execute(interaction) {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({ content: '❌ No tienes permisos de Administrador para usar este comando.', ephemeral: true });
            }
            
            const user = interaction.options.getUser('usuario');
            
            if (user) {
                resetEconomy(user.id);
                return interaction.reply(`✅ La economía del usuario **${user.tag}** ha sido reiniciada a cero.`);
            } else {
                resetEconomy();
                return interaction.reply('⚠️ **ATENCIÓN:** Toda la economía del servidor ha sido reiniciada a cero.');
            }
        }
    }
];

module.exports = economyCommands;
