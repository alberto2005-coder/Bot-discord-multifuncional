const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

// Game storage
const ticTacToeGames = new Map();

const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "Why don't eggs tell jokes? They'd crack each other up!",
    "What do you call a fake noodle? An impasta!",
    "Why did the math book look so sad? Because it had too many problems!",
    "What do you call a bear with no teeth? A gummy bear!",
    "Why don't programmers like nature? It has too many bugs!",
    "What do you call a dinosaur that crashes his car? Tyrannosaurus Wrecks!",
    "Why did the coffee file a police report? It got mugged!",
    "What do you call a fish wearing a bowtie? Sofishticated!"
];

const facts = [
    "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.",
    "Octopuses have three hearts and blue blood.",
    "A group of flamingos is called a 'flamboyance'.",
    "Bananas are berries, but strawberries aren't.",
    "The shortest war in history lasted only 38-45 minutes between Britain and Zanzibar in 1896.",
    "A single cloud can weigh more than a million pounds.",
    "Dolphins have names for each other.",
    "The human brain uses about 20% of the body's total energy.",
    "A shrimp's heart is in its head.",
    "There are more possible games of chess than atoms in the observable universe."
];

const funCommands = [
    {
        data: new SlashCommandBuilder()
            .setName('joke')
            .setDescription('Get a random joke'),
        async execute(interaction) {
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

            const jokeEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('😂 Random Joke')
                .setDescription(randomJoke)
                .setTimestamp()
                .setFooter({ text: 'Hope that made you smile!' });

            await interaction.reply({ embeds: [jokeEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('fact')
            .setDescription('Get a random fun fact'),
        async execute(interaction) {
            const randomFact = facts[Math.floor(Math.random() * facts.length)];

            const factEmbed = new EmbedBuilder()
                .setColor('#00CED1')
                .setTitle('🧠 Fun Fact')
                .setDescription(randomFact)
                .setTimestamp()
                .setFooter({ text: 'The more you know!' });

            await interaction.reply({ embeds: [factEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('roll')
            .setDescription('Roll a dice')
            .addIntegerOption(option =>
                option.setName('sides')
                    .setDescription('Number of sides on the dice (default: 6)')
                    .setMinValue(2)
                    .setMaxValue(100)
                    .setRequired(false)),
        async execute(interaction) {
            const sides = interaction.options.getInteger('sides') || 6;
            const result = Math.floor(Math.random() * sides) + 1;

            const rollEmbed = new EmbedBuilder()
                .setColor('#FF6347')
                .setTitle('🎲 Dice Roll')
                .setDescription(`You rolled a **${result}** on a ${sides}-sided dice!`)
                .setTimestamp();

            await interaction.reply({ embeds: [rollEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('8ball')
            .setDescription('Pregúntale a la bola mágica 8')
            .addStringOption(option =>
                option.setName('pregunta')
                    .setDescription('Tu pregunta para la bola mágica')
                    .setRequired(true)),
        async execute(interaction) {
            const question = interaction.options.getString('pregunta');

            const responses = [
                'Es cierto.',
                'Definitivamente es así.',
                'Sin duda.',
                'Sí, definitivamente.',
                'Puedes contar con ello.',
                'Como yo lo veo, sí.',
                'Lo más probable.',
                'Las perspectivas son buenas.',
                'Sí.',
                'Las señales apuntan a que sí.',
                'La respuesta es confusa, intenta de nuevo.',
                'Pregunta de nuevo más tarde.',
                'Mejor no te lo digo ahora.',
                'No puedo predecirlo ahora.',
                'Concéntrate y pregunta de nuevo.',
                'No cuentes con ello.',
                'Mi respuesta es no.',
                'Mis fuentes dicen que no.',
                'Las perspectivas no son muy buenas.',
                'Muy dudoso.'
            ];

            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const ballEmbed = new EmbedBuilder()
                .setColor('#4B0082')
                .setTitle('🎱 Bola Mágica 8')
                .addFields(
                    { name: '❓ Pregunta', value: question, inline: false },
                    { name: '🔮 Respuesta', value: randomResponse, inline: false }
                )
                .setFooter({ text: `Pregunta hecha por ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [ballEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('meme')
            .setDescription('Obtener un meme aleatorio'),
        async execute(interaction) {
            await interaction.deferReply();

            try {
                // Usando API gratuita de memes
                const response = await fetch('https://meme-api.com/gimme');
                const memeData = await response.json();

                const memeEmbed = new EmbedBuilder()
                    .setColor('#FF6B6B')
                    .setTitle(`😂 ${memeData.title}`)
                    .setImage(memeData.url)
                    .addFields(
                        { name: '👍 Upvotes', value: `${memeData.ups || 'N/A'}`, inline: true },
                        { name: '📱 Subreddit', value: `r/${memeData.subreddit || 'memes'}`, inline: true }
                    )
                    .setFooter({ text: 'Meme solicitado por ' + interaction.user.tag })
                    .setTimestamp();

                await interaction.editReply({ embeds: [memeEmbed] });
            } catch (error) {
                console.error('Error fetching meme:', error);

                // Memes de respaldo en caso de error
                const backupMemes = [
                    'https://i.imgflip.com/1bij.jpg',
                    'https://i.imgflip.com/2/30b1gx.jpg',
                    'https://i.imgflip.com/26am.jpg'
                ];

                const randomMeme = backupMemes[Math.floor(Math.random() * backupMemes.length)];

                const fallbackEmbed = new EmbedBuilder()
                    .setColor('#FF6B6B')
                    .setTitle('😂 Meme Aleatorio')
                    .setImage(randomMeme)
                    .setFooter({ text: 'Meme de respaldo • Solicitado por ' + interaction.user.tag })
                    .setTimestamp();

                await interaction.editReply({ embeds: [fallbackEmbed] });
            }
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('coinflip')
            .setDescription('Lanzar una moneda'),
        async execute(interaction) {
            const result = Math.random() < 0.5 ? 'Cara' : 'Cruz';
            const emoji = result === 'Cara' ? '🪙' : '⚫';

            const coinEmbed = new EmbedBuilder()
                .setColor(result === 'Cara' ? '#FFD700' : '#708090')
                .setTitle('🪙 Lanzamiento de Moneda')
                .setDescription(`${emoji} **${result}**`)
                .setFooter({ text: `Lanzado por ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [coinEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('rps')
            .setDescription('Jugar piedra, papel o tijera contra el bot')
            .addStringOption(option =>
                option.setName('eleccion')
                    .setDescription('Tu elección')
                    .addChoices(
                        { name: '🗿 Piedra', value: 'piedra' },
                        { name: '📄 Papel', value: 'papel' },
                        { name: '✂️ Tijera', value: 'tijera' }
                    )
                    .setRequired(true)),
        async execute(interaction) {
            const userChoice = interaction.options.getString('eleccion');
            const choices = ['piedra', 'papel', 'tijera'];
            const botChoice = choices[Math.floor(Math.random() * choices.length)];

            const emojis = {
                'piedra': '🗿',
                'papel': '📄',
                'tijera': '✂️'
            };

            let result = '';
            let color = '#FFD700';

            if (userChoice === botChoice) {
                result = '🤝 ¡Empate!';
                color = '#FFD700';
            } else if (
                (userChoice === 'piedra' && botChoice === 'tijera') ||
                (userChoice === 'papel' && botChoice === 'piedra') ||
                (userChoice === 'tijera' && botChoice === 'papel')
            ) {
                result = '🎉 ¡Ganaste!';
                color = '#00FF00';
            } else {
                result = '😅 ¡Perdiste!';
                color = '#FF0000';
            }

            const rpsEmbed = new EmbedBuilder()
                .setColor(color)
                .setTitle('🎮 Piedra, Papel o Tijera')
                .addFields(
                    { name: '👤 Tu elección', value: `${emojis[userChoice]} ${userChoice.charAt(0).toUpperCase() + userChoice.slice(1)}`, inline: true },
                    { name: '🤖 Mi elección', value: `${emojis[botChoice]} ${botChoice.charAt(0).toUpperCase() + botChoice.slice(1)}`, inline: true },
                    { name: '🏆 Resultado', value: result, inline: false }
                )
                .setFooter({ text: `Jugado por ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [rpsEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('random-number')
            .setDescription('Generar un número aleatorio')
            .addIntegerOption(option =>
                option.setName('minimo')
                    .setDescription('Número mínimo (por defecto: 1)')
                    .setRequired(false))
            .addIntegerOption(option =>
                option.setName('maximo')
                    .setDescription('Número máximo (por defecto: 100)')
                    .setRequired(false)),
        async execute(interaction) {
            const min = interaction.options.getInteger('minimo') || 1;
            const max = interaction.options.getInteger('maximo') || 100;

            if (min >= max) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Error')
                    .setDescription('El número mínimo debe ser menor que el máximo.');
                return interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
            }

            const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

            const numberEmbed = new EmbedBuilder()
                .setColor('#9932CC')
                .setTitle('🎲 Número Aleatorio')
                .setDescription(`**${randomNum}**`)
                .addFields(
                    { name: '📊 Rango', value: `${min} - ${max}`, inline: true }
                )
                .setFooter({ text: `Generado para ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [numberEmbed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('love-calculator')
            .setDescription('Calcular el amor entre dos personas')
            .addUserOption(option =>
                option.setName('persona1')
                    .setDescription('Primera persona')
                    .setRequired(true))
            .addUserOption(option =>
                option.setName('persona2')
                    .setDescription('Segunda persona')
                    .setRequired(false)),
        async execute(interaction) {
            const person1 = interaction.options.getUser('persona1');
            const person2 = interaction.options.getUser('persona2') || interaction.user;

            // Generar un porcentaje "aleatorio" pero consistente basado en los IDs
            const combined = person1.id + person2.id;
            let hash = 0;
            for (let i = 0; i < combined.length; i++) {
                const char = combined.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            const percentage = Math.abs(hash) % 101;

            let message = '';
            let color = '#FF69B4';
            let emoji = '💕';

            if (percentage >= 90) {
                message = '¡Amor verdadero! 💖';
                emoji = '💖';
            } else if (percentage >= 70) {
                message = '¡Una gran pareja! 💕';
                emoji = '💕';
            } else if (percentage >= 50) {
                message = 'Puede funcionar 💛';
                emoji = '💛';
                color = '#FFD700';
            } else if (percentage >= 30) {
                message = 'Tal vez como amigos 💙';
                emoji = '💙';
                color = '#4169E1';
            } else {
                message = 'No está destinado a ser 💔';
                emoji = '💔';
                color = '#800080';
            }

            const loveEmbed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`${emoji} Calculadora del Amor`)
                .setDescription(`**${person1.displayName}** y **${person2.displayName}**`)
                .addFields(
                    { name: '💖 Compatibilidad', value: `**${percentage}%**`, inline: true },
                    { name: '📝 Resultado', value: message, inline: true }
                )
                .setFooter({ text: `Calculado por ${interaction.user.tag} • Solo por diversión!` })
                .setTimestamp();

            await interaction.reply({ embeds: [loveEmbed] });
        },
    },
    {
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Jugar tres en raya contra otro usuario')
        .addUserOption(option =>
            option.setName('oponente')
                .setDescription('Usuario contra el que quieres jugar')
                .setRequired(true)
        ),

    async execute(interaction) {
        const opponent = interaction.options.getUser('oponente');
        const player1 = interaction.user;

        if (opponent.id === player1.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('¡No puedes jugar contra ti mismo!');
            return interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
        }

        if (opponent.bot) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Error')
                .setDescription('¡No puedes jugar contra un bot!');
            return interaction.reply({ embeds: [errorEmbed], flags: [MessageFlags.Ephemeral] });
        }

        if (ticTacToeGames.has(`${player1.id}-${opponent.id}`) || ticTacToeGames.has(`${opponent.id}-${player1.id}`)) {
            return interaction.reply({ content: '¡Ya hay una partida en curso entre ustedes!', flags: [MessageFlags.Ephemeral] });
        }

        const board = ['⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜'];
        const players = { [player1.id]: '❌', [opponent.id]: '⭕' };
        let currentPlayer = player1;

        ticTacToeGames.set(`${player1.id}-${opponent.id}`, { board, players, currentPlayer, message: null });

        function createBoardString(currentBoard) {
            return `${currentBoard[0]}${currentBoard[1]}${currentBoard[2]}\n${currentBoard[3]}${currentBoard[4]}${currentBoard[5]}\n${currentBoard[6]}${currentBoard[7]}${currentBoard[8]}`;
        }

        function checkWinner(currentBoard) {
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];
            for (const [a, b, c] of winPatterns) {
                if (currentBoard[a] !== '⬜' && currentBoard[a] === currentBoard[b] && currentBoard[b] === currentBoard[c]) {
                    return currentBoard[a];
                }
            }
            return currentBoard.includes('⬜') ? null : 'empate';
        }

        function createButtons(currentBoard, player1Id, opponentId, includeCancel = true) {
            const rows = [];
            for (let i = 0; i < 3; i++) {
                const row = new ActionRowBuilder();
                for (let j = 0; j < 3; j++) {
                    const index = i * 3 + j;
                    const cellContent = currentBoard[index];
                    let buttonStyle;
                    if (cellContent === '❌') buttonStyle = ButtonStyle.Danger;
                    else if (cellContent === '⭕') buttonStyle = ButtonStyle.Primary;
                    else buttonStyle = ButtonStyle.Secondary;

                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`ttt_${index}`)
                            .setLabel(cellContent === '⬜' ? ' ' : cellContent)
                            .setStyle(buttonStyle)
                            .setDisabled(cellContent !== '⬜')
                    );
                }
                rows.push(row);
            }

            if (includeCancel) {
                rows.push(
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('ttt_cancel')
                            .setLabel('❌ Cancelar')
                            .setStyle(ButtonStyle.Danger)
                    )
                );
            }

            return rows;
        }

        const initialEmbed = new EmbedBuilder()
            .setColor('#4B0082')
            .setTitle('🎮 Tres en Raya')
            .setDescription(`**${player1.displayName}** (❌) vs **${opponent.displayName}** (⭕)\n\n${createBoardString(board)}\n\nTurno de: **${currentPlayer.displayName}**`)
            .setFooter({ text: 'Haz clic en una casilla para hacer tu movimiento o en ❌ para cancelar' })
            .setTimestamp();

        const message = await interaction.reply({
            embeds: [initialEmbed],
            components: createButtons(board, player1.id, opponent.id),
            fetchReply: true
        });

        ticTacToeGames.get(`${player1.id}-${opponent.id}`).message = message;

        const collector = message.createMessageComponentCollector({
            time: 300000
        });

        collector.on('collect', async (buttonInteraction) => {
            const gameData = ticTacToeGames.get(`${player1.id}-${opponent.id}`);
            if (!gameData) return;

            if (buttonInteraction.customId === 'ttt_cancel') {
                const cancelEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Juego Cancelado')
                    .setDescription(`El juego de tres en raya entre **${player1.displayName}** y **${opponent.displayName}** ha sido cancelado.`)
                    .setTimestamp();

                await buttonInteraction.update({
                    embeds: [cancelEmbed],
                    components: []
                });
                ticTacToeGames.delete(`${player1.id}-${opponent.id}`);
                return collector.stop('cancelled');
            }

            if (buttonInteraction.user.id !== gameData.currentPlayer.id) {
                return buttonInteraction.reply({ content: '¡No es tu turno!', flags: [MessageFlags.Ephemeral] });
            }

            const position = parseInt(buttonInteraction.customId.split('_')[1]);
            if (gameData.board[position] !== '⬜') {
                return buttonInteraction.reply({ content: '¡Esa casilla ya está ocupada!', flags: [MessageFlags.Ephemeral] });
            }

            gameData.board[position] = gameData.players[gameData.currentPlayer.id];
            const winner = checkWinner(gameData.board);
            let gameOver = false;
            let resultMessage = '';

            if (winner === 'empate') {
                resultMessage = '🤝 ¡Empate!';
                gameOver = true;
            } else if (winner) {
                const winnerUser = winner === '❌' ? player1 : opponent;
                resultMessage = `🎉 ¡**${winnerUser.displayName}** ganó!`;
                gameOver = true;
            } else {
                gameData.currentPlayer = gameData.currentPlayer.id === player1.id ? opponent : player1;
            }

            const updatedEmbed = new EmbedBuilder()
                .setColor(gameOver ? '#FFD700' : '#4B0082')
                .setTitle('🎮 Tres en Raya')
                .setDescription(`**${player1.displayName}** (❌) vs **${opponent.displayName}** (⭕)\n\n${createBoardString(gameData.board)}\n\n${gameOver ? resultMessage : `Turno de: **${gameData.currentPlayer.displayName}**`}`)
                .setFooter({ text: gameOver ? 'Juego terminado' : 'Haz clic en una casilla para hacer tu movimiento o en ❌ para cancelar' })
                .setTimestamp();

            if (gameOver) {
                const disabledButtons = createButtons(gameData.board, player1.id, opponent.id, false).map(row =>
                    new ActionRowBuilder().addComponents(row.components.map(btn =>
                        ButtonBuilder.from(btn).setDisabled(true)
                    ))
                );
                await buttonInteraction.update({
                    embeds: [updatedEmbed],
                    components: disabledButtons
                });
                ticTacToeGames.delete(`${player1.id}-${opponent.id}`);
                collector.stop();
            } else {
                await buttonInteraction.update({
                    embeds: [updatedEmbed],
                    components: createButtons(gameData.board, player1.id, opponent.id)
                });
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                const gameData = ticTacToeGames.get(`${player1.id}-${opponent.id}`);
                if (!gameData) return;

                const timeoutEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('⏰ Tiempo Agotado')
                    .setDescription(`El juego de tres en raya entre **${player1.displayName}** y **${opponent.displayName}** ha terminado por inactividad.`)
                    .setTimestamp();

                await gameData.message.edit({
                    embeds: [timeoutEmbed],
                    components: []
                });

                ticTacToeGames.delete(`${player1.id}-${opponent.id}`);
            }
        });
    }
    }
];

module.exports = funCommands;