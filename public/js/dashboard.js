let currentGuildId = "";
let currentLang = "es";
let serverMembers = [];
let selectedModAction = "";
let selectedModUserId = "";

// Translation Dictionary
const translations = {
    es: {
        page_title: "Panel de Configuración del Bot",
        btn_back: " Volver a la web",
        stat_status: "Estado del Bot",
        stat_servers: "Servidores",
        stat_members: "Miembros Totales",
        stat_latency: "Ping Latencia",
        select_server: "Seleccionar Servidor",
        loading_servers: "Cargando servidores...",
        categories: "Categorías",
        tab_welcome: "Bienvenidas & Despedidas",
        tab_antiraid: "Sistema AntiRaid",
        tab_general: "Ajustes Generales",
        tab_commands: "Comandos",
        tab_moderation: "Moderación",
        welcome_title: "🎉 Bienvenidas y Despedidas",
        welcome_desc: "Personaliza el canal y los mensajes embed de bienvenida y salida del servidor.",
        welcome_h3: "Mensaje de Bienvenida",
        welcome_active: "Activar Bienvenida",
        welcome_active_desc: "Habilita los mensajes embed cuando un miembro se une al servidor.",
        welcome_channel: "Canal de Bienvenida",
        select_channel: "Selecciona un canal...",
        welcome_message: "Mensaje Personalizado",
        variables_desc: "Puedes usar variables: {user} para mencionar al usuario, {server} para el nombre del servidor.",
        embed_color: "Color del Embed",
        goodbye_h3: "Mensaje de Despedida",
        goodbye_active: "Activar Despedida",
        goodbye_active_desc: "Habilita los mensajes embed cuando un miembro deja el servidor.",
        goodbye_channel: "Canal de Despedida",
        goodbye_message: "Mensaje Personalizado",
        btn_save_welcome: "Guardar Bienvenidas",
        antiraid_title: "🛡️ Sistema de Protección AntiRaid",
        antiraid_desc: "Protege tu servidor de spam masivo, invitaciones publicitarias y raids maliciosos en tiempo real.",
        ar_links: " Bloquear Enlaces (Anti-Links)",
        ar_links_desc: "Elimina automáticamente cualquier enlace enviado por usuarios normales.",
        ar_everyone: " Bloquear @everyone / @here",
        ar_everyone_desc: "Evita menciones masivas a todos los usuarios del servidor.",
        ar_spam: " Protección Anti-Spam",
        ar_spam_desc: "Detecta y bloquea mensajes repetitivos en un corto período de tiempo.",
        ar_invites: " Bloquear Invitaciones (Anti-Invites)",
        ar_invites_desc: "Elimina automáticamente invitaciones a otros servidores de Discord.",
        ar_automod: " Auto-Moderación Activa",
        ar_automod_desc: "Permite al bot silenciar o expulsar a infractores recurrentes automáticamente.",
        ar_mentions: "Mapeo Máximo de Menciones",
        ar_mentions_desc: "Cantidad máxima de menciones permitidas en un solo mensaje antes de actuar (1-10).",
        btn_save_antiraid: "Guardar AntiRaid",
        general_title: "⚙️ Ajustes Generales del Bot",
        general_desc: "Configura los parámetros globales de funcionamiento de tu bot en este servidor.",
        general_prefix: "Prefijo del Bot",
        general_prefix_desc: "El prefijo utilizado para los comandos de texto normales del bot (por defecto es !).",
        general_owner: "ID del Propietario",
        general_owner_desc: "ID numérica de Discord del dueño del bot para permitir la ejecución de comandos especiales.",
        btn_save_general: "Guardar Ajustes",
        commands_title: "📚 Directorio de Comandos del Bot",
        commands_desc: "Navega y comprende las instrucciones y sintaxis de todos los comandos de barra diagonal.",
        cmd_cat_all: "Todos",
        cmd_cat_mod: "Moderación",
        cmd_cat_music: "Música",
        cmd_cat_fun: "Diversión",
        cmd_cat_tickets: "Tickets",
        cmd_cat_util: "Utilidad",
        mod_title: "🛡️ Moderación de Miembros",
        mod_desc: "Busca a cualquier miembro del servidor y ejecuta acciones disciplinarias en tiempo real.",
        mod_search: "Buscar Miembro",
        toast_saved: "Configuraciones guardadas exitosamente",
        toast_error: "Ocurrió un error al guardar.",
        toast_conn_error: "Error de conexión al guardar."
    },
    en: {
        page_title: "Bot Configuration Panel",
        btn_back: " Back to site",
        stat_status: "Bot Status",
        stat_servers: "Servers Count",
        stat_members: "Total Members",
        stat_latency: "Ping Latency",
        select_server: "Select Server",
        loading_servers: "Loading servers...",
        categories: "Categories",
        tab_welcome: "Welcome & Goodbye",
        tab_antiraid: "AntiRaid Protection",
        tab_general: "General Settings",
        tab_commands: "Commands list",
        tab_moderation: "Moderation",
        welcome_title: "🎉 Welcome & Goodbye System",
        welcome_desc: "Customize the channel and rich embed message for members entering or leaving the server.",
        welcome_h3: "Welcome Message",
        welcome_active: "Enable Welcome Messages",
        welcome_active_desc: "Post a custom embed message when a new member joins.",
        welcome_channel: "Welcome Destination Channel",
        select_channel: "Select a channel...",
        welcome_message: "Custom Welcome Body",
        variables_desc: "Variables supported: {user} to mention the user, {server} for the server's name.",
        embed_color: "Embed Accent Color",
        goodbye_h3: "Goodbye Message",
        goodbye_active: "Enable Goodbye Messages",
        goodbye_active_desc: "Post a custom embed message when a member leaves the server.",
        goodbye_channel: "Goodbye Destination Channel",
        goodbye_message: "Custom Goodbye Body",
        btn_save_welcome: "Save Welcome Settings",
        antiraid_title: "🛡️ Anti-Raid Shield System",
        antiraid_desc: "Protect your server from massive spam, invite link advertising, and toxic raids in real-time.",
        ar_links: " Anti-Links Shield",
        ar_links_desc: "Automatically remove messages containing web links from standard members.",
        ar_everyone: " Block @everyone / @here",
        ar_everyone_desc: "Prevent unauthorized mass mentions to all server members.",
        ar_spam: " Anti-Spam Guard",
        ar_spam_desc: "Detect and auto-delete rapid repetitive messages from a single user.",
        ar_invites: " Block Invite Links",
        ar_invites_desc: "Delete messages containing invite links to other Discord servers.",
        ar_automod: " Active Auto-Moderation",
        ar_automod_desc: "Let the bot mute or kick recurring rule breakers automatically.",
        ar_mentions: "Max Allowed Mentions",
        ar_mentions_desc: "The maximum number of user mentions in one message before bot takes action (1-10).",
        btn_save_antiraid: "Save AntiRaid Settings",
        general_title: "⚙️ General Bot Settings",
        general_desc: "Set the global parameters of operation for your bot in this Discord server.",
        general_prefix: "Bot Command Prefix",
        general_prefix_desc: "The prefix utilized for standard text commands (defaults to !).",
        general_owner: "Owner User Discord ID",
        general_owner_desc: "The developer's numerical Discord ID to authorize execution of owner-only commands.",
        btn_save_general: "Save General Settings",
        commands_title: "📚 Bot Commands Directory",
        commands_desc: "Browse and understand parameters, usage guidelines, and listings of slash commands.",
        cmd_cat_all: "All",
        cmd_cat_mod: "Moderation",
        cmd_cat_music: "Music",
        cmd_cat_fun: "Fun",
        cmd_cat_tickets: "Tickets",
        cmd_cat_util: "Utility",
        mod_title: "🛡️ Member Moderation",
        mod_desc: "Search for any server member and execute disciplinary actions in real-time.",
        mod_search: "Search Member",
        toast_saved: "Settings successfully saved",
        toast_error: "An error occurred while saving.",
        toast_conn_error: "Connection failure while saving."
    }
};

const commandData = [
    // Moderation
    { name: "kick", cat: "moderation", desc_es: "Expulsar a un miembro del servidor.", desc_en: "Kick a member from the server.", usage: "/kick <usuario> [razon]" },
    { name: "ban", cat: "moderation", desc_es: "Banear a un miembro permanentemente.", desc_en: "Ban a member permanently.", usage: "/ban <usuario> [razon]" },
    { name: "warn", cat: "moderation", desc_es: "Dar una advertencia formal a un usuario.", desc_en: "Issue a formal warning to a user.", usage: "/warn <usuario> <razon>" },
    { name: "lockdown", cat: "moderation", desc_es: "Bloquea los canales para prevenir una raid.", desc_en: "Lockdown all channels to prevent a raid.", usage: "/lockdown <duracion>" },
    
    // Music
    { name: "play", cat: "music", desc_es: "Reproduce una canción de YouTube en tu canal de voz.", desc_en: "Play a song from YouTube in your voice channel.", usage: "/play <cancion>" },
    { name: "skip", cat: "music", desc_es: "Salta la canción actual en reproducción.", desc_en: "Skip the current playing song.", usage: "/skip" },
    { name: "stop", cat: "music", desc_es: "Detiene la música y saca al bot del canal.", desc_en: "Stop music and disconnect the bot from voice.", usage: "/stop" },
    { name: "pause", cat: "music", desc_es: "Pausa el reproductor de audio.", desc_en: "Pause the music player.", usage: "/pause" },
    { name: "resume", cat: "music", desc_es: "Reanuda la canción pausada.", desc_en: "Resume the paused song.", usage: "/resume" },
    { name: "queue", cat: "music", desc_es: "Ver la lista de canciones en cola.", desc_en: "View current song queue list.", usage: "/queue" },
    { name: "volume", cat: "music", desc_es: "Ajustar volumen (1-100).", desc_en: "Adjust volume level (1-100).", usage: "/volume <nivel>" },

    // Fun
    { name: "meme", cat: "fun", desc_es: "Muestra un meme aleatorio divertido.", desc_en: "Display a random funny meme.", usage: "/meme" },
    { name: "joke", cat: "fun", desc_es: "Cuenta un chiste gracioso.", desc_en: "Tell a funny joke.", usage: "/joke" },
    { name: "coinflip", cat: "fun", desc_es: "Lanzar una moneda al aire (cara o cruz).", desc_en: "Flip a coin (heads or tails).", usage: "/coinflip" },
    
    // Tickets
    { name: "ticket-panel", cat: "tickets", desc_es: "Crea el panel para tickets de soporte.", desc_en: "Create the support ticket dashboard panel.", usage: "/ticket-panel" },
    { name: "close-ticket", cat: "tickets", desc_es: "Cierra el canal de ticket de soporte actual.", desc_en: "Close the current support ticket channel.", usage: "/close-ticket" },

    // Utility
    { name: "ping", cat: "utility", desc_es: "Muestra la latencia del bot y de la API.", desc_en: "Show the bot's and API's latency.", usage: "/ping" },
    { name: "serverinfo", cat: "utility", desc_es: "Muestra detalles técnicos del servidor.", desc_en: "Show details of this server.", usage: "/serverinfo" }
];

// Language toggle
function toggleLanguage() {
    currentLang = currentLang === "es" ? "en" : "es";
    document.getElementById('lang-toggle-btn').innerText = currentLang === "es" ? "EN" : "ES";
    applyTranslations();
    renderCommands();
    renderMembersList();
}

function applyTranslations() {
    const dict = translations[currentLang];
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (dict[key]) {
            const icon = el.querySelector('i');
            if (icon) {
                el.innerHTML = "";
                el.appendChild(icon);
                el.innerHTML += " " + dict[key];
            } else {
                el.innerText = dict[key];
            }
        }
    });
}

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        icon.className = 'fa-solid fa-moon';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-theme');
        icon.className = 'fa-solid fa-sun';
        localStorage.setItem('theme', 'light');
    }
}

// Tab Switching
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
    
    if (tabId === 'moderation-panel') {
        fetchMembers(currentGuildId);
    }
}

// Command Explorer render
let activeCategory = "all";
function filterCommands(category, btn) {
    document.querySelectorAll('.category-pill').forEach(pill => pill.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = category;
    renderCommands();
}

function renderCommands() {
    const container = document.getElementById('commands-list');
    container.innerHTML = "";
    
    const filtered = commandData.filter(cmd => activeCategory === "all" || cmd.cat === activeCategory);
    
    filtered.forEach(cmd => {
        const item = document.createElement('div');
        item.className = "command-item";
        
        const desc = currentLang === "es" ? cmd.desc_es : cmd.desc_en;
        
        item.innerHTML = `
            <h4><i class="fa-solid fa-square-terminal"></i> ${cmd.name}</h4>
            <p>${desc}</p>
            <div class="command-meta">${cmd.usage}</div>
        `;
        container.appendChild(item);
    });
}

// Fetch Guild Members
function fetchMembers(guildId) {
    if (!guildId) return;
    const container = document.getElementById('members-list-container');
    container.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">${currentLang === 'es' ? 'Cargando miembros del servidor...' : 'Loading server members...'}</div>`;
    
    fetch(`/api/members?guildId=${guildId}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                container.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--danger);">${data.error}</div>`;
                return;
            }
            serverMembers = data;
            renderMembersList();
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--danger);">${currentLang === 'es' ? 'Error al conectar con la API' : 'API Connection Error'}</div>`;
        });
}

function renderMembersList() {
    const container = document.getElementById('members-list-container');
    container.innerHTML = "";
    
    const searchVal = document.getElementById('member-search-input').value.toLowerCase();
    const filtered = serverMembers.filter(m => 
        m.username.toLowerCase().includes(searchVal) || 
        m.nickname.toLowerCase().includes(searchVal) || 
        m.id.includes(searchVal)
    );

    if (filtered.length === 0) {
        container.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">${currentLang === 'es' ? 'No se encontraron miembros' : 'No members found'}</div>`;
        return;
    }

    filtered.forEach(m => {
        const row = document.createElement('div');
        row.className = "member-row";
        
        const rolesHTML = m.roles.slice(0, 3).map(r => `
            <span class="role-badge" style="border-color: ${r.color}; color: ${r.color || 'var(--text-main)'}">${r.name}</span>
        `).join('');

        const displayName = m.nickname ? `${m.nickname} (${m.username})` : m.username;

        row.innerHTML = `
            <div class="member-left">
                <img src="${m.avatar}" class="member-avatar" alt="Avatar">
                <div class="member-info">
                    <h4>${displayName}</h4>
                    <p>ID: ${m.id} • ${currentLang === 'es' ? 'Unido:' : 'Joined:'} ${new Date(m.joinedAt).toLocaleDateString()}</p>
                    <div class="member-roles">${rolesHTML} ${m.roles.length > 3 ? '<span class="role-badge">...</span>' : ''}</div>
                </div>
            </div>
            <div class="member-actions">
                <button class="mod-btn warn-btn" onclick="openModerationModal('warn', '${m.id}', '${m.username}')">
                    <i class="fa-solid fa-triangle-exclamation"></i> ${currentLang === 'es' ? 'Advertir' : 'Warn'}
                </button>
                <button class="mod-btn kick-btn" onclick="openModerationModal('kick', '${m.id}', '${m.username}')">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i> ${currentLang === 'es' ? 'Expulsar' : 'Kick'}
                </button>
                <button class="mod-btn ban-btn" onclick="openModerationModal('ban', '${m.id}', '${m.username}')">
                    <i class="fa-solid fa-ban"></i> ${currentLang === 'es' ? 'Banear' : 'Ban'}
                </button>
            </div>
        `;
        container.appendChild(row);
    });
}

function filterMembersList() {
    renderMembersList();
}

// Moderation Modal Controls
function openModerationModal(action, userId, username) {
    selectedModAction = action;
    selectedModUserId = userId;
    
    let title = "";
    let desc = "";
    
    if (action === 'warn') {
        title = currentLang === 'es' ? `Advertir a ${username}` : `Warn ${username}`;
        desc = currentLang === 'es' ? `Envía una advertencia a este miembro.` : `Sends a warning DM message to this member.`;
    } else if (action === 'kick') {
        title = currentLang === 'es' ? `Expulsar a ${username}` : `Kick ${username}`;
        desc = currentLang === 'es' ? `Expulsa a este usuario de tu servidor.` : `Removes this member from your Discord server.`;
    } else if (action === 'ban') {
        title = currentLang === 'es' ? `Banear a ${username}` : `Ban ${username}`;
        desc = currentLang === 'es' ? `Banea a este usuario de forma permanente.` : `Bans this member permanently from your server.`;
    }

    document.getElementById('mod-modal-title').innerText = title;
    document.getElementById('mod-modal-desc').innerText = desc;
    document.getElementById('mod-modal-reason').value = "";
    document.getElementById('moderation-modal').style.display = "flex";
}

function closeModerationModal() {
    document.getElementById('moderation-modal').style.display = "none";
}

function executeModerationAction() {
    const reason = document.getElementById('mod-modal-reason').value;
    
    fetch('/api/moderation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            guildId: currentGuildId,
            action: selectedModAction,
            userId: selectedModUserId,
            reason: reason
        })
    })
    .then(res => res.json())
    .then(data => {
        closeModerationModal();
        if (data.success) {
            showToast(data.message);
            // Refresh list if it was a kick or ban
            if (selectedModAction !== 'warn') {
                fetchMembers(currentGuildId);
            }
        } else {
            showToast(data.error || (currentLang === 'es' ? 'Error al moderar' : 'Moderation error'), true);
        }
    })
    .catch(err => {
        console.error(err);
        closeModerationModal();
        showToast(currentLang === 'es' ? 'Error de conexión' : 'Connection error', true);
    });
}

// Load Status
function fetchStatus() {
    fetch('/api/status')
        .then(res => res.json())
        .then(data => {
            document.getElementById('bot-status').innerText = data.status === 'online' ? (currentLang === 'es' ? 'Online' : 'Online') : (currentLang === 'es' ? 'Offline' : 'Offline');
            if (data.status === 'online') {
                document.getElementById('status-card').classList.add('online');
            } else {
                document.getElementById('status-card').classList.remove('online');
            }
            document.getElementById('bot-guilds').innerText = data.guilds;
            document.getElementById('bot-users').innerText = data.users;
            document.getElementById('bot-ping').innerText = data.ping + ' ms';
        })
        .catch(err => console.error('Error fetching bot status:', err));
}

// Load Guilds
function fetchGuilds() {
    fetch('/api/guilds')
        .then(res => res.json())
        .then(guilds => {
            const select = document.getElementById('guild-select');
            select.innerHTML = "";
            if (guilds.length === 0) {
                select.innerHTML = `<option value="" disabled>${translations[currentLang].loading_servers}</option>`;
                return;
            }
            guilds.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g.id;
                opt.innerText = g.name;
                select.appendChild(opt);
            });
            
            // Select first guild by default
            currentGuildId = guilds[0].id;
            fetchSettings(currentGuildId);
            fetchChannels(currentGuildId);
            
            // Fetch members if active tab is moderation
            const activeTab = document.querySelector('.tab-content.active');
            if (activeTab && activeTab.id === 'moderation-panel') {
                fetchMembers(currentGuildId);
            }
        })
        .catch(err => console.error('Error fetching guilds:', err));
}

// Fetch Channels
function fetchChannels(guildId) {
    fetch(`/api/channels?guildId=${guildId}`)
        .then(res => res.json())
        .then(channels => {
            const welcomeSelect = document.getElementById('welcome-channel');
            const goodbyeSelect = document.getElementById('goodbye-channel');
            
            // Save previous values
            const prevWelcome = welcomeSelect.value;
            const prevGoodbye = goodbyeSelect.value;
            
            welcomeSelect.innerHTML = `<option value="">${translations[currentLang].select_channel}</option>`;
            goodbyeSelect.innerHTML = `<option value="">${translations[currentLang].select_channel}</option>`;
            
            channels.forEach(ch => {
                const wOpt = document.createElement('option');
                wOpt.value = ch.id;
                wOpt.innerText = '#' + ch.name;
                welcomeSelect.appendChild(wOpt);

                const gOpt = document.createElement('option');
                gOpt.value = ch.id;
                gOpt.innerText = '#' + ch.name;
                goodbyeSelect.appendChild(gOpt);
            });
            
            // Restore selection if exists
            welcomeSelect.value = prevWelcome;
            goodbyeSelect.value = prevGoodbye;
        })
        .catch(err => console.error('Error fetching channels:', err));
}

// Fetch Guild Settings
function fetchSettings(guildId) {
    if (!guildId) return;
    fetch(`/api/settings?guildId=${guildId}`)
        .then(res => res.json())
        .then(data => {
            const w = data.welcome || {};
            const ar = data.antiraid || {};
            const g = data.general || {};
            
            // Welcome fields
            document.getElementById('welcome-enabled').checked = w.welcomeEnabled || false;
            document.getElementById('welcome-channel').value = w.welcomeChannel || "";
            document.getElementById('welcome-message').value = w.welcomeMessage || "";
            document.getElementById('welcome-color').value = w.welcomeColor || "#00ff00";
            document.getElementById('welcome-color-hex').innerText = w.welcomeColor || "#00ff00";

            // Goodbye fields
            document.getElementById('goodbye-enabled').checked = w.goodbyeEnabled || false;
            document.getElementById('goodbye-channel').value = w.goodbyeChannel || "";
            document.getElementById('goodbye-message').value = w.goodbyeMessage || "";
            document.getElementById('goodbye-color').value = w.goodbyeColor || "#ff6b6b";
            document.getElementById('goodbye-color-hex').innerText = w.goodbyeColor || "#ff6b6b";

            // AntiRaid fields
            document.getElementById('antiraid-links').checked = ar.antiLinks || false;
            document.getElementById('antiraid-everyone').checked = ar.antiEveryone || false;
            document.getElementById('antiraid-spam').checked = ar.antiSpam || false;
            document.getElementById('antiraid-invites').checked = ar.antiInvites || false;
            document.getElementById('antiraid-automod').checked = ar.autoMod || false;
            document.getElementById('antiraid-mentions').value = ar.maxMentions || 3;

            // General fields
            document.getElementById('general-prefix').value = g.prefix || "!";
            document.getElementById('general-owner').value = g.ownerId || "";
        })
        .catch(err => console.error('Error loading settings:', err));
}

// Save settings to API
function saveSettings() {
    if (!currentGuildId) {
        showToast(currentLang === 'es' ? "Por favor selecciona un servidor primero." : "Please select a server first.", true);
        return;
    }

    const bodyData = {
        guildId: currentGuildId,
        welcome: {
            welcomeEnabled: document.getElementById('welcome-enabled').checked,
            welcomeChannel: document.getElementById('welcome-channel').value,
            welcomeMessage: document.getElementById('welcome-message').value,
            welcomeColor: document.getElementById('welcome-color').value,
            goodbyeEnabled: document.getElementById('goodbye-enabled').checked,
            goodbyeChannel: document.getElementById('goodbye-channel').value,
            goodbyeMessage: document.getElementById('goodbye-message').value,
            goodbyeColor: document.getElementById('goodbye-color').value
        },
        antiraid: {
            antiLinks: document.getElementById('antiraid-links').checked,
            antiEveryone: document.getElementById('antiraid-everyone').checked,
            antiSpam: document.getElementById('antiraid-spam').checked,
            antiInvites: document.getElementById('antiraid-invites').checked,
            autoMod: document.getElementById('antiraid-automod').checked,
            maxMentions: parseInt(document.getElementById('antiraid-mentions').value) || 3
        },
        general: {
            prefix: document.getElementById('general-prefix').value || "!",
            ownerId: document.getElementById('general-owner').value || ""
        }
    };

    fetch('/api/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast(translations[currentLang].toast_saved);
        } else {
            showToast(translations[currentLang].toast_error, true);
        }
    })
    .catch(err => {
        console.error(err);
        showToast(translations[currentLang].toast_conn_error, true);
    });
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('i');
    
    toast.querySelector('span').innerText = message;
    
    if (isError) {
        toast.style.background = 'rgba(237, 66, 69, 0.9)';
        toast.style.color = '#ffffff';
        icon.className = 'fa-solid fa-circle-exclamation';
    } else {
        toast.style.background = 'rgba(87, 242, 135, 0.9)';
        toast.style.color = '#0f172a';
        icon.className = 'fa-solid fa-circle-check';
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Bind event listeners
document.getElementById('guild-select').addEventListener('change', function(e) {
    currentGuildId = e.target.value;
    fetchChannels(currentGuildId);
    fetchSettings(currentGuildId);
    
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab && activeTab.id === 'moderation-panel') {
        fetchMembers(currentGuildId);
    }
});

document.getElementById('welcome-color').addEventListener('input', function(e) {
    document.getElementById('welcome-color-hex').innerText = e.target.value;
});
document.getElementById('goodbye-color').addEventListener('input', function(e) {
    document.getElementById('goodbye-color-hex').innerText = e.target.value;
});

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Apply stored theme preference
    const storedTheme = localStorage.getItem('theme') || 'dark';
    if (storedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('theme-icon').className = 'fa-solid fa-sun';
    }

    fetchStatus();
    fetchGuilds();
    renderCommands();
    
    // Refresh status periodically
    setInterval(fetchStatus, 15000);
});
