let currentLang = "es";

// Landing Translation dictionary
const translations = {
    es: {
        nav_features: "Características",
        nav_commands: "Comandos",
        nav_config: "Configurar Bot",
        nav_contact: "Contacto",
        hero_title: "¡Bienvenido a nuestro Bot de Discord!",
        hero_desc: "Descubre funcionalidades increíbles para moderar y animar tu servidor.",
        btn_invite: "Invitar Bot",
        btn_config: "Configurar Bot",
        btn_view_commands: "Ver Comandos",
        features_title: "Características Principales",
        feat_fun: "Diversión",
        feat_fun_desc: "Comandos para juegos y entretenimiento.",
        feat_mod: "Moderación",
        feat_mod_desc: "Herramientas para mantener el orden en tu servidor.",
        feat_stats: "Estadísticas",
        feat_stats_desc: "Obtén datos y análisis detallados.",
        cmd_title: "Lista de Comandos",
        cmd_all: "Todos",
        cmd_fun: "Diversión",
        cmd_mod: "Moderación",
        cmd_music: "Música",
        cmd_util: "Utilidad",
        cmd_ticket: "Ticket",
        stats_title: "Estadísticas del Bot",
        stats_servers: "Servidores",
        stats_members: "Usuarios",
        stats_channels: "Canales",
        modal_title: "Contacto",
        modal_name: "Nombre:",
        modal_email: "Correo Electrónico:",
        modal_msg: "Mensaje:",
        modal_submit: "Enviar",
        footer_copyright: "© 2026 Bot de Discord - Creado por eldestructor7614. Todos los derechos reservados."
    },
    en: {
        nav_features: "Features",
        nav_commands: "Commands",
        nav_config: "Configure Bot",
        nav_contact: "Contact",
        hero_title: "Welcome to our Discord Bot!",
        hero_desc: "Discover incredible features to moderate and vitalize your server.",
        btn_invite: "Invite Bot",
        btn_config: "Configure Bot",
        btn_view_commands: "View Commands",
        features_title: "Key Features",
        feat_fun: "Entertainment",
        feat_fun_desc: "Fun games, memes, and trivia commands.",
        feat_mod: "Moderation",
        feat_mod_desc: "Tools to keep peace and order in your server.",
        feat_stats: "Statistics",
        feat_stats_desc: "Get technical server info and analysis.",
        cmd_title: "Commands List",
        cmd_all: "All",
        cmd_fun: "Fun",
        cmd_mod: "Moderation",
        cmd_music: "Music",
        cmd_util: "Utility",
        cmd_ticket: "Ticket",
        stats_title: "Bot Statistics",
        stats_servers: "Servers",
        stats_members: "Users",
        stats_channels: "Channels",
        modal_title: "Contact Us",
        modal_name: "Name:",
        modal_email: "Email:",
        modal_msg: "Message:",
        modal_submit: "Send Message",
        footer_copyright: "© 2026 Discord Bot - Created by eldestructor7614. All rights reserved."
    }
};

// Toggle Language function
function toggleLanguage() {
    currentLang = currentLang === "es" ? "en" : "es";
    document.getElementById('lang-toggle-btn').innerText = currentLang === "es" ? "EN" : "ES";
    applyTranslations();
}

function applyTranslations() {
    const dict = translations[currentLang];
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (dict[key]) {
            if (el.tagName === "INPUT" && el.type === "submit") {
                el.value = dict[key];
            } else {
                el.innerText = dict[key];
            }
        }
    });
}

// Theme toggler
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

// Category filter logic
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.getAttribute('data-category');
        document.querySelectorAll('.command-card').forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Modal Dialog logic
const contactBtn = document.getElementById('contactBtn');
const contactModal = document.getElementById('contactModal');
const closeBtn = document.getElementById('closeModalBtn');

if (contactBtn && contactModal) {
    contactBtn.addEventListener('click', () => {
        contactModal.style.display = 'flex';
    });
}

if (closeBtn && contactModal) {
    closeBtn.addEventListener('click', () => {
        contactModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === contactModal) {
        contactModal.style.display = 'none';
    }
});

// Fetch live statistics in the background
function fetchLandingStats() {
    fetch('/api/status')
        .then(res => res.json())
        .then(data => {
            const serversEl = document.getElementById('stats-servers');
            const membersEl = document.getElementById('stats-members');
            if (serversEl) serversEl.innerText = data.guilds + '+';
            if (membersEl) membersEl.innerText = data.users + '+';
        })
        .catch(err => console.error(err));
}

// Initializing
window.addEventListener('DOMContentLoaded', () => {
    // Theme loading
    const storedTheme = localStorage.getItem('theme') || 'dark';
    if (storedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('theme-icon').className = 'fa-solid fa-sun';
    }

    fetchLandingStats();
});
