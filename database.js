const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const dbPath = path.join(__dirname, 'database.sqlite');
const sqlDb = new Database(dbPath);

// Inicializar tablas de SQLite (Economía y Niveles)
function initDatabase() {
    sqlDb.prepare(`
        CREATE TABLE IF NOT EXISTS economy (
            userId TEXT PRIMARY KEY,
            wallet INTEGER DEFAULT 0,
            bank INTEGER DEFAULT 0,
            lastDaily INTEGER DEFAULT 0,
            lastWork INTEGER DEFAULT 0
        )
    `).run();

    sqlDb.prepare(`
        CREATE TABLE IF NOT EXISTS levels (
            userId TEXT,
            guildId TEXT,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 0,
            lastMessage INTEGER DEFAULT 0,
            PRIMARY KEY (userId, guildId)
        )
    `).run();

    console.log('✅ Base de datos (SQLite & JSON) inicializada correctamente.');
}

// ----------------- CONFIGURACIÓN DEL SERVIDOR (JSON) -----------------

const DEFAULT_ANTIRAID = {
    antiLinks: false,
    antiEveryone: false,
    antiSpam: false,
    maxMentions: 3,
    antiInvites: false,
    autoMod: false
};

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

const DEFAULT_GENERAL = {
    prefix: '!',
    ownerId: '',
    xpMin: 15,
    xpMax: 25,
    levelUpMessage: true
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
    
    // Ensure new xp settings exist
    if (db[guildId].general.xpMin === undefined) db[guildId].general.xpMin = DEFAULT_GENERAL.xpMin;
    if (db[guildId].general.xpMax === undefined) db[guildId].general.xpMax = DEFAULT_GENERAL.xpMax;
    if (db[guildId].general.levelUpMessage === undefined) db[guildId].general.levelUpMessage = DEFAULT_GENERAL.levelUpMessage;
    
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

// ----------------- MÉTODOS DE ECONOMÍA (SQLite) -----------------

function getEconomy(userId) {
    let stmt = sqlDb.prepare('SELECT * FROM economy WHERE userId = ?');
    let data = stmt.get(userId);
    if (!data) {
        sqlDb.prepare('INSERT INTO economy (userId, wallet, bank) VALUES (?, 0, 0)').run(userId);
        data = { userId, wallet: 0, bank: 0, lastDaily: 0, lastWork: 0 };
    }
    return data;
}

function updateEconomy(userId, data) {
    const { wallet, bank, lastDaily, lastWork } = data;
    sqlDb.prepare(`
        UPDATE economy 
        SET wallet = ?, bank = ?, lastDaily = ?, lastWork = ?
        WHERE userId = ?
    `).run(wallet, bank, lastDaily || 0, lastWork || 0, userId);
}

function resetEconomy(userId = null) {
    if (userId) {
        sqlDb.prepare('DELETE FROM economy WHERE userId = ?').run(userId);
    } else {
        sqlDb.prepare('DELETE FROM economy').run();
    }
}

// ----------------- MÉTODOS DE NIVELES (SQLite) -----------------

function getLevel(userId, guildId) {
    let stmt = sqlDb.prepare('SELECT * FROM levels WHERE userId = ? AND guildId = ?');
    let data = stmt.get(userId, guildId);
    if (!data) {
        sqlDb.prepare('INSERT INTO levels (userId, guildId, xp, level) VALUES (?, ?, 0, 0)').run(userId, guildId);
        data = { userId, guildId, xp: 0, level: 0, lastMessage: 0 };
    }
    return data;
}

function updateLevel(userId, guildId, xp, level, lastMessage) {
    sqlDb.prepare(`
        UPDATE levels 
        SET xp = ?, level = ?, lastMessage = ?
        WHERE userId = ? AND guildId = ?
    `).run(xp, level, lastMessage, userId, guildId);
}

function getLeaderboard(guildId, limit = 10) {
    return sqlDb.prepare('SELECT * FROM levels WHERE guildId = ? ORDER BY level DESC, xp DESC LIMIT ?').all(guildId, limit);
}

function resetLevels(userId = null, guildId = null) {
    if (userId && guildId) {
        sqlDb.prepare('DELETE FROM levels WHERE userId = ? AND guildId = ?').run(userId, guildId);
    } else if (guildId) {
        sqlDb.prepare('DELETE FROM levels WHERE guildId = ?').run(guildId);
    } else {
        sqlDb.prepare('DELETE FROM levels').run();
    }
}

module.exports = {
    initDatabase,
    // JSON
    getWelcomeSettings,
    saveWelcomeSettings,
    getAntiRaidSettings,
    saveAntiRaidSettings,
    getGeneralSettings,
    saveGeneralSettings,
    getAllSettings,
    getGuildSettings,
    // SQLite Economy
    getEconomy,
    updateEconomy,
    resetEconomy,
    // SQLite Levels
    getLevel,
    updateLevel,
    getLeaderboard,
    resetLevels
};
