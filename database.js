const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, 'settings.json');

// Default anti-raid structure
const DEFAULT_ANTIRAID = {
    antiLinks: false,
    antiEveryone: false,
    antiSpam: false,
    maxMentions: 3,
    antiInvites: false,
    autoMod: false
};

// Default welcome structure
const DEFAULT_WELCOME = {
    welcomeEnabled: false,
    welcomeChannel: '',
    welcomeMessage: '¡Bienvenido/a a **{server}**, {user}! 🎉\n\nEsperamos que disfrutes tu estadía aquí. No olvides leer las reglas y presentarte si gustas.',
    welcomeColor: '#00FF00',
    goodbyeEnabled: false,
    goodbyeChannel: '',
    goodbyeMessage: '👋 **{user}** ha dejado **{server}**.\n\nEsperamos verte de nuevo pronto. ¡Que tengas un buen día!',
    goodbyeColor: '#FF6B6B'
};

// Default general structure
const DEFAULT_GENERAL = {
    prefix: '!',
    ownerId: ''
};

function readDatabase() {
    try {
        if (!fs.existsSync(SETTINGS_FILE)) {
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify({}, null, 4), 'utf8');
            return {};
        }
        const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading settings database:', error);
        return {};
    }
}

function writeDatabase(data) {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 4), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing settings database:', error);
        return false;
    }
}

function getGuildSettings(guildId) {
    const db = readDatabase();
    if (!db[guildId]) {
        db[guildId] = {
            welcome: { ...DEFAULT_WELCOME },
            antiraid: { ...DEFAULT_ANTIRAID },
            general: { ...DEFAULT_GENERAL }
        };
        writeDatabase(db);
    }
    // Ensure nested defaults exist
    if (!db[guildId].welcome) db[guildId].welcome = { ...DEFAULT_WELCOME };
    if (!db[guildId].antiraid) db[guildId].antiraid = { ...DEFAULT_ANTIRAID };
    if (!db[guildId].general) db[guildId].general = { ...DEFAULT_GENERAL };
    return db[guildId];
}

function getWelcomeSettings(guildId) {
    return getGuildSettings(guildId).welcome;
}

function saveWelcomeSettings(guildId, welcomeSettings) {
    const db = readDatabase();
    if (!db[guildId]) db[guildId] = {};
    db[guildId].welcome = { ...DEFAULT_WELCOME, ...db[guildId].welcome, ...welcomeSettings };
    return writeDatabase(db);
}

function getAntiRaidSettings(guildId) {
    return getGuildSettings(guildId).antiraid;
}

function saveAntiRaidSettings(guildId, antiraidSettings) {
    const db = readDatabase();
    if (!db[guildId]) db[guildId] = {};
    db[guildId].antiraid = { ...DEFAULT_ANTIRAID, ...db[guildId].antiraid, ...antiraidSettings };
    return writeDatabase(db);
}

function getGeneralSettings(guildId) {
    return getGuildSettings(guildId).general;
}

function saveGeneralSettings(guildId, generalSettings) {
    const db = readDatabase();
    if (!db[guildId]) db[guildId] = {};
    db[guildId].general = { ...DEFAULT_GENERAL, ...db[guildId].general, ...generalSettings };
    return writeDatabase(db);
}

function getAllSettings() {
    return readDatabase();
}

module.exports = {
    getWelcomeSettings,
    saveWelcomeSettings,
    getAntiRaidSettings,
    saveAntiRaidSettings,
    getGeneralSettings,
    saveGeneralSettings,
    getAllSettings,
    getGuildSettings
};
