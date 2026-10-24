// ================= KONSTANTA =================
const PLAYER_TEAM = 'blue';
const INITIAL_LIVES = 3;
const MAX_LIVES = 5;
const W = 22, H = 28, RADIUS = 9, MASS = 15;
const MAX_FUEL = 100, UNLOCK = 30, MAX_HULL = 100;
const FRICTION = 0.985, ANG_FRICTION = 0.93;
const MAX_METEORS = 25;
const BULLET_DAMAGE = 15;
const BULLET_LIFE = 120;
const BULLET_MASS = 2;
const METEOR_MAX_SPEED = 5;
const METEOR_TYPES = [
    { r: 5, hp: 20 },
    { r: 8, hp: 60 },
    { r: 12, hp: 120 },
];
const PICKUP_MAX = 8;
const PICKUP_DROP_CHANCE = 0.18;   // peluang musuh menjatuhkan pickup saat hancur (15-20%)
const PICKUP_SPAWN_CHANCE = 0.005;   // peluang per frame pickup acak muncul di peta (~1 tiap 3,3 dtk)
const RANDOM_PICKUP_TYPES = ['life', 'mag', 'health', 'homing', 'laser'];   // siapa pun (player/bot/ally) bisa mengambil
const DROP_PITY = 4;              // drop terjamin setelah N kill musuh tanpa drop
const METEOR_DROP_CHANCE = { 5: 0.03, 8: 0.06, 12: 0.12 };   // per radius meteor; hanya health/mag (anti-farming senjata)
const SUPPLY_COOLDOWN = 20000;     // jeda supply darurat (ms)
const SUPPLY_HULL = 0.35;          // supply health bila hull di bawah ini
const DROP_WEIGHTS = { health: 25, mag: 20, laser: 17, homing: 17, multi: 15, life: 6 };
const PICKUP_RADIUS = 8;
const PICKUP_SEEK = 900;
const HEAL_AMOUNT = 30;
const MAG_AMOUNT = 1;
const WEAPON_DURATION = 9000;
const WEAPON_STACK_MAX = 3;       // durasi power-up maks = 3x WEAPON_DURATION
const WEAPON_KEYS = { laser: 'laserUntil', homing: 'homingUntil', multi: 'multiUntil' };
const SPREAD_ANGLES = [-10, 0, 10];
const SHIELD_DURATION = 5000;
const SHIELD_COOLDOWN = 15000;
const AVOID_METEOR = 90;
const AVOID_SHIP = 70;

const LASER_RANGE = 650;       // jarak maks beam (px)
const LASER_TICK = 100;        // interval damage (ms)
const LASER_TICK_DAMAGE = 4;   // ~40 dps
const BOT_LASER_FACTOR = 0.5;  // damage laser bot = 50% dari player
const LASER_WARMUP = 400;      // pemanasan laser bot: garis peringatan sebelum beam penuh (ms)

const STEP = 1000 / 60;        // fixed timestep: fisika selalu 60 Hz
const SCORE_BY_TYPE = { scout: 100, standard: 150, heavy: 300, sniper: 200, kamikaze: 120, summoner: 350 };
const WAVE_BONUS = 250;        // x nomor wave
const BEST_KEY = 'ssmb_best_score';
const COMBO_WINDOW = 3000;     // kill berikutnya harus terjadi dalam jendela ini (ms)
const COMBO_MAX = 5;           // pengali maksimum
const COMBO_COLORS = ['#fef9c3', '#fde047', '#fb923c', '#f87171', '#e879f9'];

// --- flare & peringatan misil ---
const FLARE_COOLDOWN = 8000;       // player (ms)
const BOT_FLARE_COOLDOWN = 10000;  // bot (ms)
const FLARE_LIFE = 150;            // frame (~2,5 dtk)
const FLARE_HITS = 2;              // jumlah misil yang diserap tiap flare
const FLARE_LURE = 450;            // jarak flare menarik misil (px)
const MISSILE_WARMUP = 300;        // bot: glow peringatan sebelum rentetan misil (ms)

// --- shield bot (heavy) ---
const HEAVY_SHIELD_HP = 0.4;       // aktif saat hull < 40%
const HEAVY_SHIELD_DURATION = 2000;
const HEAVY_SHIELD_COOLDOWN = 12000;

// --- musuh spesialis ---
const SNIPER_RANGE = 900, SNIPER_CHARGE = 900, SNIPER_COOLDOWN = 3200, SNIPER_DAMAGE = 30;
const KAMIKAZE_DAMAGE = 35;
const SUMMON_CHARGE = 800, SUMMON_INTERVAL = 11000, SUMMON_MAX_ENEMIES = 10;

// --- ally spesialis (backup sesuai kebutuhan) ---
const SUPPORT_LIFETIME = 30000;    // ally spesialis pergi setelah 30 dtk
const MEDIC_HEAL = 6, MEDIC_RANGE = 260, MEDIC_TICK = 1000;
const GUARDIAN_SHIELD = 3000, GUARDIAN_INTERVAL = 10000;
const INTERCEPT_RANGE = 380, INTERCEPT_TICK = 300;
const SUPPORT_ROLES = { medic: 1, interceptor: 1, guardian: 1 };
const FOLLOW_LEASH = { medic: 240, guardian: 240, interceptor: 320 };
const ROLE_BAND = { sniper: [420, 650], summoner: [450, 750] };
const LOADOUT_TYPES = { scout: 1, standard: 1, heavy: 1 };   // hanya ini yang dapat laser/missile acak
const BACKUP_LABEL = {
    medic: 'MEDIC: PERBAIKAN HULL', interceptor: 'INTERCEPTOR: ANTI-MISIL', guardian: 'GUARDIAN: PERISAI',
    scout: 'BACKUP: SCOUT', standard: 'BACKUP: STANDARD', heavy: 'BACKUP: HEAVY',
};
const PICKUP_LABEL = { health: '+HULL', mag: '+MAG', life: '+NYAWA', laser: 'LASER', homing: 'MISSILE', multi: 'SPREAD' };

// --- spawn bertahap ---
const WAVE_GROUP_DELAY = 4500;     // jeda antar grup musuh (ms)

const TEAMS = {
    blue: { body: '#3B82F6', cockpit: '#93C5FD', rcs: '#38BDF8', glow: '59,130,246', bullet: '#22d3ee' },
    red: { body: '#EF4444', cockpit: '#FCA5A5', rcs: '#EF4444', glow: '239,68,68', bullet: '#f87171' },
};

const BOT_TYPES = {
    scout: { body: '#F43F5E', cockpit: '#FECDD3', rcs: '#FB7185', glow: '244,63,94', bullet: '#fb7185', hp: 60, radius: 8, turn: 0.3, main: 0.18, rev: 0.12, magSize: 8 },
    standard: { body: '#EF4444', cockpit: '#FCA5A5', rcs: '#EF4444', glow: '239,68,68', bullet: '#f87171', hp: 100, radius: 10, turn: 0.2, main: 0.12, rev: 0.1, magSize: 6 },
    heavy: { body: '#991B1B', cockpit: '#F87171', rcs: '#DC2626', glow: '153,27,27', bullet: '#ef4444', hp: 200, radius: 14, turn: 0.12, main: 0.08, rev: 0.06, magSize: 12 },
    // --- musuh spesialis ---
    sniper:   { body: '#E879F9', cockpit: '#FAE8FF', rcs: '#C026D3', glow: '232,121,249', bullet: '#f0abfc', hp: 70,  radius: 9,  turn: 0.18, main: 0.08, rev: 0.08, magSize: 4 },
    kamikaze: { body: '#FB923C', cockpit: '#FFEDD5', rcs: '#EA580C', glow: '251,146,60',  bullet: '#fdba74', hp: 35,  radius: 8,  turn: 0.4,  main: 0.22, rev: 0.1,  magSize: 1, mainUse: 0.08 },
    summoner: { body: '#A855F7', cockpit: '#F3E8FF', rcs: '#7E22CE', glow: '168,85,247',  bullet: '#c084fc', hp: 180, radius: 14, turn: 0.08, main: 0.05, rev: 0.04, magSize: 8 },
    // --- ally spesialis (warna dari ALLY_BOT_COLORS) ---
    medic:       { body: '#2DD4BF', cockpit: '#FFFFFF', rcs: '#14B8A6', glow: '45,212,191', bullet: '#5eead4', hp: 90,  radius: 10, turn: 0.25, main: 0.14, rev: 0.1,  magSize: 6 },
    interceptor: { body: '#22D3EE', cockpit: '#CFFAFE', rcs: '#06B6D4', glow: '34,211,238', bullet: '#67e8f9', hp: 70,  radius: 8,  turn: 0.3,  main: 0.18, rev: 0.12, magSize: 8 },
    guardian:    { body: '#6366F1', cockpit: '#C7D2FE', rcs: '#4F46E5', glow: '99,102,241', bullet: '#818cf8', hp: 240, radius: 14, turn: 0.12, main: 0.08, rev: 0.06, magSize: 10 },
};

const ALLY_BOT_COLORS = {
    scout: { body: '#38BDF8', cockpit: '#BAE6FD', rcs: '#0284C7', glow: '56,189,248', bullet: '#38bdf8' },
    standard: { body: '#3B82F6', cockpit: '#93C5FD', rcs: '#38BDF8', glow: '59,130,246', bullet: '#22d3ee' },
    heavy: { body: '#1D4ED8', cockpit: '#93C5FD', rcs: '#2563EB', glow: '29,78,216', bullet: '#60a5fa' },
    medic:       { body: '#2DD4BF', cockpit: '#FFFFFF', rcs: '#14B8A6', glow: '45,212,191', bullet: '#5eead4' },
    interceptor: { body: '#22D3EE', cockpit: '#CFFAFE', rcs: '#06B6D4', glow: '34,211,238', bullet: '#67e8f9' },
    guardian:    { body: '#6366F1', cockpit: '#C7D2FE', rcs: '#4F46E5', glow: '99,102,241', bullet: '#818cf8' },
};

const STATS = {
    player: { turn: 0.38, main: 0.25, rev: 0.1, rcsUse: 0, mainUse: 0, mainRegen: 1, cooldown: 120, wallDamage: true, magSize: 100, startMags: 2, maxMags: 5, reload: 1500 },
};

// Bentuk kapal: berubah sesuai spesialisasi (body, sayap tambahan, kokpit; viewBox 40x48, hidung di atas)
const SHAPES = {
    base:        { body: 'M20 6 L36 42 L20 36 L4 42 Z', cockpit: 'M20 12 L25 26 L20 23 L15 26 Z' },
    lancer:      { body: 'M20 1 L29 42 L20 35 L11 42 Z', extra: ['M3 28 L11 25 L11 40 L3 42 Z', 'M37 28 L29 25 L29 40 L37 42 Z'], cockpit: 'M20 8 L23 24 L20 21 L17 24 Z' },   // bawa laser
    pod:         { body: 'M20 6 L34 42 L20 36 L6 42 Z', extra: ['M0 26 L7 22 L7 42 L0 42 Z', 'M40 26 L33 22 L33 42 L40 42 Z'], cockpit: 'M20 12 L24 26 L20 23 L16 26 Z' },   // bawa missile
    sniper:      { body: 'M20 0 L25 44 L20 38 L15 44 Z', extra: ['M7 36 L15 30 L15 42 Z', 'M33 36 L25 30 L25 42 Z'], cockpit: 'M20 8 L22 22 L20 20 L18 22 Z' },
    kamikaze:    { body: 'M20 2 L28 28 L35 46 L20 38 L5 46 L12 28 Z', cockpit: 'M20 10 L23 24 L20 22 L17 24 Z' },
    summoner:    { body: 'M20 8 L37 22 L33 44 L20 38 L7 44 L3 22 Z', cockpit: 'M20 16 L27 24 L20 32 L13 24 Z', scale: 1.4 },
    medic:       { body: 'M20 6 L34 40 L20 34 L6 40 Z', cockpit: 'M18 16 H22 V21 H27 V25 H22 V30 H18 V25 H13 V21 H18 Z', cockpitFill: '#FFFFFF' },
    interceptor: { body: 'M20 4 L30 40 L20 33 L10 40 Z', extra: ['M4 18 L10 14 L10 38 L4 42 Z', 'M36 18 L30 14 L30 38 L36 42 Z'], cockpit: 'M20 10 L24 24 L20 21 L16 24 Z' },
    guardian:    { body: 'M20 3 L35 13 L35 35 L20 45 L5 35 L5 13 Z', cockpit: 'M20 14 L27 24 L20 34 L13 24 Z', scale: 1.25 },
};

function shapeMarkup(c, key) {
    const s = SHAPES[key] || SHAPES.base;
    const inner = (s.extra || []).map(d => `<path d="${d}" fill="${c.rcs}"/>`).join('')
        + `<path d="${s.body}" fill="${c.body}"/><path d="${s.cockpit}" fill="${s.cockpitFill || c.cockpit}"/>`;
    return s.scale ? `<g transform="translate(20 24) scale(${s.scale}) translate(-20 -24)">${inner}</g>` : inner;
}

// ================= DOM HUD PLAYER & CONTROLS =================
const $ = (id) => document.getElementById(id);
const gameOverBox = $('game-over-box');
const statusTitle = $('status-title');
const livesText = $('lives-text');
const hullBar = $('hull-bar'), hullText = $('hull-text');
const ammoBar = $('ammo-bar'), ammoText = $('ammo-text');
const enemyCount = $('enemy-count'), allyCount = $('ally-count');
const waveCount = $('wave-count');
const scoreCount = $('score-count');
const bestText = $('best-text');
const waveBanner = $('wave-banner');
const bannerTitle = $('banner-title');
const bannerSubtitle = $('banner-subtitle');
const shieldCdText = $('shield-cd-text');
const backupCdText = $('backup-cd-text');
const btnShield = $('btn-shield');
const btnBackup = $('btn-backup');
const btnSpeed = $('btn-speed');
const speedText = $('speed-text');
const speedSliderBox = $('speed-slider-box');
const speedSlider = $('speed-slider');
const sliderValText = $('slider-val-text');
const btnLaser = $('btn-laser');
const laserTimerText = $('laser-timer-text');
const btnHoming = $('btn-homing');
const homingTimerText = $('homing-timer-text');
const startScreen = $('start-screen');
const startBtn = $('start-btn');
const comboBox = $('combo-box'), comboText = $('combo-text'), comboBar = $('combo-bar');
const spreadBox = $('spread-box'), spreadText = $('spread-text');
const missileAlert = $('missile-alert'), missileAlertText = $('missile-alert-text');
const btnFlare = $('btn-flare'), flareCdText = $('flare-cd-text');

const pauseScreen = $('pause-screen');
const pauseReason = $('pause-reason');
const pauseBtn = $('pause-btn');
const resumeBtn = $('resume-btn');
const pauseRestartBtn = $('pause-restart-btn');

// ================= STATE =================
const keys = {};
const joy = { active: false, dx: 0, dy: 0 };
const ships = [];
const bullets = [];
const meteors = [];
const pickups = [];
const flares = [];
const floaters = [];
const spawnQueue = [];   // grup musuh yang menunggu giliran spawn
const threat = { count: 0, dist: Infinity, dx: 0, dy: 0 };   // misil musuh yang mengunci player
const particles = [];
const MAX_PARTICLES = 500;
const PARTICLE_COLORS = ['#f97316', '#ef4444', '#eab308', '#38bdf8', '#a855f7', '#14b8a6', '#ffffff'];
const cam = { x: 0, y: 0 };

let gameStarted = false;
let isPaused = false;
let currentWave = 1;
let waveState = 'PLAYING';
let backupCdUntil = 0;
let playerSpeedFactor = 1.0;

// Jam game: hanya maju saat game berjalan (tidak saat pause)
let gameTime = 0;
let lastTs = 0, accumulator = 0;
let waveStartAt = 0;

let score = 0, best = 0, bestBefore = 0;
let comboCount = 0, comboUntil = 0;
let killsSinceDrop = 0;
try { best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (e) { /* abaikan */ }
if (bestText) bestText.textContent = best;

// ================= UTIL =================
function setW(el, v) { if (el && el._w !== v) { el._w = v; el.style.width = v; } }
function setTxt(el, v) { if (el && el._t !== v) { el._t = v; el.textContent = v; } }

function resolveCollision(a, b, restitution = 0.75) {
    if (!a || !b) return 0;
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const minDist = a.radius + b.radius;
    if (dist >= minDist || dist === 0) return 0;

    const nx = dx / dist, ny = dy / dist;
    const overlap = minDist - dist;
    const total = a.mass + b.mass;

    a.x -= nx * overlap * (b.mass / total);
    a.y -= ny * overlap * (a.mass / total);
    b.x += nx * overlap * (a.mass / total);
    b.y += ny * overlap * (a.mass / total);

    const vn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
    if (vn < 0) return 0;

    const impulse = -(1 + restitution) * vn / (1 / a.mass + 1 / b.mass);
    a.vx += (impulse / a.mass) * nx;
    a.vy += (impulse / a.mass) * ny;
    b.vx -= (impulse / b.mass) * nx;
    b.vy -= (impulse / b.mass) * ny;
    return Math.abs(impulse);
}

function createExplosion(cx, cy, count = 24) {
    for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
        const a = Math.random() * Math.PI * 2, sp = Math.random() * 7 + 2;
        particles.push({
            x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            size: Math.random() * 3 + 1.5, op: 1,
            color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        });
    }
}

// ================= PAUSE SYSTEM =================
function pauseGame(reasonText = "Permainan dihentikan sementara") {
    if (!gameStarted || isPaused) return;
    isPaused = true;
    if (pauseReason) pauseReason.textContent = reasonText;
    if (pauseScreen) pauseScreen.classList.remove('hidden');
}

function resumeGame() {
    if (!isPaused) return;
    isPaused = false;
    if (pauseScreen) pauseScreen.classList.add('hidden');
}

function togglePause() {
    if (isPaused) resumeGame(); else pauseGame();
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseGame("Berpindah aplikasi / tab");
});

// Pause portrait hanya di perangkat sentuh (di desktop, resize/blur tidak memicu pause)
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
function checkOrientationPause() {
    if (isTouchDevice && window.innerHeight > window.innerWidth) {
        pauseGame("Mode Layar Tegak (Portrait)");
    }
}
window.addEventListener('resize', checkOrientationPause);

// ================= KOMPONEN: SHIP =================
class Ship {
    constructor(team, isPlayer = false, botType = 'standard') {
        this.team = team;
        this.isPlayer = isPlayer;
        this.botType = botType;
        if (isPlayer) this.lives = INITIAL_LIVES;

        if (isPlayer) {
            this.c = TEAMS[team];
        } else if (team === PLAYER_TEAM) {
            this.c = ALLY_BOT_COLORS[botType] || ALLY_BOT_COLORS.standard;
        } else {
            this.c = {
                body: BOT_TYPES[botType].body,
                cockpit: BOT_TYPES[botType].cockpit,
                rcs: BOT_TYPES[botType].rcs,
                glow: BOT_TYPES[botType].glow,
                bullet: BOT_TYPES[botType].bullet,
            };
        }
        
        this.p = isPlayer ? STATS.player : {
            turn: BOT_TYPES[botType].turn,
            main: BOT_TYPES[botType].main,
            rev: BOT_TYPES[botType].rev,
            rcsUse: 0.4, mainUse: BOT_TYPES[botType].mainUse || 0.4, mainRegen: 0.3,
            cooldown: 900, wallDamage: false,
            magSize: BOT_TYPES[botType].magSize,
            startMags: 3, maxMags: 5, reload: 1800
        };

        this.radius = isPlayer ? RADIUS : BOT_TYPES[botType].radius;
        this.mass = isPlayer ? MASS : (this.radius * 1.3);
        this.maxHp = isPlayer ? MAX_HULL : BOT_TYPES[botType].hp;

        this.joyHold = 0;
        this.lastJoyAngle = 0;
        this.shieldUntil = 0;
        this.shieldCdUntil = 0;
        this.laserUntil = 0;
        this.homingUntil = 0;
        this.multiUntil = 0;
        this.laserWarmAt = 0;
        this.laserWarming = false;
        this.lastLaserShot = 0;
        this.lastHomingShot = 0;

        this.buildPlane();
        if (!isPlayer) this.buildHud();
    }

    buildPlane() {
        const c = this.c;
        const el = document.createElement('div');
        el.className = 'fixed left-0 top-0 w-[22px] h-[28px] pointer-events-none z-10';
        el.style.willChange = 'transform';
        el.innerHTML = `
        <div data-fx="shield-aura" class="absolute -inset-2 rounded-full border-2 border-cyan-400 bg-cyan-400/20 shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse" style="display:none"></div>
        <div data-fx="warn-missile" class="absolute -inset-3 rounded-full border-2 border-orange-400 bg-orange-500/25 animate-ping" style="display:none"></div>
        <div data-fx="warn-summon" class="absolute -inset-4 rounded-full border-2 border-fuchsia-400 bg-fuchsia-500/25 animate-pulse" style="display:none"></div>
        <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full overflow-visible"
             style="filter:drop-shadow(0 0 6px rgba(${c.glow},0.8))">
            <g data-fx="thrust" style="display:none">
                <path d="M14 38 L20 54 L26 38 Z" fill="#f97316"/>
                <path d="M16 38 L20 48 L24 38 Z" fill="#facc15"/>
            </g>
            <path data-fx="left" d="M4 36 L-6 40 L4 44 Z" fill="${c.rcs}" style="display:none"/>
            <path data-fx="right" d="M36 36 L46 40 L36 44 Z" fill="${c.rcs}" style="display:none"/>
            <g data-fx="rev" style="display:none">
                <path d="M10 14 L2 4 L14 10 Z" fill="${c.rcs}"/>
                <path d="M30 14 L38 4 L26 10 Z" fill="${c.rcs}"/>
            </g>
            <g data-shape="1">${shapeMarkup(c, this.shapeKey())}</g>
        </svg>`;
        document.body.appendChild(el);
        this.el = el;
        this.shapeEl = el.querySelector('[data-shape]');
        this.shape = this.shapeKey();
        this.fxEls = {};
        this._fx = {};
        el.querySelectorAll('[data-fx]').forEach(n => this.fxEls[n.dataset.fx] = n);
    }

    buildHud() {
        const hud = document.createElement('div');
        hud.className = 'fixed left-0 top-0 w-8 z-20 pointer-events-none';
        hud.innerHTML = `
        <div class="w-full bg-gray-800 h-1 rounded-full overflow-hidden border border-gray-700">
            <div class="h-full w-full transition-all duration-150" style="background:${this.c.body}"></div>
        </div>
        <div class="w-full bg-gray-800 h-0.5 rounded-full overflow-hidden mt-0.5">
            <div class="h-full w-full bg-yellow-400"></div>
        </div>`;
        document.body.appendChild(hud);
        this.hud = hud;
        this.hudBar = hud.children[0].firstElementChild;
        this.hudAmmo = hud.children[1].firstElementChild;
    }

    reset(x, y, angle) {
        Object.assign(this, {
            x, y, angle, vx: 0, vy: 0, vAngle: 0,
            hull: this.maxHp, main: MAX_FUEL, rcs: MAX_FUEL,
            mainEmpty: false, rcsEmpty: false,
            ammo: this.p.magSize, mags: this.p.startMags, reloadUntil: 0,
            dead: false, invuln: false, lastShot: 0, joyHold: 0, lastJoyAngle: 0,
            shieldUntil: 0, shieldCdUntil: 0, laserUntil: 0, homingUntil: 0, multiUntil: 0,
            lastLaserShot: 0, lastHomingShot: 0, laserOn: false, laserWarmAt: 0, laserWarming: false,
            flareCdUntil: 0, homingWarmAt: 0, homingWarming: false, aimRange: LASER_RANGE, warmDur: LASER_WARMUP,
            snipeAt: 0, nextSnipe: gameTime + 1500, summonAt: 0, nextSummon: gameTime + 4000, summonsLeft: 3,
            lastHeal: 0, lastGuard: gameTime - GUARDIAN_INTERVAL + 1500, lastIntercept: 0, expireAt: 0, noDrop: false,
            invulnUntil: 0, respawnAt: 0,
            input: {}, fx: {},
        });
        if (this.el) {
            this.el.classList.remove('hidden');
            this.el.style.opacity = '1';
        }
    }

    activateShield(dur = SHIELD_DURATION, cd = SHIELD_COOLDOWN) {
        const now = gameTime;
        if (now >= this.shieldCdUntil) {
            this.shieldUntil = now + dur;
            this.shieldCdUntil = now + cd;
            createExplosion(this.x, this.y, 12);
            return true;
        }
        return false;
    }

    readKeys() {
        const k = keys;
        this.input = {
            left: !!(k.ArrowLeft || k.KeyA),
            right: !!(k.ArrowRight || k.KeyD),
            reverse: !!(k.ArrowDown || k.KeyS),
            thrust: !!(k.ArrowUp || k.KeyW),
            shoot: !!k.Space,
            laserHold: !!k.KeyQ,
            homingHold: !!k.KeyF,
        };

        if (k.KeyE) {
            this.activateShield();
            keys.KeyE = false;
        }

        if (k.KeyR) {
            requestBackup();
            keys.KeyR = false;
        }

        if (k.KeyG) {
            this.useFlare();
            keys.KeyG = false;
        }

        const joyDist = Math.hypot(joy.dx, joy.dy);
        if (joy.active && joyDist > 0.25) {
            let joyAngle = (Math.atan2(joy.dx, joy.dy) * 180) / Math.PI;

            let diffFwd = joyAngle - this.angle;
            while (diffFwd < -180) diffFwd += 360;
            while (diffFwd > 180) diffFwd -= 360;

            const absDiffFwd = Math.abs(diffFwd);

            if (absDiffFwd > 90) {
                this.input.reverse = true;
                this.input.thrust = false;
                this.joyHold = 0;

                let diffRear = joyAngle - (this.angle + 180);
                while (diffRear < -180) diffRear += 360;
                while (diffRear > 180) diffRear -= 360;

                if (diffRear < -8) this.input.left = true;
                else if (diffRear > 8) this.input.right = true;

            } else {
                let pd = diffFwd - this.vAngle * 10;
                if (pd < -4) this.input.left = true;
                else if (pd > 4) this.input.right = true;

                let joyAngleDelta = joyAngle - (this.lastJoyAngle || joyAngle);
                while (joyAngleDelta < -180) joyAngleDelta += 360;
                while (joyAngleDelta > 180) joyAngleDelta -= 360;

                const isRotatingFast = Math.abs(joyAngleDelta) > 3.0;

                if (joyDist > 0.45 && !isRotatingFast && absDiffFwd < 30) {
                    this.joyHold = (this.joyHold || 0) + 1;
                    if (this.joyHold > 5) {
                        this.input.thrust = true;
                    }
                } else {
                    this.joyHold = 0;
                }
            }

            this.lastJoyAngle = joyAngle;
        } else {
            this.joyHold = 0;
            this.lastJoyAngle = 0;
        }
    }

    nearestEnemy() {
        let best = null, bestD = Infinity;
        for (const s of ships) {
            if (s.dead || s.team === this.team) continue;
            const d = Math.hypot(s.x - this.x, s.y - this.y);
            if (d < bestD) { bestD = d; best = s; }
        }
        return best;
    }

    ai() {
        const i = this.input = {};
        const role = this.botType;
        let ax = 0, ay = 0;

        // flare otomatis jika ada misil musuh yang mengunci kapal ini
        if (gameTime >= this.flareCdUntil) {
            for (const b of bullets) {
                if (b.homing && b.tgt === this && Math.hypot(b.x - this.x, b.y - this.y) < 420) { this.useFlare(); break; }
            }
        }

        for (const m of meteors) {
            const d = Math.hypot(this.x - m.x, this.y - m.y) || 0.01;
            const range = m.radius + RADIUS + AVOID_METEOR;
            if (d < range) {
                const f = (range - d) / range;
                ax += ((this.x - m.x) / d) * f * 2;
                ay += ((this.y - m.y) / d) * f * 2;
            }
        }
        for (const s of ships) {
            if (s === this || s.dead) continue;
            if (role === 'kamikaze' && s.team !== this.team) continue;   // kamikaze menabrak, bukan menghindar
            const d = Math.hypot(this.x - s.x, this.y - s.y) || 0.01;
            const range = RADIUS * 2 + AVOID_SHIP;
            if (d < range) {
                const f = (range - d) / range;
                ax += ((this.x - s.x) / d) * f * 2;
                ay += ((this.y - s.y) / d) * f * 2;
            }
        }

        if (Math.hypot(ax, ay) > 0.15) {
            let fd = (Math.atan2(ax, ay) * 180) / Math.PI - this.angle;
            while (fd < -180) fd += 360;
            while (fd > 180) fd -= 360;
            if (Math.abs(fd) > 6) { i.left = fd < 0; i.right = fd > 0; }
            if (Math.abs(fd) < 70) i.thrust = true;
            else if (Math.abs(fd) > 110) i.reverse = true;
            return;
        }

        const pk = this.seekPickup();
        let t = pk || this.nearestEnemy();

        // ally spesialis menempel pada player
        let follow = false;
        const leash = FOLLOW_LEASH[role];
        if (leash && !pk && !player.dead && Math.hypot(player.x - this.x, player.y - this.y) > leash) { t = player; follow = true; }
        if (!t) return;

        const dx = t.x - this.x, dy = t.y - this.y;
        const dist = Math.hypot(dx, dy);
        let diff = (Math.atan2(dx, dy) * 180) / Math.PI - this.angle;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;

        if (Math.abs(diff) > 6) { i.left = diff < 0; i.right = diff > 0; }
        if (pk || follow) { if (Math.abs(diff) < 40) i.thrust = true; return; }
        if (role === 'kamikaze') { if (Math.abs(diff) < 50) i.thrust = true; return; }

        const band = ROLE_BAND[role] || [200, 400];
        if (dist > band[1]) i.thrust = true;
        else if (dist < band[0]) i.reverse = true;

        if (role === 'sniper') {
            if (Math.abs(diff) < 6 && dist > 300 && dist < SNIPER_RANGE) i.snipe = true;
            return;
        }
        if (Math.abs(diff) < 8 && dist < 500) {
            i.shoot = true;
            i.laserHold = true;
            i.homingHold = true;
        }
    }

    step(ts) {
        const p = this.p, i = this.input;
        if (this.invuln && ts >= this.invulnUntil) {
            this.invuln = false;
            if (this.el) this.el.style.opacity = '1';
        }
        const speedFactor = this.isPlayer ? playerSpeedFactor : 1.0;
        const now = gameTime;

        // heavy: shield singkat saat hull kritis
        if (!this.isPlayer && this.botType === 'heavy' && this.hull < this.maxHp * HEAVY_SHIELD_HP && now >= this.shieldCdUntil) {
            this.activateShield(HEAVY_SHIELD_DURATION, HEAVY_SHIELD_COOLDOWN);
        }

        if (this.isPlayer) {
            this.rcs = MAX_FUEL;
            this.main = MAX_FUEL;
            this.rcsEmpty = false;
            this.mainEmpty = false;
        } else {
            if (this.rcs <= 0) this.rcsEmpty = true;
            else if (this.rcsEmpty && this.rcs >= UNLOCK) this.rcsEmpty = false;
            if (this.main <= 0) this.mainEmpty = true;
            else if (this.mainEmpty && this.main >= UNLOCK) this.mainEmpty = false;
        }

        const left = !this.rcsEmpty && !!i.left;
        const right = !this.rcsEmpty && !!i.right;
        const rev = !this.rcsEmpty && !!i.reverse;
        const thrust = !this.mainEmpty && !!i.thrust;
        const rad = (this.angle * Math.PI) / 180;

        if (left) this.vAngle -= p.turn;
        if (right) this.vAngle += p.turn;
        if (rev) { this.vx -= p.rev * speedFactor * Math.sin(rad); this.vy -= p.rev * speedFactor * Math.cos(rad); }
        if (thrust) { this.vx += p.main * speedFactor * Math.sin(rad); this.vy += p.main * speedFactor * Math.cos(rad); }

        if (!this.isPlayer) {
            const rcsUsed = left || right || rev;
            this.rcs = rcsUsed ? Math.max(0, this.rcs - p.rcsUse) : Math.min(MAX_FUEL, this.rcs + 0.3);
            this.main = thrust ? Math.max(0, this.main - p.mainUse) : Math.min(MAX_FUEL, this.main + p.mainRegen);
        }

        const isShieldActive = !!(this.shieldUntil && now < this.shieldUntil);
        this.fx = { left, right, rev, thrust, 'shield-aura': isShieldActive };

        this.vAngle *= ANG_FRICTION;
        this.angle += this.vAngle;
        this.vx *= FRICTION; this.vy *= FRICTION;
        this.x += this.vx; this.y += this.vy;

        if (this.reloadUntil && ts >= this.reloadUntil) {
            this.reloadUntil = 0; this.ammo = p.magSize; this.mags--;
        }
        if (!this.reloadUntil && this.ammo < 1 && this.mags > 0) this.reloadUntil = ts + p.reload;

        // LASER: beam aktif selama Q atau FIRE ditahan
        // Bot butuh LASER_WARMUP ms pemanasan (garis peringatan) sebelum beam penuh; player instan.
        const laserWant = !!(this.laserUntil && now < this.laserUntil && (i.laserHold || i.shoot));
        if (!laserWant) this.laserWarmAt = 0;
        else if (!this.isPlayer && !this.laserWarmAt) this.laserWarmAt = now;
        this.laserOn = laserWant && (this.isPlayer || now - this.laserWarmAt >= LASER_WARMUP);
        this.laserWarming = laserWant && !this.laserOn;

        this.aimRange = LASER_RANGE;
        this.warmDur = LASER_WARMUP;
        this.sniperStep(i, now);   // sniper menimpa garis bidik & timer

        // PENANGANAN HOLD UNTUK MISSILE (Rentetan rudal pelacak); bot: glow peringatan dulu
        const homingWant = !!(i.homingHold && this.homingUntil && now < this.homingUntil);
        if (!homingWant) this.homingWarmAt = 0;
        else if (!this.isPlayer && !this.homingWarmAt) this.homingWarmAt = now;
        const homingReady = homingWant && (this.isPlayer || now - this.homingWarmAt >= MISSILE_WARMUP);
        this.homingWarming = homingWant && !homingReady;
        if (homingReady && now - this.lastHomingShot > 220) {
            this.shootSpecial('homing');
            this.lastHomingShot = now;
        }
        const blockStd = laserWant || (!this.isPlayer && homingWant);   // bot tidak menembak standar saat laser/missile aktif

        this.fx['warn-missile'] = this.homingWarming;
        this.fx['warn-summon'] = !!this.summonAt;
        this.specialStep(now);

        if (!this.isPlayer) {
            const sk = this.shapeKey();
            if (sk !== this.shape) this.setShape(sk);
        }

        // PENANGANAN TEMBAKAN PELURU STANDAR
        if (i.shoot && !blockStd && !this.reloadUntil && this.ammo >= 1 && ts - this.lastShot > p.cooldown) {
            if (this.homingUntil && now < this.homingUntil) {
                this.shootSpecial('homing');
            } else if (this.multiUntil && now < this.multiUntil) {
                for (const o of SPREAD_ANGLES) this.shootStandard(o);   // 1 ammo = 3 peluru
            } else {
                this.shootStandard();
            }
            this.ammo -= 1;
            this.lastShot = ts;
        }
    }

    shootStandard(offsetDeg = 0) {
        const rad = ((this.angle + offsetDeg) * Math.PI) / 180;
        const spawnX = this.x + Math.sin(rad) * 12;
        const spawnY = this.y + Math.cos(rad) * 12;
        const vx = this.vx + 14 * Math.sin(rad);
        const vy = this.vy + 14 * Math.cos(rad);
        const bAngle = (Math.atan2(vx, vy) * 180) / Math.PI;

        const el = document.createElement('div');
        el.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;z-index:10;border-radius:9999px;will-change:transform;width:5px;height:10px;background:${this.c.bullet};box-shadow:0 0 6px ${this.c.bullet}`;
        document.body.appendChild(el);
        bullets.push({
            el, owner: this, angle: bAngle, life: BULLET_LIFE, damage: BULLET_DAMAGE, color: this.c.bullet,
            x: spawnX, y: spawnY, vx, vy, width: 5, height: 10
        });
    }

    shootSpecial(type) {
        const rad = (this.angle * Math.PI) / 180;
        const spawnX = this.x + Math.sin(rad) * 12;
        const spawnY = this.y + Math.cos(rad) * 12;

        if (type === 'homing') {
            const spread = !!(this.multiUntil && gameTime < this.multiUntil);
            (spread ? [-14, -6, 6, 14] : [-6, 6]).forEach(offsetDeg => {
                const ang = this.angle + offsetDeg;
                const r = (ang * Math.PI) / 180;
                const sx = this.x + Math.sin(r) * 12;
                const sy = this.y + Math.cos(r) * 12;
                const vx = this.vx + 12 * Math.sin(r);
                const vy = this.vy + 12 * Math.cos(r);
                const bAngle = (Math.atan2(vx, vy) * 180) / Math.PI;

                const el = document.createElement('div');
                el.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;z-index:10;border-radius:9999px;will-change:transform;width:5px;height:12px;background:#fb923c;box-shadow:0 0 8px #fb923c`;
                document.body.appendChild(el);
                bullets.push({
                    el, owner: this, angle: bAngle, life: BULLET_LIFE * 1.3, damage: 22, homing: true, color: '#fb923c',
                    x: sx, y: sy, vx, vy, width: 5, height: 12
                });
            });
        }
    }

    shapeKey() {
        const t = this.botType;
        if (SHAPES[t] && t !== 'base') return t;     // sniper, kamikaze, summoner, medic, interceptor, guardian
        if (!this.isPlayer) {
            const now = gameTime;
            if (this.laserUntil && now < this.laserUntil) return 'lancer';
            if (this.homingUntil && now < this.homingUntil) return 'pod';
        }
        return 'base';
    }

    setShape(k) {
        this.shape = k;
        if (this.shapeEl) this.shapeEl.innerHTML = shapeMarkup(this.c, k);
    }

    grantWeapon(type, dur = WEAPON_DURATION) {
        const k = WEAPON_KEYS[type], now = gameTime;
        this[k] = Math.min(Math.max(this[k], now) + dur, now + WEAPON_DURATION * WEAPON_STACK_MAX);   // batas stack berlaku untuk semua kapal
    }

    useFlare(cd = this.isPlayer ? FLARE_COOLDOWN : BOT_FLARE_COOLDOWN) {
        const now = gameTime;
        if (now < this.flareCdUntil) return false;
        this.flareCdUntil = now + cd;
        for (const off of [-40, 0, 40]) {
            const a = ((this.angle + 180 + off) * Math.PI) / 180;
            spawnFlare(this, this.x, this.y, this.vx * 0.5 + Math.sin(a) * 3.5, this.vy * 0.5 + Math.cos(a) * 3.5);
        }
        return true;
    }

    sniperStep(i, now) {
        if (this.botType !== 'sniper') return;
        if (!i.snipe) this.snipeAt = 0;
        else if (!this.snipeAt && now >= this.nextSnipe) this.snipeAt = now;
        if (this.snipeAt) {
            this.laserWarming = true;
            this.laserWarmAt = this.snipeAt;
            this.aimRange = SNIPER_RANGE;
            this.warmDur = SNIPER_CHARGE;
            if (now - this.snipeAt >= SNIPER_CHARGE) {
                this.shootSnipe();
                this.snipeAt = 0;
                this.nextSnipe = now + SNIPER_COOLDOWN;
                this.laserWarming = false;
            }
        }
    }

    shootSnipe() {
        const rad = (this.angle * Math.PI) / 180;
        const vx = this.vx + 22 * Math.sin(rad), vy = this.vy + 22 * Math.cos(rad);
        const el = document.createElement('div');
        el.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:10;border-radius:9999px;will-change:transform;width:4px;height:22px;background:#f5d0fe;box-shadow:0 0 8px #e879f9,0 0 16px #e879f9';
        document.body.appendChild(el);
        bullets.push({
            el, owner: this, angle: (Math.atan2(vx, vy) * 180) / Math.PI, life: 80, damage: SNIPER_DAMAGE, color: '#e879f9',
            x: this.x + Math.sin(rad) * 14, y: this.y + Math.cos(rad) * 14, vx, vy, width: 4, height: 22, hitPad: 10
        });
    }

    specialStep(now) {
        const t = this.botType;
        if (t === 'summoner') {
            if (!this.summonAt) {
                const mine = ships.filter(s => !s.dead && s.team === this.team).length;
                if (this.summonsLeft > 0 && now >= this.nextSummon && mine < SUMMON_MAX_ENEMIES) this.summonAt = now + SUMMON_CHARGE;
            } else if (now >= this.summonAt) {
                this.summonAt = 0;
                this.summonsLeft--;
                this.nextSummon = now + SUMMON_INTERVAL;
                for (const o of [-26, 26]) spawnBot(this.team, 'scout', { x: this.x + o, y: this.y - 20, angle: this.angle });
                createExplosion(this.x, this.y, 14);
                floatText('BALA BANTUAN MUSUH!', this.x, this.y + 40, '#e879f9', true);
            }
        } else if (t === 'medic') {
            if (!player.dead && player.hull < player.maxHp && now - this.lastHeal >= MEDIC_TICK
                && Math.hypot(player.x - this.x, player.y - this.y) < MEDIC_RANGE) {
                this.lastHeal = now;
                player.hull = Math.min(player.maxHp, player.hull + MEDIC_HEAL);
                floatText(`+${MEDIC_HEAL} HULL`, player.x, player.y + 30, '#4ade80');
            }
        } else if (t === 'guardian') {
            if (!player.dead && now - this.lastGuard >= GUARDIAN_INTERVAL && !(player.shieldUntil && now < player.shieldUntil)
                && Math.hypot(player.x - this.x, player.y - this.y) < MEDIC_RANGE
                && ships.some(s => !s.dead && s.team !== PLAYER_TEAM && Math.hypot(s.x - player.x, s.y - player.y) < 700)) {
                this.lastGuard = now;
                player.shieldUntil = now + GUARDIAN_SHIELD;
                floatText('PERISAI GUARDIAN', player.x, player.y + 30, '#a5b4fc');
            }
        } else if (t === 'interceptor') {
            if (now - this.lastIntercept >= INTERCEPT_TICK) {
                let best = -1, bd = INTERCEPT_RANGE;
                for (let k = 0; k < bullets.length; k++) {
                    const b = bullets[k];
                    if (!b.homing || b.owner.team === this.team) continue;
                    const d = Math.hypot(b.x - this.x, b.y - this.y);
                    if (d < bd) { bd = d; best = k; }
                }
                if (best >= 0) {
                    const b = bullets[best];
                    if (b.el) b.el.remove();
                    bullets.splice(best, 1);
                    createExplosion(b.x, b.y, 8);
                    this.lastIntercept = now;
                    floatText('DICEGAT', b.x, b.y + 14, '#67e8f9');
                }
            }
        }
    }

    kamikazeCheck() {
        for (const t of ships) {
            if (t.dead || t === this || t.team === this.team) continue;
            if (Math.hypot(t.x - this.x, t.y - this.y) < this.radius + t.radius + 3) {
                t.takeDamage(KAMIKAZE_DAMAGE, false, null);
                this.noDrop = true;
                this.destroy(null);
                return;
            }
        }
    }

    takeDamage(amount, beam = false, source = null) {
        const isShieldActive = !!(this.shieldUntil && gameTime < this.shieldUntil);
        if (isShieldActive) {
            createExplosion(this.x, this.y, 2);
            return;
        }
        if ((this.invuln && !beam) || this.dead || amount <= 0) return;

        this.hull = Math.max(0, this.hull - amount);
        createExplosion(this.x, this.y, beam ? 2 : 10);
        if (this.hull <= 0) return this.destroy(source);
        if (beam) return;

        this.invuln = true;
        this.invulnUntil = gameTime + 800;
        if (this.el) this.el.style.opacity = '0.4';
    }

    destroy(source = null) {
        this.dead = true;
        createExplosion(this.x, this.y, 36);

        if (this.isPlayer) {
            this.lives--;
            comboCount = 0; comboUntil = 0;
            if (this.el) this.el.classList.add('hidden');

            if (this.lives > 0) {
                this.respawnAt = gameTime + 1200;   // diproses di updateGame()
            } else {
                const rec = best > bestBefore ? ' · REKOR BARU!' : '';
                showStatus(`GAME OVER · WAVE ${currentWave} · SKOR ${score}${rec}`, 'text-red-500');
            }
        } else {
            if (source && source.team === PLAYER_TEAM && this.team !== PLAYER_TEAM) {
                const mult = registerKill();
                const pts = (SCORE_BY_TYPE[this.botType] || 100) * mult;
                addScore(pts);
                floatText(mult > 1 ? `+${pts} x${mult}` : `+${pts}`, this.x, this.y + 22, COMBO_COLORS[mult - 1], mult >= 3);
            }
            if (this.team !== PLAYER_TEAM && !this.noDrop) {
                killsSinceDrop++;
                if (killsSinceDrop >= DROP_PITY || Math.random() < PICKUP_DROP_CHANCE) {
                    killsSinceDrop = 0;
                    spawnPickup(this.x, this.y);
                }
            }
            this.remove();
            checkWaveProgress();
        }
    }

    remove() {
        if (this.beam) { this.beam.root.remove(); this.beam.muzzle.remove(); this.beam.hit.remove(); }
        if (this.el) this.el.remove();
        if (this.hud) this.hud.remove();
        const idx = ships.indexOf(this);
        if (idx >= 0) ships.splice(idx, 1);
    }

    canUse(type) {
        if (type === 'health') return this.hull < this.maxHp;
        if (type === 'mag') return this.mags < this.p.maxMags;
        if (type === 'life') return this.isPlayer && this.lives < MAX_LIVES;
        const wk = WEAPON_KEYS[type];
        if (wk) return this[wk] - gameTime < WEAPON_DURATION * WEAPON_STACK_MAX - 1;   // sudah mentok: jangan buang pickup
        return true;
    }

    apply(type) {
        const now = gameTime;
        if (type === 'health') this.hull = Math.min(this.maxHp, this.hull + HEAL_AMOUNT);
        else if (type === 'mag') this.mags = Math.min(this.p.maxMags, this.mags + MAG_AMOUNT);
        else if (type === 'life') {
            if (this.isPlayer) this.lives = Math.min(MAX_LIVES, this.lives + 1);
            createExplosion(this.x, this.y, 18);
        } else if (WEAPON_KEYS[type]) {
            // menumpuk: jenis sama memperpanjang durasi, jenis berbeda berjalan bersamaan
            this.grantWeapon(type);
            createExplosion(this.x, this.y, 16);
        }
        if (this.isPlayer) {
            const wk = WEAPON_KEYS[type];
            const lbl = PICKUP_LABEL[type] + (wk ? ` ${Math.ceil((this[wk] - now) / 1000)}s` : '');
            floatText(lbl, this.x, this.y + 34, PICKUP_TYPES[type].color);
        }
    }

    seekPickup() {
        if (SUPPORT_ROLES[this.botType] || this.botType === 'kamikaze') return null;
        let best = null, bestD = PICKUP_SEEK;
        for (const k of pickups) {
            const need = k.type === 'health' ? this.hull < (this.maxHp * 0.6) : k.type === 'mag' ? this.mags < 1 : k.type === 'life' ? (this.isPlayer && this.lives < 3) : true;
            if (!need) continue;
            const d = Math.hypot(k.x - this.x, k.y - this.y);
            if (d < bestD) { bestD = d; best = k; }
        }
        return best;
    }

    render() {
        const sx = this.x - cam.x;
        const sy = window.innerHeight - (this.y - cam.y);

        if (this.el) this.el.style.transform = `translate(${sx - W / 2}px, ${sy - H / 2}px) rotate(${this.angle}deg)`;
        for (const k in this.fxEls) {
            const on = !!this.fx[k];
            if (this._fx[k] !== on) { this._fx[k] = on; if (this.fxEls[k]) this.fxEls[k].style.display = on ? '' : 'none'; }
        }

        if (this.isPlayer) {
            const now = gameTime;

            if (this.laserUntil && now < this.laserUntil) {
                if (btnLaser) btnLaser.classList.remove('hidden');
                if (laserTimerText) laserTimerText.textContent = `${Math.ceil((this.laserUntil - now) / 1000)}s`;
            } else {
                if (btnLaser) btnLaser.classList.add('hidden');
            }

            if (this.homingUntil && now < this.homingUntil) {
                if (btnHoming) btnHoming.classList.remove('hidden');
                if (homingTimerText) homingTimerText.textContent = `${Math.ceil((this.homingUntil - now) / 1000)}s`;
            } else {
                if (btnHoming) btnHoming.classList.add('hidden');
            }

            if (this.multiUntil && now < this.multiUntil) {
                if (spreadBox) spreadBox.classList.remove('hidden');
                setTxt(spreadText, `${Math.ceil((this.multiUntil - now) / 1000)}s`);
            } else if (spreadBox) {
                spreadBox.classList.add('hidden');
            }
            updateComboHud();
            updateMissileAlert();

            const noAmmo = !this.reloadUntil && this.ammo < 1 && this.mags < 1;
            const ammoTxt = noAmmo ? 'NO AMMO' : this.reloadUntil ? `RELOAD · MAG ${this.mags}` : `${this.ammo}/${this.p.magSize} · MAG ${this.mags}`;

            const livesIcon = '❤️'.repeat(Math.max(0, this.lives));
            setTxt(livesText, `${livesIcon} (${this.lives})`);
            setW(hullBar, `${(this.hull / MAX_HULL) * 100}%`);
            setTxt(hullText, `${Math.round(this.hull)}%`);

            setW(ammoBar, `${(this.ammo / this.p.magSize) * 100}%`);
            if (ammoBar) ammoBar.style.opacity = this.reloadUntil ? '0.4' : '1';
            setTxt(ammoText, ammoTxt);
            setTxt($('hud-status-mini'), `${this.lives} NYAWA · ${Math.round(this.hull)}% HP`);

            if (now < this.shieldUntil) {
                setTxt(shieldCdText, `${Math.ceil((this.shieldUntil - now) / 1000)}s`);
                if (btnShield) btnShield.style.opacity = '1';
            } else if (now < this.shieldCdUntil) {
                setTxt(shieldCdText, `${Math.ceil((this.shieldCdUntil - now) / 1000)}s`);
                if (btnShield) btnShield.style.opacity = '0.4';
            } else {
                setTxt(shieldCdText, 'READY');
                if (btnShield) btnShield.style.opacity = '1';
            }

            if (now < backupCdUntil) {
                setTxt(backupCdText, `${Math.ceil((backupCdUntil - now) / 1000)}s`);
                if (btnBackup) btnBackup.style.opacity = '0.4';
            } else {
                setTxt(backupCdText, 'READY');
                if (btnBackup) btnBackup.style.opacity = '1';
            }

            if (now < this.flareCdUntil) {
                setTxt(flareCdText, `${Math.ceil((this.flareCdUntil - now) / 1000)}s`);
                if (btnFlare) btnFlare.style.opacity = '0.4';
            } else {
                setTxt(flareCdText, 'READY');
                if (btnFlare) btnFlare.style.opacity = '1';
            }

        } else if (this.hud) {
            this.hud.style.transform = `translate(${sx - 16}px, ${sy - H / 2 - 10}px)`;
            setW(this.hudBar, `${(this.hull / this.maxHp) * 100}%`);
            setW(this.hudAmmo, `${(this.ammo / this.p.magSize) * 100}%`);
            if (this.hudAmmo) this.hudAmmo.style.opacity = this.reloadUntil ? '0.4' : '1';
        }
    }
}

// ================= GAME STATE & WAVE SYSTEM =================
const player = new Ship(PLAYER_TEAM, true);
ships.push(player);

function showStatus(text, colorClass) {
    if (statusTitle) statusTitle.innerHTML = `<span class="${colorClass}">${text}</span>`;
    if (gameOverBox) gameOverBox.classList.remove('hidden');
}

function requestBackup() {
    if (!gameStarted || player.dead || isPaused) return;
    const now = gameTime;
    if (now < backupCdUntil) return;

    const cdDuration = 15000 + (currentWave - 1) * 5000;
    backupCdUntil = now + cdDuration;

    const allyType = pickBackupType();
    spawnBot(PLAYER_TEAM, allyType);
    createExplosion(player.x, player.y, 10);
    floatText(BACKUP_LABEL[allyType], player.x, player.y + 56, '#60a5fa', true);
}

// Backup memilih jenis bantuan sesuai kondisi: hull rendah -> medic, misil -> interceptor,
// terkepung saat shield cooldown -> guardian, selain itu ally tempur sesuai wave.
function pickBackupType() {
    const foes = ships.filter(s => !s.dead && s.team !== PLAYER_TEAM);
    const has = (type) => ships.some(s => !s.dead && s.team === PLAYER_TEAM && s.botType === type);
    if (player.hull < player.maxHp * 0.5 && !has('medic')) return 'medic';
    const missileFoes = foes.filter(s => s.homingUntil && gameTime < s.homingUntil).length;
    if ((threat.count > 0 || missileFoes >= 2) && !has('interceptor')) return 'interceptor';
    const near = foes.filter(s => Math.hypot(s.x - player.x, s.y - player.y) < 800).length;
    if (near >= 3 && gameTime < player.shieldCdUntil && !has('guardian')) return 'guardian';
    return currentWave >= 5 ? 'heavy' : currentWave >= 3 ? 'standard' : 'scout';
}

function addScore(n) {
    score += n;
    setTxt(scoreCount, String(score));
    if (score > best) {
        best = score;
        setTxt(bestText, String(best));
        try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) { /* abaikan */ }
    }
}

function registerKill() {
    comboCount = gameTime < comboUntil ? comboCount + 1 : 1;
    comboUntil = gameTime + COMBO_WINDOW;
    return Math.min(COMBO_MAX, comboCount);
}

function updateComboHud() {
    const active = comboCount >= 2 && gameTime < comboUntil;
    if (comboBox) comboBox.classList.toggle('hidden', !active);
    if (active) {
        setTxt(comboText, 'x' + Math.min(COMBO_MAX, comboCount));
        setW(comboBar, `${((comboUntil - gameTime) / COMBO_WINDOW) * 100}%`);
    }
}

function startWave(waveNum) {
    currentWave = waveNum;
    if (waveNum === 1) {
        comboCount = 0; comboUntil = 0;
        score = 0;
        bestBefore = best;
        waveStartAt = 0;
        setTxt(scoreCount, '0');
    }
    waveState = 'PLAYING';
    if (waveCount) waveCount.textContent = currentWave;
    if (waveBanner) waveBanner.classList.add('hidden');

    const scoutCount = Math.floor(waveNum / 2);
    const heavyCount = Math.floor((waveNum - 1) / 3);
    const sniperCount = waveNum >= 3 ? 1 + Math.floor((waveNum - 3) / 4) : 0;
    const kamikazeCount = waveNum >= 4 ? 1 + Math.floor((waveNum - 4) / 3) : 0;
    const summonerCount = waveNum >= 5 && waveNum % 2 === 1 ? 1 : 0;
    const standardCount = Math.max(1, waveNum - scoutCount - heavyCount - sniperCount - kamikazeCount - summonerCount);

    const list = [];
    const add = (type, n) => { for (let i = 0; i < n; i++) list.push(type); };
    add('scout', scoutCount); add('standard', standardCount); add('heavy', heavyCount);
    add('sniper', sniperCount); add('kamikaze', kamikazeCount); add('summoner', summonerCount);
    list.sort(() => Math.random() - 0.5);

    // spawn bertahap: 1 grup (<=3 musuh), 2 grup (<=6), 3 grup (lebih)
    const groups = list.length <= 3 ? 1 : list.length <= 6 ? 2 : 3;
    const per = Math.ceil(list.length / groups);
    spawnQueue.length = 0;
    for (let g = 0; g < groups; g++) {
        const types = list.slice(g * per, (g + 1) * per);
        if (types.length) spawnQueue.push({ at: gameTime + g * WAVE_GROUP_DELAY, types, late: g > 0 });
    }
    spawnDue();
}

// Spawn grup berikutnya saat waktunya tiba, atau segera jika lapangan sudah bersih
function spawnDue() {
    while (spawnQueue.length) {
        const g = spawnQueue[0];
        const foes = ships.some(s => !s.dead && s.team !== PLAYER_TEAM);
        if (gameTime < g.at && foes) break;
        spawnQueue.shift();
        g.types.forEach(t => spawnBot('red', t));
        if (g.late && !player.dead) floatText('MUSUH BARU!', player.x, player.y + 70, '#f87171', true);
    }
}

function checkWaveProgress() {
    const enemiesLeft = ships.filter(s => !s.dead && s.team !== PLAYER_TEAM).length;
    if (enemiesLeft === 0 && waveState === 'PLAYING' && spawnQueue.length === 0) {
        waveState = 'CLEARED';

        if (bannerTitle) bannerTitle.textContent = `WAVE ${currentWave} CLEARED!`;
        if (bannerSubtitle) bannerSubtitle.textContent = `Persiapan untuk Wave ${currentWave + 1}...`;
        if (waveBanner) waveBanner.classList.remove('hidden');

        addScore(WAVE_BONUS * currentWave);
        dropNearPlayer(rollDropType(), 120, 200);   // hadiah wave
        floatText(`BONUS WAVE +${WAVE_BONUS * currentWave}`, player.x, player.y + 50, '#c084fc', true);
        waveStartAt = gameTime + 3000;   // diproses di updateGame()
    }
}

function spawnBot(team, botType = 'standard', at = null) {
    const isAlly = team === PLAYER_TEAM;
    const bot = new Ship(team, false, botType);
    
    let spawnX, spawnY, spawnAngle;
    if (at) {
        spawnX = at.x; spawnY = at.y; spawnAngle = at.angle || 0;
    } else if (isAlly) {
        const rx = 0.3 + Math.random() * 0.4;
        spawnX = cam.x + window.innerWidth * rx;
        spawnY = cam.y + window.innerHeight * 0.3;
        spawnAngle = 0;
    } else {
        const angle = Math.random() * Math.PI * 2;
        const dist = 1200 + Math.random() * 800;
        spawnX = player.x + Math.cos(angle) * dist;
        spawnY = player.y + Math.sin(angle) * dist;
        spawnAngle = (Math.atan2(player.x - spawnX, player.y - spawnY) * 180) / Math.PI;
    }

    bot.reset(spawnX, spawnY, spawnAngle);
    if (isAlly && SUPPORT_ROLES[botType]) bot.expireAt = gameTime + SUPPORT_LIFETIME;

    if (!isAlly && currentWave >= 2 && LOADOUT_TYPES[botType]) {
        const rand = Math.random();
        const now = gameTime;
        if (rand < 0.35) {
            bot.grantWeapon('laser', WEAPON_DURATION * 1.5);
        } else if (rand < 0.6) {
            bot.grantWeapon('homing', WEAPON_DURATION * 1.5);
        }
    }

    ships.push(bot);
    if (!player.dead && gameOverBox) gameOverBox.classList.add('hidden');
}

function resetGame() {
    resumeGame();
    [...ships].forEach(s => { if (!s.isPlayer) s.remove(); });
    player.lives = INITIAL_LIVES;
    player.reset(0, 0, 0); updateCamera();

    backupCdUntil = 0;
    Object.keys(keys).forEach(k => keys[k] = false);
    bullets.forEach(b => { if (b.el) b.el.remove(); }); bullets.length = 0;
    meteors.forEach(m => { if (m.el) m.el.remove(); }); meteors.length = 0;
    pickups.forEach(k => { if (k.el) k.el.remove(); }); pickups.length = 0;
    flares.forEach(f => f.el.remove()); flares.length = 0;
    floaters.forEach(f => f.el.remove()); floaters.length = 0;
    spawnQueue.length = 0;
    threat.count = 0;
    killsSinceDrop = 0; nextSupplyAt = 0;

    if (gameOverBox) gameOverBox.classList.add('hidden');
    gameStarted = true;
    startWave(1);
}

// ================= METEOR =================
function spawnMeteor() {
    if (meteors.length >= MAX_METEORS) return;
    const type = METEOR_TYPES[Math.floor(Math.random() * METEOR_TYPES.length)];
    const radius = type.r;
    const speed = Math.random() * 0.5 + 0.1;
    const ang = Math.random() * Math.PI * 2;
    const sa = Math.random() * Math.PI * 2;
    const sd = Math.hypot(window.innerWidth, window.innerHeight) + 100 + Math.random() * 300;

    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;z-index:10;border-radius:9999px;box-sizing:border-box;border:1px solid #a8a29e;background:rgba(68,64,60,.9);will-change:transform;width:${radius * 2}px;height:${radius * 2}px`;
    document.body.appendChild(el);

    meteors.push({
        el, radius, mass: radius * 2.2, hp: type.hp, maxHp: type.hp,
        x: cam.x + window.innerWidth / 2 + Math.cos(sa) * sd,
        y: cam.y + window.innerHeight / 2 + Math.sin(sa) * sd,
        vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
    });
}

function updateMeteors() {
    for (let i = 0; i < meteors.length; i++)
        for (let j = i + 1; j < meteors.length; j++) resolveCollision(meteors[i], meteors[j], 0.8);

    const far = Math.hypot(window.innerWidth, window.innerHeight) * 1.8;

    for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx; m.y += m.vy;

        if (Math.hypot(m.x - (cam.x + window.innerWidth / 2), m.y - (cam.y + window.innerHeight / 2)) > far) {
            if (m.el) m.el.remove(); meteors.splice(i, 1);
            continue;
        }

        const sx = m.x - cam.x;
        const sy = window.innerHeight - (m.y - cam.y);
        if (m.el) m.el.style.transform = `translate(${sx - m.radius}px, ${sy - m.radius}px)`;

        let destroyed = false;
        for (let bi = bullets.length - 1; bi >= 0; bi--) {
            const b = bullets[bi];

            let isHit = false;
            if (b.isLaser) {
                for (let offset = -50; offset <= 50; offset += 15) {
                    const rad = (b.angle * Math.PI) / 180;
                    const px = b.x + Math.sin(rad) * offset;
                    const py = b.y + Math.cos(rad) * offset;
                    if (Math.hypot(px - m.x, py - m.y) < m.radius + 3) { isHit = true; break; }
                }
            } else {
                isHit = Math.hypot(b.x - m.x, b.y - m.y) < m.radius + 4;
            }

            if (!isHit) continue;

            m.vx += (BULLET_MASS * (b.vx - m.vx)) / m.mass;
            m.vy += (BULLET_MASS * (b.vy - m.vy)) / m.mass;
            const sp = Math.hypot(m.vx, m.vy);
            if (sp > METEOR_MAX_SPEED) { m.vx *= METEOR_MAX_SPEED / sp; m.vy *= METEOR_MAX_SPEED / sp; }

            m.hp -= (b.damage || BULLET_DAMAGE);
            createExplosion(b.x, b.y, 3);
            if (b.el) b.el.remove(); bullets.splice(bi, 1);
            if (m.hp <= 0) { destroyed = true; break; }
        }
        if (destroyed) {
            createExplosion(m.x, m.y, 12 + m.radius);
            meteorDrop(m);
            if (m.el) m.el.remove(); meteors.splice(i, 1);
            continue;
        }
        if (m.el) m.el.style.opacity = 0.45 + 0.55 * (m.hp / m.maxHp);

        for (const s of [...ships]) {
            if (s.dead) continue;
            const imp = resolveCollision(s, m, 0.7);
            if (imp > 0) s.takeDamage(Math.round(imp * 1.8));
        }
    }
}

// ================= PELURU (PROYEKTIL) =================
// ================= LASER BEAM =================
function ensureBeam(s) {
    if (s.beam) return s.beam;
    const c = s.team === PLAYER_TEAM ? '#c084fc' : '#f87171';
    const root = document.createElement('div');
    root.style.cssText = 'position:fixed;left:0;top:0;width:22px;pointer-events:none;z-index:9;will-change:transform;transform-origin:50% 100%;display:none';
    root.innerHTML = `
        <div style="position:absolute;inset:0;background:linear-gradient(90deg,${c}00,${c}aa 35%,${c}aa 65%,${c}00);filter:blur(3px)"></div>
        <div style="position:absolute;top:0;bottom:0;left:50%;width:4px;margin-left:-2px;border-radius:2px;background:#fff;box-shadow:0 0 6px #fff,0 0 14px ${c},0 0 28px ${c}"></div>
        <div style="display:none;position:absolute;top:0;bottom:0;left:50%;width:2px;margin-left:-1px;background:${c};box-shadow:0 0 4px ${c}"></div>`;
    const flash = () => {
        const d = document.createElement('div');
        d.style.cssText = `position:fixed;left:0;top:0;width:26px;height:26px;pointer-events:none;z-index:9;border-radius:9999px;will-change:transform;display:none;background:radial-gradient(circle,#fff 0%,${c} 40%,${c}00 70%)`;
        document.body.appendChild(d);
        return d;
    };
    document.body.appendChild(root);
    s.beam = { root, muzzle: flash(), hit: flash(), lastTick: 0, glow: root.children[0], core: root.children[1], warn: root.children[2], warm: false };
    return s.beam;
}

function hideBeam(b) {
    b.root.style.display = b.muzzle.style.display = b.hit.style.display = 'none';
}

function updateBeams() {
    for (const s of [...ships]) {
        const b = s.beam;
        if (!(s.laserOn || s.laserWarming) || s.dead) { if (b) b.state = null; continue; }
        const bm = ensureBeam(s);
        const rad = (s.angle * Math.PI) / 180;
        const dx = Math.sin(rad), dy = Math.cos(rad);
        const ox = s.x + dx * 12, oy = s.y + dy * 12;

        // raycast: berhenti di target pertama yang kena
        let len = s.aimRange || LASER_RANGE, hitObj = null, hitType = '';
        const test = (o, r, type) => {
            const px = o.x - ox, py = o.y - oy;
            const t = px * dx + py * dy;
            if (t < 0 || t > len + r) return;
            const perp = Math.abs(px * dy - py * dx);
            if (perp > r + 3) return;
            const tt = Math.max(0, t - Math.sqrt(Math.max(0, r * r - perp * perp)));
            if (tt < len) { len = tt; hitObj = o; hitType = type; }
        };
        for (const t of ships) if (!t.dead && t !== s && t.team !== s.team) test(t, t.radius, 'ship');
        for (const m of meteors) test(m, m.radius, 'meteor');

        if (hitObj && s.laserOn) {   // saat pemanasan: hanya garis, tanpa damage
            if (gameTime - bm.lastTick >= LASER_TICK) {
                bm.lastTick = gameTime;
                const dmg = s.isPlayer ? LASER_TICK_DAMAGE : LASER_TICK_DAMAGE * BOT_LASER_FACTOR;
                if (hitType === 'ship') {
                    hitObj.takeDamage(dmg, true, s);
                } else {
                    hitObj.hp -= dmg;
                    if (hitObj.hp <= 0) {
                        createExplosion(hitObj.x, hitObj.y, 12 + hitObj.radius);
                        meteorDrop(hitObj);
                        if (hitObj.el) hitObj.el.remove();
                        const mi = meteors.indexOf(hitObj);
                        if (mi >= 0) meteors.splice(mi, 1);
                    }
                }
            }
            if (Math.random() < 0.5) createExplosion(ox + dx * len, oy + dy * len, 1);
        }

        bm.state = {
            ox, oy, dx, dy, len, hit: !!hitObj && s.laserOn, angle: s.angle,
            warm: !s.laserOn,
            prog: s.laserOn ? 1 : Math.min(1, (gameTime - s.laserWarmAt) / (s.warmDur || LASER_WARMUP)),
        };
    }
}

// Digambar tiap frame (setelah kamera diperbarui) supaya beam menempel di kapal
function renderBeams() {
    for (const s of ships) {
        const b = s.beam;
        if (!b) continue;
        const st = b.state;
        if (!st || s.dead) { hideBeam(b); continue; }

        const sx = st.ox - cam.x, sy = window.innerHeight - (st.oy - cam.y);
        if (b.warm !== st.warm) {
            b.warm = st.warm;
            b.glow.style.display = b.core.style.display = st.warm ? 'none' : '';
            b.warn.style.display = st.warm ? '' : 'none';
        }
        // pemanasan: garis tipis redup yang makin terang mendekati beam penuh
        const flick = st.warm ? 0.2 + 0.4 * st.prog : 0.8 + Math.random() * 0.2;
        const sclX = st.warm ? 1 : 0.85 + Math.random() * 0.3;
        b.root.style.display = '';
        b.root.style.height = st.len + 'px';
        b.root.style.opacity = flick;
        b.root.style.transform = `translate(${sx - 11}px, ${sy - st.len}px) rotate(${st.angle}deg) scaleX(${sclX})`;

        if (st.warm) {
            b.muzzle.style.display = 'none';
        } else {
            b.muzzle.style.display = '';
            b.muzzle.style.transform = `translate(${sx - 13}px, ${sy - 13}px) scale(${flick})`;
        }

        if (st.hit) {
            const ex = st.ox + st.dx * st.len - cam.x;
            const ey = window.innerHeight - (st.oy + st.dy * st.len - cam.y);
            b.hit.style.display = '';
            b.hit.style.transform = `translate(${ex - 13}px, ${ey - 13}px) scale(${0.8 + Math.random() * 0.8})`;
        } else {
            b.hit.style.display = 'none';
        }
    }
}

function updateBullets() {
    updateBeams();
    threat.count = 0; threat.dist = Infinity;
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];

        if (b.homing) {
            let target = null, minDist = 800;
            for (const s of ships) {
                if (s.dead || s.team === b.owner.team) continue;
                const d = Math.hypot(s.x - b.x, s.y - b.y);
                if (d < minDist) { minDist = d; target = s; }
            }
            // flare musuh di dekat misil menjadi target utama
            let lure = null, lureD = FLARE_LURE;
            for (const f of flares) {
                if (f.team === b.owner.team) continue;
                const d = Math.hypot(f.x - b.x, f.y - b.y);
                if (d < lureD) { lureD = d; lure = f; }
            }
            if (lure) target = lure;
            b.tgt = target;
            if (target === player && b.owner.team !== PLAYER_TEAM) {
                threat.count++;
                const dp = Math.hypot(b.x - player.x, b.y - player.y);
                if (dp < threat.dist) { threat.dist = dp; threat.dx = b.x - player.x; threat.dy = b.y - player.y; }
            }
            if (target) {
                const desiredRad = Math.atan2(target.x - b.x, target.y - b.y);
                const currentRad = Math.atan2(b.vx, b.vy);
                let diff = desiredRad - currentRad;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;

                const turnSpeed = 0.14;
                const newRad = currentRad + Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);
                const speed = Math.hypot(b.vx, b.vy);
                b.vx = Math.sin(newRad) * speed;
                b.vy = Math.cos(newRad) * speed;
                b.angle = (newRad * 180) / Math.PI;
            }
        }

        b.x += b.vx; b.y += b.vy;

        if (b.homing) {   // misil habis diserap flare
            const f = flares.find(f => f.team !== b.owner.team && Math.hypot(f.x - b.x, f.y - b.y) < 12);
            if (f) {
                if (b.el) b.el.remove();
                bullets.splice(i, 1);
                createExplosion(f.x, f.y, 6);
                if (--f.hits <= 0) f.life = 0;
                continue;
            }
        }

        const sx = b.x - cam.x;
        const sy = window.innerHeight - (b.y - cam.y);
        const bw = b.width || 5, bh = b.height || 10;
        if (b.el) b.el.style.transform = `translate(${sx - bw / 2}px, ${sy - bh / 2}px) rotate(${b.angle}deg)`;

        let target = null;
        if (b.isLaser) {
            for (let offset = -50; offset <= 50; offset += 15) {
                const rad = (b.angle * Math.PI) / 180;
                const px = b.x + Math.sin(rad) * offset;
                const py = b.y + Math.cos(rad) * offset;
                target = ships.find(s => !s.dead && s !== b.owner && s.team !== b.owner.team && Math.hypot(px - s.x, py - s.y) < s.radius + 3);
                if (target) break;
            }
        } else {
            target = ships.find(s => !s.dead && s !== b.owner && s.team !== b.owner.team && Math.hypot(b.x - s.x, b.y - s.y) < s.radius + (b.hitPad || 4));
        }

        const out = --b.life <= 0;

        if (target || out) {
            if (b.el) b.el.remove(); bullets.splice(i, 1);
            if (target) target.takeDamage(b.damage || BULLET_DAMAGE, false, b.owner);
        }
    }
}

// ================= FLARE =================
function spawnFlare(owner, x, y, vx, vy) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:10;border-radius:9999px;will-change:transform;width:9px;height:9px;background:#fde047;box-shadow:0 0 8px #f59e0b,0 0 18px #f97316';
    document.body.appendChild(el);
    flares.push({ el, team: owner.team, x, y, vx, vy, life: FLARE_LIFE, hits: FLARE_HITS });
}

function updateFlares() {
    for (let i = flares.length - 1; i >= 0; i--) {
        const f = flares[i];
        f.x += f.vx; f.y += f.vy;
        f.vx *= 0.97; f.vy *= 0.97;
        if (--f.life <= 0) { f.el.remove(); flares.splice(i, 1); continue; }
        const sx = f.x - cam.x, sy = window.innerHeight - (f.y - cam.y);
        f.el.style.transform = `translate(${sx - 4.5}px, ${sy - 4.5}px)`;
        f.el.style.opacity = f.life < 45 ? String(f.life / 45) : '1';
    }
}

// ================= TEKS MELAYANG (skor, pickup, info) =================
function floatText(text, x, y, color = '#fde047', big = false) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;z-index:25;will-change:transform,opacity;font:bold ${big ? 15 : 12}px monospace;color:${color};text-shadow:0 0 6px ${color},0 1px 2px #000;white-space:nowrap`;
    document.body.appendChild(el);
    floaters.push({ el, x, y, life: 55, max: 55 });
    if (floaters.length > 30) floaters.shift().el.remove();
}

function updateFloaters() {
    for (let i = floaters.length - 1; i >= 0; i--) {
        const f = floaters[i];
        f.y += 0.7;
        if (--f.life <= 0) { f.el.remove(); floaters.splice(i, 1); }
    }
}

function renderFloaters() {
    const h = window.innerHeight;
    for (const f of floaters) {
        f.el.style.transform = `translate(${f.x - cam.x}px, ${h - (f.y - cam.y)}px) translate(-50%, -50%)`;
        f.el.style.opacity = Math.min(1, f.life / 20);
    }
}

// ================= PERINGATAN MISIL =================
const ARROWS = ['→', '↗', '↑', '↖', '←', '↙', '↓', '↘'];
function updateMissileAlert() {
    const on = !player.dead && threat.count > 0;
    if (missileAlert) missileAlert.classList.toggle('hidden', !on);
    if (!on) return;
    const idx = (Math.round(Math.atan2(threat.dy, threat.dx) / (Math.PI / 4)) + 8) % 8;
    const flareReady = gameTime >= player.flareCdUntil;
    setTxt(missileAlertText, `⚠ MISIL ${ARROWS[idx]} ${Math.round(threat.dist / 10)}m`
        + (threat.count > 1 ? ` ×${threat.count}` : '') + (flareReady ? ' · PAKAI FLARE' : ''));
}

// ================= PICKUP =================
const PICKUP_TYPES = {
    health: { color: '#22c55e', icon: '<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" fill="#fff"/>' },
    mag: { color: '#eab308', icon: '<rect x="8" y="3" width="8" height="18" rx="1.5" fill="#fff"/><path d="M8 8h8M8 12h8M8 16h8" stroke="#a16207" stroke-width="1.5"/>' },
    life: { color: '#ef4444', icon: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#fff"/>' },
    multi: { color: '#14b8a6', icon: '<path d="M12 2l4 8h-3v12h-2V10H8l4-8zM4 6l3 6H5v10H3V12H1l3-6zm16 0l3 6h-2v10h-2V12h-2l3-6z" fill="#fff"/>' },
    laser: { color: '#a855f7', icon: '<path d="M11 2h2v20h-2zM7 6h10v2H7zM7 16h10v2H7z" fill="#fff"/>' },
    homing: { color: '#f97316', icon: '<path d="M12 2l4 8-4-2-4 2 4-8zm0 8l3 12-3-2-3 2 3-12z" fill="#fff"/>' },
};

// Bobot disesuaikan kebutuhan player: hull rendah -> health lebih sering, dst.
function rollDropType(only = null) {
    const w = { ...DROP_WEIGHTS };
    if (!player.dead) {
        if (player.hull < player.maxHp * 0.5) w.health *= 2.5;
        if (player.mags < 2) w.mag *= 2.5;
        if (player.lives < 2) w.life *= 2.5;
    }
    const entries = Object.entries(w).filter(([t]) => !only || only.includes(t));
    let r = Math.random() * entries.reduce((s, [, v]) => s + v, 0);
    for (const [type, v] of entries) { if ((r -= v) < 0) return type; }
    return entries[0][0];
}

// Sumber pickup: kill musuh (+pity), meteor, hadiah wave, dan supply darurat
function dropNearPlayer(type, minD = 140, maxD = 220) {
    if (player.dead) return;
    const a = Math.random() * Math.PI * 2, d = minD + Math.random() * (maxD - minD);
    spawnPickup(player.x + Math.cos(a) * d, player.y + Math.sin(a) * d, type);
}

function meteorDrop(m) {
    const ch = METEOR_DROP_CHANCE[m.radius] ?? (m.radius >= 12 ? 0.12 : m.radius >= 8 ? 0.06 : 0.03);
    if (Math.random() < ch) spawnPickup(m.x, m.y, rollDropType(['health', 'mag']));
}

let nextSupplyAt = 0;
function supplyCheck() {
    if (player.dead || gameTime < nextSupplyAt) return;
    let type = null;
    if (player.hull < player.maxHp * SUPPLY_HULL && !pickups.some(k => k.type === 'health')) type = 'health';
    else if (player.mags < 1 && !pickups.some(k => k.type === 'mag')) type = 'mag';
    if (!type) return;
    nextSupplyAt = gameTime + SUPPLY_COOLDOWN;
    dropNearPlayer(type, 160, 240);
    floatText(`SUPPLY DARURAT: ${type === 'health' ? 'HULL' : 'MAG'}`, player.x, player.y + 60, '#86efac', true);
}

// Pickup hanya muncul dari musuh yang hancur (x, y = posisi musuh)
function spawnPickup(x, y, forceType = null) {
    if (pickups.length >= PICKUP_MAX) {   // penuh: buang yang paling lama
        const old = pickups.shift();
        if (old.el) old.el.remove();
    }
    const type = forceType || rollDropType();
    const c = PICKUP_TYPES[type];
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;z-index:10;will-change:transform;width:${PICKUP_RADIUS * 2}px;height:${PICKUP_RADIUS * 2}px`;
    el.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <rect x="1" y="1" width="22" height="22" rx="5" fill="${c.color}" stroke="#fff" stroke-opacity=".7"/>${c.icon}</svg>`;
    document.body.appendChild(el);
    pickups.push({ el, type, x, y });
}

function updatePickups() {
    supplyCheck();
    // spawn acak di sekitar layar (tidak mengusir drop musuh: hanya jika slot masih ada)
    if (Math.random() < PICKUP_SPAWN_CHANCE && pickups.length < PICKUP_MAX) {
        spawnPickup(
            cam.x + (Math.random() * 2.0 - 0.5) * window.innerWidth,
            cam.y + (Math.random() * 2.0 - 0.5) * window.innerHeight,
            rollDropType(RANDOM_PICKUP_TYPES)
        );
    }
    const far = Math.hypot(window.innerWidth, window.innerHeight) * 1.8;

    for (let i = pickups.length - 1; i >= 0; i--) {
        const k = pickups[i];
        const sx = k.x - cam.x;
        const sy = window.innerHeight - (k.y - cam.y);
        if (k.el) k.el.style.transform = `translate(${sx - PICKUP_RADIUS}px, ${sy - PICKUP_RADIUS}px)`;

        if (Math.hypot(k.x - (cam.x + window.innerWidth / 2), k.y - (cam.y + window.innerHeight / 2)) > far) {
            if (k.el) k.el.remove(); pickups.splice(i, 1);
            continue;
        }
        const taker = ships.find(s => !s.dead && s.canUse(k.type) && Math.hypot(s.x - k.x, s.y - k.y) < s.radius + PICKUP_RADIUS);
        if (taker) {
            taker.apply(k.type);
            if (k.el) k.el.remove(); pickups.splice(i, 1);
        }
    }
}

// ================= GAME LOOP =================
function updateGame() {
    gameTime += STEP;

    // respawn player
    if (player.dead && player.lives > 0 && player.respawnAt && gameTime >= player.respawnAt) {
        player.respawnAt = 0;
        player.reset(player.x, player.y, 0);
        player.shieldCdUntil = 0;
        player.activateShield();
    }

    // wave berikutnya (tunggu sampai player hidup lagi)
    if (waveState === 'CLEARED' && waveStartAt && gameTime >= waveStartAt && !player.dead && player.lives > 0) {
        waveStartAt = 0;
        startWave(currentWave + 1);
    }

    if (Math.random() < 0.04) spawnMeteor();

    if (waveState === 'PLAYING') spawnDue();

    for (const s of [...ships]) {
        if (s.dead) continue;
        if (s.expireAt && gameTime >= s.expireAt) { createExplosion(s.x, s.y, 14); s.remove(); continue; }   // ally spesialis pergi
        s.isPlayer ? s.readKeys() : s.ai();
        s.step(gameTime);
        if (s.botType === 'kamikaze' && !s.dead) s.kamikazeCheck();
    }

    const live = ships.filter(s => !s.dead);
    for (let i = 0; i < live.length; i++) {
        for (let j = i + 1; j < live.length; j++) {
            const imp = resolveCollision(live[i], live[j], 0.8);
            if (imp > 0 && live[i].team !== live[j].team) {
                live[i].takeDamage(Math.round(imp * 1.5));
                live[j].takeDamage(Math.round(imp * 1.5));
            }
        }
    }

    updatePickups();
    updateFlares();
    updateFloaters();
    updateBullets();
    updateMeteors();
    updateParticles();
}

function gameLoop(ts) {
    const dt = Math.min(ts - (lastTs || ts), 100);
    lastTs = ts;

    if (gameStarted && !isPaused) {
        accumulator += dt;
        let steps = 0;
        while (accumulator >= STEP && steps < 5) {
            updateGame();
            accumulator -= STEP;
            steps++;
        }
        if (steps === 5) accumulator = 0;   // buang backlog kalau frame terlalu lambat
    } else {
        accumulator = 0;
    }

    updateCamera();
    updateBackground();
    ships.forEach(s => s.render());
    renderBeams();
    renderFloaters();
    updateEffects();
    updateCounts();
    requestAnimationFrame(gameLoop);
}

// ================= KAMERA & LATAR =================
const SPECTATE_SPEED = 14;
function updateCamera() {
    if (player.dead) {
        if (keys.ArrowLeft || keys.KeyA) cam.x -= SPECTATE_SPEED;
        if (keys.ArrowRight || keys.KeyD) cam.x += SPECTATE_SPEED;
        if (keys.ArrowUp || keys.KeyW) cam.y += SPECTATE_SPEED;
        if (keys.ArrowDown || keys.KeyS) cam.y -= SPECTATE_SPEED;
        if (joy.active) { cam.x += joy.dx * SPECTATE_SPEED; cam.y += joy.dy * SPECTATE_SPEED; }
        return;
    }
    cam.x = player.x - window.innerWidth / 2;
    cam.y = player.y - window.innerHeight / 2;
}

function makeCanvas(z) {
    const c = document.createElement('canvas');
    c.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;z-index:${z}`;
    document.body.appendChild(c);
    return c;
}
const bgCanvas = makeCanvas(0), fxCanvas = makeCanvas(30);
const bgCtx = bgCanvas.getContext('2d'), fxCtx = fxCanvas.getContext('2d');
function resizeCanvases() {
    for (const c of [bgCanvas, fxCanvas]) { c.width = window.innerWidth; c.height = window.innerHeight; }
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

const STAR_TILE = 2400;
const STAR_LAYERS = [{ k: 0.2, size: 1, a: 0.5 }, { k: 0.4, size: 1.5, a: 0.7 }, { k: 0.7, size: 2, a: 0.9 }];
const stars = Array.from({ length: 280 }, () => ({
    x: Math.random() * STAR_TILE, y: Math.random() * STAR_TILE,
    L: STAR_LAYERS[Math.floor(Math.random() * STAR_LAYERS.length)],
}));

function updateBackground() {
    const w = bgCanvas.width, h = bgCanvas.height;
    bgCtx.clearRect(0, 0, w, h);
    bgCtx.fillStyle = '#fff';
    for (const s of stars) {
        const sx = (((s.x - cam.x * s.L.k) % STAR_TILE) + STAR_TILE) % STAR_TILE;
        const sy = (((s.y + cam.y * s.L.k) % STAR_TILE) + STAR_TILE) % STAR_TILE;
        bgCtx.globalAlpha = s.L.a;
        for (let ox = sx; ox < w; ox += STAR_TILE)
            for (let oy = sy; oy < h; oy += STAR_TILE) bgCtx.fillRect(ox, oy, s.L.size, s.L.size);
    }
    bgCtx.globalAlpha = 1;
}

function updateParticles() {
    for (const p of particles) { p.x += p.vx; p.y += p.vy; p.op -= 0.035; }
}

function updateEffects() {
    const h = fxCanvas.height;
    fxCtx.clearRect(0, 0, fxCanvas.width, h);

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.op <= 0) { particles[i] = particles[particles.length - 1]; particles.pop(); continue; }
        fxCtx.globalAlpha = p.op;
        fxCtx.fillStyle = p.color;
        fxCtx.fillRect(p.x - cam.x - p.size / 2, h - (p.y - cam.y) - p.size / 2, p.size, p.size);
    }

    fxCtx.globalAlpha = 1;
    drawShipIndicators();
}

function drawShipIndicators() {
    const w = fxCanvas.width, h = fxCanvas.height, cx = w / 2, cy = h / 2, pad = 28;
    fxCtx.font = 'bold 10px monospace';
    fxCtx.textAlign = 'center';
    fxCtx.textBaseline = 'middle';

    for (const s of ships) {
        if (s.dead || s.isPlayer) continue;
        const sx = s.x - cam.x, sy = h - (s.y - cam.y);
        if (sx > -20 && sx < w + 20 && sy > -20 && sy < h + 20) continue;

        const dx = sx - cx, dy = sy - cy;
        const t = Math.min((cx - pad) / Math.abs(dx || 0.001), (cy - pad) / Math.abs(dy || 0.001));
        const px = cx + dx * t, py = cy + dy * t;
        const ang = Math.atan2(dy, dx);

        const isAlly = s.team === PLAYER_TEAM;

        fxCtx.save();
        fxCtx.translate(px, py);
        fxCtx.rotate(ang);
        fxCtx.fillStyle = isAlly ? '#3b82f6' : (s.c.body || '#ef4444');
        fxCtx.strokeStyle = '#fff';
        fxCtx.lineWidth = 1.5;
        fxCtx.beginPath();
        fxCtx.moveTo(8, 0); fxCtx.lineTo(-5, -5); fxCtx.lineTo(-5, 5); fxCtx.closePath();
        fxCtx.fill(); fxCtx.stroke();
        fxCtx.restore();

        fxCtx.fillStyle = isAlly ? '#93c5fd' : '#fca5a5';
        fxCtx.fillText(`${Math.round(Math.hypot(dx, dy) / 10)}m`, px - Math.cos(ang) * 22, py - Math.sin(ang) * 22);
    }
}

// ================= INDIKATOR MUSUH / KAWAN =================
let lastCounts = '';
function updateCounts() {
    let enemy = 0, ally = 0;
    for (const s of ships) {
        if (s.dead || s.isPlayer) continue;
        if (s.team === PLAYER_TEAM) ally++; else enemy++;
    }
    const key = `${enemy},${ally}`;
    if (key === lastCounts) return;
    lastCounts = key;
    if (enemyCount) enemyCount.textContent = enemy;
    if (allyCount) allyCount.textContent = ally;
}

// ================= INPUT KEYBOARD & TOUCH =================
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') e.preventDefault();
    if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
        return;
    }
    keys[e.code] = true;
    if (!isPaused) {
        if (e.code === 'KeyE' && player) player.activateShield();
        if (e.code === 'KeyR') requestBackup();
    }
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// KONTROL SENTUH SUPPORT HOLD (TERMASUK TOMBOL LASER & MISSILE)
document.querySelectorAll('[data-key]').forEach(btn => {
    const code = btn.dataset.key;
    const set = (v) => (e) => { 
        e.preventDefault(); 
        keys[code] = v; 
        if (v && !isPaused) {
            if (code === 'KeyE' && player) player.activateShield();
            if (code === 'KeyR') requestBackup();
        }
    };
    btn.addEventListener('pointerdown', (e) => { btn.setPointerCapture(e.pointerId); set(true)(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => btn.addEventListener(ev, set(false)));
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
});

if (btnShield) {
    btnShield.addEventListener('pointerdown', (e) => { e.preventDefault(); if (player && !isPaused) player.activateShield(); });
}
if (btnBackup) {
    btnBackup.addEventListener('pointerdown', (e) => { e.preventDefault(); if (!isPaused) requestBackup(); });
}

// LOGIKA SLIDER KECEPATAN
if (btnSpeed && speedSliderBox) {
    btnSpeed.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        speedSliderBox.classList.toggle('hidden');
    });
}

if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        playerSpeedFactor = val / 100;
        if (speedText) speedText.textContent = `${val}%`;
        if (sliderValText) sliderValText.textContent = `${val}%`;
    });
}

window.addEventListener('pointerdown', (e) => {
    if (speedSliderBox && !speedSliderBox.contains(e.target) && e.target !== btnSpeed && !btnSpeed.contains(e.target)) {
        speedSliderBox.classList.add('hidden');
    }
});

if (pauseBtn) {
    pauseBtn.addEventListener('click', (e) => { e.preventDefault(); togglePause(); });
}
if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => { e.preventDefault(); resumeGame(); });
}
if (pauseRestartBtn) {
    pauseRestartBtn.addEventListener('click', (e) => { e.preventDefault(); resetGame(); });
}

// ================= JOYSTICK VIRTUAL =================
const joyBase = $('joy-base'), joyKnob = $('joy-knob');
const JOY_MAX_R = 44;
let joyTouchId = null;

function updateJoyPos(clientX, clientY) {
    if (!joyBase) return;
    const rect = joyBase.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let x = clientX - centerX;
    let y = clientY - centerY;
    const dist = Math.hypot(x, y);

    if (dist > JOY_MAX_R) {
        x = (x / dist) * JOY_MAX_R;
        y = (y / dist) * JOY_MAX_R;
    }

    joy.dx = x / JOY_MAX_R;
    joy.dy = -y / JOY_MAX_R;

    if (joyKnob) joyKnob.style.transform = `translate(${x}px, ${y}px)`;
}

function resetJoy() {
    joyTouchId = null;
    joy.active = false;
    joy.dx = 0; joy.dy = 0;
    if (joyKnob) joyKnob.style.transform = 'translate(0px, 0px)';
}

if (joyBase) {
    joyBase.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (joyTouchId !== null || isPaused) return;
        const touch = e.changedTouches[0];
        joyTouchId = touch.identifier;
        joy.active = true;
        updateJoyPos(touch.clientX, touch.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (joyTouchId === null || isPaused) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === joyTouchId) {
                updateJoyPos(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
                break;
            }
        }
    }, { passive: false });

    const endTouchHandler = (e) => {
        if (joyTouchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === joyTouchId) {
                resetJoy();
                break;
            }
        }
    };

    window.addEventListener('touchend', endTouchHandler);
    window.addEventListener('touchcancel', endTouchHandler);

    joyBase.addEventListener('mousedown', (e) => {
        if (joy.active || isPaused) return;
        joy.active = true;
        updateJoyPos(e.clientX, e.clientY);

        const onMouseMove = (me) => updateJoyPos(me.clientX, me.clientY);
        const onMouseUp = () => {
            resetJoy();
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });
}

// ================= TOGGLE HUD =================
const hudDetails = $('hud-details');
const hudArrow = $('hud-arrow');
const hudToggle = $('hud-toggle');

if (hudToggle && hudDetails) {
    hudToggle.addEventListener('click', () => {
        const isHidden = hudDetails.classList.contains('hidden');
        hudDetails.classList.toggle('hidden', !isHidden);
        if (hudArrow) hudArrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });
}

// Fullscreen
const fsBtn = $('fs-btn');
const canFullscreen = !!document.documentElement.requestFullscreen;
async function goFullscreen() {
    try {
        if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        if (screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape');
    } catch (err) { /* ignore */ }
}
if (!canFullscreen && fsBtn) fsBtn.style.display = 'none';
if (fsBtn) fsBtn.addEventListener('click', goFullscreen);
document.addEventListener('fullscreenchange', () => {
    if (fsBtn) fsBtn.style.display = (!canFullscreen || document.fullscreenElement) ? 'none' : '';
});
if (canFullscreen && window.matchMedia('(pointer: coarse)').matches) {
    document.addEventListener('pointerup', goFullscreen, { once: true });
}

// Handler Start Mission & Restart
function handleStartMission(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (gameStarted) return;
    if (startScreen) startScreen.classList.add('hidden');
    gameStarted = true;
    startWave(1);
}

if (startBtn) {
    startBtn.addEventListener('pointerdown', handleStartMission);
    startBtn.addEventListener('click', handleStartMission);
}

function handleResetGame(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    resetGame();
    if (e && e.currentTarget) e.currentTarget.blur();
}

const resetBtn = $('reset-btn');
if (resetBtn) {
    resetBtn.addEventListener('pointerdown', handleResetGame);
    resetBtn.addEventListener('click', handleResetGame);
}

player.reset(0, 0, 0); updateCamera();
requestAnimationFrame(gameLoop);
