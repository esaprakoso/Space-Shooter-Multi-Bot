// ================= KONSTANTA =================
const PLAYER_TEAM = 'blue';
const W = 40, H = 48, RADIUS = 18, MASS = 25;
const MAX_FUEL = 100, BOOST_MAX_FUEL = 160, UNLOCK = 30, MAX_HULL = 100;
const FRICTION = 0.985, ANG_FRICTION = 0.93;
const MAX_METEORS = 10;
const BULLET_DAMAGE = 15;
const BULLET_LIFE = 100;
const BULLET_MASS = 2;
const METEOR_MAX_SPEED = 5;
const METEOR_TYPES = [
    { r: 8, hp: 15 },
    { r: 12, hp: 45 },
    { r: 18, hp: 90 },
];
const PICKUP_MAX = 6;
const PICKUP_SPAWN_CHANCE = 0.006;
const PICKUP_RADIUS = 14;
const PICKUP_SEEK = 700;
const HEAL_AMOUNT = 30;
const MAG_AMOUNT = 1;
const BOOST_DURATION = 10000;
const MULTISHOT_DURATION = 8000;
const SHIELD_DURATION = 5000;
const SHIELD_COOLDOWN = 15000;
const AVOID_METEOR = 80;
const AVOID_SHIP = 60;

const TEAMS = {
    blue: { body: '#3B82F6', cockpit: '#93C5FD', rcs: '#38BDF8', glow: '59,130,246', bullet: '#22d3ee' },
    red: { body: '#EF4444', cockpit: '#FCA5A5', rcs: '#EF4444', glow: '239,68,68', bullet: '#f87171' },
};

const BOT_TYPES = {
    scout: { body: '#F43F5E', cockpit: '#FECDD3', rcs: '#FB7185', glow: '244,63,94', bullet: '#fb7185', hp: 60, radius: 14, turn: 0.3, main: 0.18, rev: 0.12, magSize: 8 },
    standard: { body: '#EF4444', cockpit: '#FCA5A5', rcs: '#EF4444', glow: '239,68,68', bullet: '#f87171', hp: 100, radius: 18, turn: 0.2, main: 0.12, rev: 0.1, magSize: 6 },
    heavy: { body: '#991B1B', cockpit: '#F87171', rcs: '#DC2626', glow: '153,27,27', bullet: '#ef4444', hp: 200, radius: 24, turn: 0.12, main: 0.08, rev: 0.06, magSize: 12 },
};

const ALLY_BOT_COLORS = {
    scout: { body: '#38BDF8', cockpit: '#BAE6FD', rcs: '#0284C7', glow: '56,189,248', bullet: '#38bdf8' },
    standard: { body: '#3B82F6', cockpit: '#93C5FD', rcs: '#38BDF8', glow: '59,130,246', bullet: '#22d3ee' },
    heavy: { body: '#1D4ED8', cockpit: '#93C5FD', rcs: '#2563EB', glow: '29,78,216', bullet: '#60a5fa' },
};

const STATS = {
    player: { turn: 0.35, main: 0.25, rev: 0.08, rcsUse: 0.4, mainUse: 0.5, mainRegen: 0.25, cooldown: 120, wallDamage: true, magSize: 20, startMags: 2, maxMags: 5, reload: 1500 },
};

// ================= DOM HUD PLAYER =================
const $ = (id) => document.getElementById(id);
const gameOverBox = $('game-over-box');
const statusTitle = $('status-title');
const hullBar = $('hull-bar'), hullText = $('hull-text');
const mainFuelBar = $('main-fuel-bar'), mainFuelText = $('main-fuel-text');
const rcsFuelBar = $('rcs-fuel-bar'), rcsFuelText = $('rcs-fuel-text');
const ammoBar = $('ammo-bar'), ammoText = $('ammo-text');
const enemyCount = $('enemy-count'), allyCount = $('ally-count');
const waveCount = $('wave-count');
const waveBanner = $('wave-banner');
const bannerTitle = $('banner-title');
const bannerSubtitle = $('banner-subtitle');
const shieldCdText = $('shield-cd-text');
const backupCdText = $('backup-cd-text');
const btnShield = $('btn-shield');
const btnBackup = $('btn-backup');
const startScreen = $('start-screen');
const startBtn = $('start-btn');

// ================= STATE =================
const keys = {};
const joy = { active: false, dx: 0, dy: 0 };
const ships = [];
const bullets = [];
const meteors = [];
const pickups = [];
const cam = { x: 0, y: 0 };

let gameStarted = false;
let currentWave = 1;
let waveState = 'PLAYING';
let backupCdUntil = 0;

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

const particles = [];
const MAX_PARTICLES = 400;
const PARTICLE_COLORS = ['#f97316', '#ef4444', '#eab308', '#38bdf8', '#a855f7', '#14b8a6', '#ffffff'];

function createExplosion(cx, cy, count = 24) {
    for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
        const a = Math.random() * Math.PI * 2, sp = Math.random() * 7 + 2;
        particles.push({
            x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
            size: Math.random() * 5 + 2, op: 1,
            color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        });
    }
}

// ================= KOMPONEN: SHIP =================
class Ship {
    constructor(team, isPlayer = false, botType = 'standard') {
        this.team = team;
        this.isPlayer = isPlayer;
        this.botType = botType;

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
            rcsUse: 0.4, mainUse: 0.4, mainRegen: 0.3,
            cooldown: 900, wallDamage: false,
            magSize: BOT_TYPES[botType].magSize,
            startMags: 3, maxMags: 5, reload: 1800
        };

        this.radius = isPlayer ? RADIUS : BOT_TYPES[botType].radius;
        this.mass = isPlayer ? MASS : (this.radius * 1.3);
        this.maxHp = isPlayer ? MAX_HULL : BOT_TYPES[botType].hp;

        this.joyHold = 0;
        this.shieldUntil = 0;
        this.shieldCdUntil = 0;
        this.multishotUntil = 0;

        this.buildPlane();
        if (!isPlayer) this.buildHud();
    }

    buildPlane() {
        const c = this.c;
        const el = document.createElement('div');
        el.className = 'fixed left-0 top-0 w-10 h-12 pointer-events-none z-10';
        el.style.willChange = 'transform';
        el.innerHTML = `
        <div data-fx="shield-aura" class="absolute -inset-3 rounded-full border-2 border-cyan-400 bg-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" style="display:none"></div>
        <svg viewBox="-8 -6 40 42" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full"
             style="filter:drop-shadow(0 0 8px rgba(${c.glow},0.8))">
            <path data-fx="thrust" d="M9 28L12 38L15 28Z" fill="#F97316" style="display:none"/>
            <path data-fx="left" d="M1 22L-5 24L1 26Z" fill="${c.rcs}" style="display:none"/>
            <path data-fx="right" d="M23 22L29 24L23 26Z" fill="${c.rcs}" style="display:none"/>
            <g data-fx="rev" style="display:none">
                <path d="M4 12L-1 6L6 9Z" fill="${c.rcs}"/>
                <path d="M20 12L25 6L18 9Z" fill="${c.rcs}"/>
            </g>
            <path d="M12 2L24 26L12 21L0 26L12 2Z" fill="${c.body}"/>
            <path d="M12 6L16 16L12 14L8 16L12 6Z" fill="${c.cockpit}"/>
        </svg>`;
        document.body.appendChild(el);
        this.el = el;
        this.fxEls = {};
        this._fx = {};
        el.querySelectorAll('[data-fx]').forEach(n => this.fxEls[n.dataset.fx] = n);
    }

    buildHud() {
        const hud = document.createElement('div');
        hud.className = 'fixed left-0 top-0 w-14 z-20 pointer-events-none';
        hud.innerHTML = `
        <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden border border-gray-700">
            <div class="h-full w-full transition-all duration-150" style="background:${this.c.body}"></div>
        </div>
        <div class="w-full bg-gray-800 h-1 rounded-full overflow-hidden mt-0.5">
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
            dead: false, invuln: false, lastShot: 0, boostUntil: 0, joyHold: 0,
            shieldUntil: 0, shieldCdUntil: 0, multishotUntil: 0,
            input: {}, fx: {},
        });
        if (this.el) {
            this.el.classList.remove('hidden');
            this.el.style.opacity = '1';
        }
    }

    activateShield() {
        const now = performance.now();
        if (now >= this.shieldCdUntil) {
            this.shieldUntil = now + SHIELD_DURATION;
            this.shieldCdUntil = now + SHIELD_COOLDOWN;
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
        };

        if (k.KeyE) {
            this.activateShield();
            keys.KeyE = false;
        }

        if (k.KeyR) {
            requestBackup();
            keys.KeyR = false;
        }

        if (joy.active && Math.hypot(joy.dx, joy.dy) > 0.25) {
            let diff = (Math.atan2(joy.dx, joy.dy) * 180) / Math.PI - this.angle;
            while (diff < -180) diff += 360;
            while (diff > 180) diff -= 360;

            const absDiff = Math.abs(diff);

            if (absDiff > 130) {
                this.input.reverse = true;
                this.joyHold = 0;

                let revTurnDiff = diff > 0 ? 180 - diff : -180 - diff;
                if (revTurnDiff < -18) this.input.left = true;
                else if (revTurnDiff > 18) this.input.right = true;

            } else if (absDiff < 50) {
                const pd = diff - this.vAngle * 10;
                if (pd < -4) this.input.left = true;
                else if (pd > 4) this.input.right = true;

                this.joyHold = (this.joyHold || 0) + 1;
                if (this.joyHold > 12) this.input.thrust = true;
            } else {
                const pd = diff - this.vAngle * 10;
                if (pd < -4) this.input.left = true;
                else if (pd > 4) this.input.right = true;
                this.joyHold = 0;
            }
        } else {
            this.joyHold = 0;
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
        let ax = 0, ay = 0;
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
        const t = pk || this.nearestEnemy();
        if (!t) return;

        const dx = t.x - this.x, dy = t.y - this.y;
        const dist = Math.hypot(dx, dy);
        let diff = (Math.atan2(dx, dy) * 180) / Math.PI - this.angle;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;

        if (Math.abs(diff) > 6) { i.left = diff < 0; i.right = diff > 0; }
        if (pk) { if (Math.abs(diff) < 40) i.thrust = true; return; }
        if (dist > 320) i.thrust = true;
        else if (dist < 180) i.reverse = true;
        if (Math.abs(diff) < 8 && dist < 450) i.shoot = true;
    }

    step(ts) {
        const p = this.p, i = this.input;

        const isBoosted = !!(this.boostUntil && performance.now() < this.boostUntil);
        const maxLimit = isBoosted ? BOOST_MAX_FUEL : MAX_FUEL;

        if (this.rcs <= 0) this.rcsEmpty = true;
        else if (this.rcsEmpty && this.rcs >= UNLOCK) this.rcsEmpty = false;
        if (this.main <= 0) this.mainEmpty = true;
        else if (this.mainEmpty && this.main >= UNLOCK) this.mainEmpty = false;

        const left = !this.rcsEmpty && !!i.left;
        const right = !this.rcsEmpty && !!i.right;
        const rev = !this.rcsEmpty && !!i.reverse;
        const thrust = !this.mainEmpty && !!i.thrust;
        const rad = (this.angle * Math.PI) / 180;

        if (left) this.vAngle -= p.turn;
        if (right) this.vAngle += p.turn;
        if (rev) { this.vx -= p.rev * Math.sin(rad); this.vy -= p.rev * Math.cos(rad); }
        if (thrust) { this.vx += p.main * Math.sin(rad); this.vy += p.main * Math.cos(rad); }

        const rcsUsed = left || right || rev;
        this.rcs = rcsUsed ? Math.max(0, this.rcs - p.rcsUse) : Math.min(maxLimit, this.rcs + 0.3);
        this.main = thrust ? Math.max(0, this.main - p.mainUse) : Math.min(maxLimit, this.main + p.mainRegen);
        
        const isShieldActive = !!(this.shieldUntil && performance.now() < this.shieldUntil);
        this.fx = { left, right, rev, thrust, 'shield-aura': isShieldActive };

        this.vAngle *= ANG_FRICTION;
        this.angle += this.vAngle;
        this.vx *= FRICTION; this.vy *= FRICTION;
        this.x += this.vx; this.y += this.vy;

        if (this.reloadUntil && ts >= this.reloadUntil) {
            this.reloadUntil = 0; this.ammo = p.magSize; this.mags--;
        }
        if (!this.reloadUntil && this.ammo < 1 && this.mags > 0) this.reloadUntil = ts + p.reload;

        if (i.shoot && !this.reloadUntil && this.ammo >= 1 && ts - this.lastShot > p.cooldown) {
            this.shoot();
            this.ammo -= 1;
            this.lastShot = ts;
        }
    }

    shoot() {
        const isMulti = !!(this.multishotUntil && performance.now() < this.multishotUntil);
        const angles = isMulti ? [this.angle - 12, this.angle, this.angle + 12] : [this.angle];

        angles.forEach(ang => {
            const rad = (ang * Math.PI) / 180;
            const noseOffset = 16;
            const spawnX = this.x + Math.sin(rad) * noseOffset;
            const spawnY = this.y + Math.cos(rad) * noseOffset;

            const el = document.createElement('div');
            el.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;z-index:10;border-radius:9999px;will-change:transform;width:8px;height:16px;background:${this.c.bullet};box-shadow:0 0 6px ${this.c.bullet}`;
            document.body.appendChild(el);
            bullets.push({
                el, owner: this, angle: ang, life: BULLET_LIFE,
                x: spawnX, y: spawnY,
                vx: this.vx + 14 * Math.sin(rad), vy: this.vy + 14 * Math.cos(rad),
            });
        });
    }

    takeDamage(amount) {
        const isShieldActive = !!(this.shieldUntil && performance.now() < this.shieldUntil);
        if (isShieldActive) {
            createExplosion(this.x, this.y, 2);
            return;
        }

        if (this.invuln || this.dead || amount <= 0) return;
        this.hull = Math.max(0, this.hull - amount);
        createExplosion(this.x, this.y, 10);
        if (this.hull <= 0) return this.destroy();

        this.invuln = true;
        if (this.el) this.el.style.opacity = '0.4';
        setTimeout(() => { if (this.el) this.el.style.opacity = '1'; this.invuln = false; }, 800);
    }

    destroy() {
        this.dead = true;
        createExplosion(this.x, this.y, 36);
        if (this.isPlayer) {
            if (this.el) this.el.classList.add('hidden');
            showStatus('YOU LOST! GESER: ARAH / WASD', 'text-red-500');
        } else {
            this.remove();
            checkWaveProgress();
        }
    }

    remove() {
        if (this.el) this.el.remove();
        if (this.hud) this.hud.remove();
        const idx = ships.indexOf(this);
        if (idx >= 0) ships.splice(idx, 1);
    }

    canUse(type) {
        if (type === 'health') return this.hull < this.maxHp;
        if (type === 'mag') return this.mags < this.p.maxMags;
        if (type === 'boost') return !this.boostUntil || performance.now() > this.boostUntil;
        if (type === 'multi') return !this.multishotUntil || performance.now() > this.multishotUntil;
        return true;
    }

    apply(type) {
        if (type === 'health') this.hull = Math.min(this.maxHp, this.hull + HEAL_AMOUNT);
        else if (type === 'mag') this.mags = Math.min(this.p.maxMags, this.mags + MAG_AMOUNT);
        else if (type === 'boost') {
            this.boostUntil = performance.now() + BOOST_DURATION;
            this.main = BOOST_MAX_FUEL;
            this.rcs = BOOST_MAX_FUEL;
            createExplosion(this.x, this.y, 16);
        } else if (type === 'multi') {
            this.multishotUntil = performance.now() + MULTISHOT_DURATION;
            createExplosion(this.x, this.y, 16);
        }
    }

    seekPickup() {
        let best = null, bestD = PICKUP_SEEK;
        for (const k of pickups) {
            const isBoosted = !!(this.boostUntil && performance.now() < this.boostUntil);
            const isMulti = !!(this.multishotUntil && performance.now() < this.multishotUntil);
            const need = k.type === 'health' ? this.hull < (this.maxHp * 0.6) : k.type === 'mag' ? this.mags < 1 : k.type === 'boost' ? !isBoosted : !isMulti;
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
            const isBoosted = !!(this.boostUntil && performance.now() < this.boostUntil);
            const isMulti = !!(this.multishotUntil && performance.now() < this.multishotUntil);
            const maxLimit = isBoosted ? BOOST_MAX_FUEL : MAX_FUEL;

            const noAmmo = !this.reloadUntil && this.ammo < 1 && this.mags < 1;
            const ammoTxt = noAmmo ? 'NO AMMO' : this.reloadUntil ? `RELOAD · MAG ${this.mags}` : `${this.ammo}/${this.p.magSize} · MAG ${this.mags}`;

            setW(hullBar, `${(this.hull / MAX_HULL) * 100}%`);
            setTxt(hullText, `${Math.round(this.hull)}%`);

            setW(mainFuelBar, `${(this.main / maxLimit) * 100}%`);
            setTxt(mainFuelText, `${Math.round(this.main)}%${isBoosted ? ' [BOOST]' : ''}`);
            if (mainFuelBar) mainFuelBar.style.background = isBoosted ? '#a855f7' : '';

            setW(rcsFuelBar, `${(this.rcs / maxLimit) * 100}%`);
            setTxt(rcsFuelText, `${Math.round(this.rcs)}%${isBoosted ? ' [BOOST]' : ''}`);
            if (rcsFuelBar) rcsFuelBar.style.background = isBoosted ? '#a855f7' : '';

            setW(ammoBar, `${(this.ammo / this.p.magSize) * 100}%`);
            if (ammoBar) {
                ammoBar.style.opacity = this.reloadUntil ? '0.4' : '1';
                ammoBar.style.background = isMulti ? '#14b8a6' : '';
            }
            setTxt(ammoText, `${ammoTxt}${isMulti ? ' [MULTI]' : ''}`);

            setTxt($('hud-status-mini'), `${Math.round(this.hull)}% HP · ${ammoTxt}${isMulti ? ' [MULTI]' : ''}`);

            // UI Button Shield & CD
            const now = performance.now();
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

            // UI Button Backup & CD
            if (now < backupCdUntil) {
                setTxt(backupCdText, `${Math.ceil((backupCdUntil - now) / 1000)}s`);
                if (btnBackup) btnBackup.style.opacity = '0.4';
            } else {
                setTxt(backupCdText, 'READY');
                if (btnBackup) btnBackup.style.opacity = '1';
            }

        } else if (this.hud) {
            this.hud.style.transform = `translate(${sx - 28}px, ${sy - H / 2 - 16}px)`;
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
    if (!gameStarted || player.dead) return;
    const now = performance.now();
    if (now < backupCdUntil) return;

    const cdDuration = 15000 + (currentWave - 1) * 5000;
    backupCdUntil = now + cdDuration;

    const allyType = currentWave >= 5 ? 'heavy' : currentWave >= 3 ? 'standard' : 'scout';
    spawnBot(PLAYER_TEAM, allyType);
    createExplosion(player.x, player.y, 10);
}

function startWave(waveNum) {
    currentWave = waveNum;
    waveState = 'PLAYING';
    if (waveCount) waveCount.textContent = currentWave;
    if (waveBanner) waveBanner.classList.add('hidden');

    let scoutCount = Math.floor(waveNum / 2);
    let heavyCount = Math.floor((waveNum - 1) / 3);
    let standardCount = Math.max(1, waveNum - scoutCount - heavyCount);

    for (let i = 0; i < scoutCount; i++) spawnBot('red', 'scout');
    for (let i = 0; i < standardCount; i++) spawnBot('red', 'standard');
    for (let i = 0; i < heavyCount; i++) spawnBot('red', 'heavy');
}

function checkWaveProgress() {
    const enemiesLeft = ships.filter(s => !s.dead && s.team !== PLAYER_TEAM).length;
    if (enemiesLeft === 0 && waveState === 'PLAYING') {
        waveState = 'CLEARED';

        if (bannerTitle) bannerTitle.textContent = `WAVE ${currentWave} CLEARED!`;
        if (bannerSubtitle) bannerSubtitle.textContent = `Persiapan untuk Wave ${currentWave + 1}...`;
        if (waveBanner) waveBanner.classList.remove('hidden');

        setTimeout(() => {
            if (!player.dead && gameStarted) startWave(currentWave + 1);
        }, 3000);
    }
}

function spawnBot(team, botType = 'standard') {
    const isAlly = team === PLAYER_TEAM;
    const rx = isAlly ? 0.3 + Math.random() * 0.4 : 0.05 + Math.random() * 0.9;
    const bot = new Ship(team, false, botType);
    bot.reset(
        cam.x + window.innerWidth * rx,
        cam.y + window.innerHeight * (isAlly ? 0.2 : 0.8),
        isAlly ? 0 : 90
    );
    ships.push(bot);
    if (!player.dead && gameOverBox) gameOverBox.classList.add('hidden');
}

function resetGame() {
    [...ships].forEach(s => { if (!s.isPlayer) s.remove(); });
    player.reset(0, 0, 0); updateCamera();

    backupCdUntil = 0;
    Object.keys(keys).forEach(k => keys[k] = false);
    bullets.forEach(b => { if (b.el) b.el.remove(); }); bullets.length = 0;
    meteors.forEach(m => { if (m.el) m.el.remove(); }); meteors.length = 0;
    pickups.forEach(k => { if (k.el) k.el.remove(); }); pickups.length = 0;

    if (gameOverBox) gameOverBox.classList.add('hidden');
    gameStarted = true;
    startWave(1);
}

// ================= METEOR =================
function spawnMeteor() {
    if (meteors.length >= MAX_METEORS) return;
    const type = METEOR_TYPES[Math.floor(Math.random() * METEOR_TYPES.length)];
    const radius = type.r;
    const speed = Math.random() * 0.4 + 0.1;
    const ang = Math.random() * Math.PI * 2;
    const sa = Math.random() * Math.PI * 2;
    const sd = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 40 + Math.random() * 150;

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

    for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx; m.y += m.vy;

        if (Math.hypot(m.x - (cam.x + window.innerWidth / 2), m.y - (cam.y + window.innerHeight / 2)) > Math.hypot(window.innerWidth, window.innerHeight)) {
            if (m.el) m.el.remove(); meteors.splice(i, 1);
            continue;
        }

        const sx = m.x - cam.x;
        const sy = window.innerHeight - (m.y - cam.y);
        if (m.el) m.el.style.transform = `translate(${sx - m.radius}px, ${sy - m.radius}px)`;

        let destroyed = false;
        for (let bi = bullets.length - 1; bi >= 0; bi--) {
            const b = bullets[bi];
            if (Math.hypot(b.x - m.x, b.y - m.y) >= m.radius + 5) continue;

            m.vx += (BULLET_MASS * (b.vx - m.vx)) / m.mass;
            m.vy += (BULLET_MASS * (b.vy - m.vy)) / m.mass;
            const sp = Math.hypot(m.vx, m.vy);
            if (sp > METEOR_MAX_SPEED) { m.vx *= METEOR_MAX_SPEED / sp; m.vy *= METEOR_MAX_SPEED / sp; }

            m.hp -= BULLET_DAMAGE;
            createExplosion(b.x, b.y, 3);
            if (b.el) b.el.remove(); bullets.splice(bi, 1);
            if (m.hp <= 0) { destroyed = true; break; }
        }
        if (destroyed) {
            createExplosion(m.x, m.y, 12 + m.radius);
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

// ================= PELURU =================
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx; b.y += b.vy;

        const sx = b.x - cam.x;
        const sy = window.innerHeight - (b.y - cam.y);
        if (b.el) b.el.style.transform = `translate(${sx - 4}px, ${sy - 8}px) rotate(${b.angle}deg)`;

        const target = ships.find(s => !s.dead && s !== b.owner && Math.hypot(b.x - s.x, b.y - s.y) < s.radius + 6);
        const out = --b.life <= 0;

        if (target || out) {
            if (b.el) b.el.remove(); bullets.splice(i, 1);
            if (target) target.takeDamage(15);
        }
    }
}

// ================= PICKUP =================
const PICKUP_TYPES = {
    health: { color: '#22c55e', icon: '<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" fill="#fff"/>' },
    mag: { color: '#eab308', icon: '<rect x="8" y="3" width="8" height="18" rx="1.5" fill="#fff"/><path d="M8 8h8M8 12h8M8 16h8" stroke="#a16207" stroke-width="1.5"/>' },
    boost: { color: '#a855f7', icon: '<path d="M13 2L3 14h7v8l10-12h-7z" fill="#fff"/>' },
    multi: { color: '#14b8a6', icon: '<path d="M12 2l4 8h-3v12h-2V10H8l4-8zM4 6l3 6H5v10H3V12H1l3-6zm16 0l3 6h-2v10h-2V12h-2l3-6z" fill="#fff"/>' },
};

function spawnPickup() {
    if (pickups.length >= PICKUP_MAX) return;
    const types = ['health', 'mag', 'boost', 'multi'];
    const type = types[Math.floor(Math.random() * types.length)];
    const c = PICKUP_TYPES[type];
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;left:0;top:0;pointer-events:none;z-index:10;will-change:transform;width:${PICKUP_RADIUS * 2}px;height:${PICKUP_RADIUS * 2}px`;
    el.innerHTML = `<svg viewBox="0 0 24 24" width="100%" height="100%">
        <rect x="1" y="1" width="22" height="22" rx="5" fill="${c.color}" stroke="#fff" stroke-opacity=".7"/>${c.icon}</svg>`;
    document.body.appendChild(el);
    pickups.push({
        el, type,
        x: cam.x + (Math.random() * 1.4 - 0.2) * window.innerWidth,
        y: cam.y + (Math.random() * 1.4 - 0.2) * window.innerHeight,
    });
}

function updatePickups() {
    if (Math.random() < PICKUP_SPAWN_CHANCE) spawnPickup();
    const far = Math.hypot(window.innerWidth, window.innerHeight) * 1.2;

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
function gameLoop(ts) {
    if (gameStarted) {
        if (Math.random() < 0.03) spawnMeteor();

        for (const s of [...ships]) {
            if (s.dead) continue;
            s.isPlayer ? s.readKeys() : s.ai();
            s.step(ts);
        }

        const live = ships.filter(s => !s.dead);
        for (let i = 0; i < live.length; i++) {
            for (let j = i + 1; j < live.length; j++) {
                const imp = resolveCollision(live[i], live[j], 0.8);
                if (imp > 0) {
                    live[i].takeDamage(Math.round(imp * 1.5));
                    live[j].takeDamage(Math.round(imp * 1.5));
                }
            }
        }

        updatePickups();
        updateBullets();
        updateMeteors();
    }

    updateCamera();
    updateBackground();
    ships.forEach(s => s.render());
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

const STAR_TILE = 1200;
const STAR_LAYERS = [{ k: 0.2, size: 1, a: 0.5 }, { k: 0.4, size: 1.5, a: 0.7 }, { k: 0.7, size: 2, a: 0.9 }];
const stars = Array.from({ length: 140 }, () => ({
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

function updateEffects() {
    const h = fxCanvas.height;
    fxCtx.clearRect(0, 0, fxCanvas.width, h);
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.op -= 0.035;
        if (p.op <= 0) { particles[i] = particles[particles.length - 1]; particles.pop(); continue; }
        fxCtx.globalAlpha = p.op;
        fxCtx.fillStyle = p.color;
        fxCtx.fillRect(p.x - cam.x - p.size / 2, h - (p.y - cam.y) - p.size / 2, p.size, p.size);
    }
    fxCtx.globalAlpha = 1;
    drawEnemyArrows();
}

function drawEnemyArrows() {
    const w = fxCanvas.width, h = fxCanvas.height, cx = w / 2, cy = h / 2, pad = 28;
    fxCtx.font = 'bold 10px monospace';
    fxCtx.textAlign = 'center';
    fxCtx.textBaseline = 'middle';
    for (const s of ships) {
        if (s.dead || s.team === PLAYER_TEAM) continue;
        const sx = s.x - cam.x, sy = h - (s.y - cam.y);
        if (sx > -20 && sx < w + 20 && sy > -20 && sy < h + 20) continue;

        const dx = sx - cx, dy = sy - cy;
        const t = Math.min((cx - pad) / Math.abs(dx || 0.001), (cy - pad) / Math.abs(dy || 0.001));
        const px = cx + dx * t, py = cy + dy * t;
        const ang = Math.atan2(dy, dx);

        fxCtx.save();
        fxCtx.translate(px, py);
        fxCtx.rotate(ang);
        fxCtx.fillStyle = s.c.body || '#ef4444';
        fxCtx.strokeStyle = '#fff';
        fxCtx.lineWidth = 1.5;
        fxCtx.beginPath();
        fxCtx.moveTo(12, 0); fxCtx.lineTo(-8, -8); fxCtx.lineTo(-8, 8); fxCtx.closePath();
        fxCtx.fill(); fxCtx.stroke();
        fxCtx.restore();

        fxCtx.fillStyle = '#fca5a5';
        fxCtx.fillText(`${Math.round(Math.hypot(dx, dy) / 10)}m`, px - Math.cos(ang) * 26, py - Math.sin(ang) * 26);
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

// ================= INPUT KEYBOARD =================
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') e.preventDefault();
    keys[e.code] = true;
    if (e.code === 'KeyE' && player) player.activateShield();
    if (e.code === 'KeyR') requestBackup();
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// Kontrol Tombol On-Screen (THRUST, SHIELD, BACKUP & FIRE)
document.querySelectorAll('[data-key]').forEach(btn => {
    const code = btn.dataset.key;
    const set = (v) => (e) => { 
        e.preventDefault(); 
        keys[code] = v; 
        if (v) {
            if (code === 'KeyE' && player) player.activateShield();
            if (code === 'KeyR') requestBackup();
        }
    };
    btn.addEventListener('pointerdown', (e) => { btn.setPointerCapture(e.pointerId); set(true)(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => btn.addEventListener(ev, set(false)));
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
});

// Direct Touch Binding untuk Shield & Backup
if (btnShield) {
    btnShield.addEventListener('pointerdown', (e) => { e.preventDefault(); if (player) player.activateShield(); });
}
if (btnBackup) {
    btnBackup.addEventListener('pointerdown', (e) => { e.preventDefault(); requestBackup(); });
}

// ================= JOYSTICK VIRTUAL (MULTI-TOUCH) =================
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
        if (joyTouchId !== null) return;
        const touch = e.changedTouches[0];
        joyTouchId = touch.identifier;
        joy.active = true;
        updateJoyPos(touch.clientX, touch.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (joyTouchId === null) return;
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
        if (joy.active) return;
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

if (window.innerWidth > 768 && window.innerHeight > 550) {
    if (hudDetails) hudDetails.classList.remove('hidden');
    if (hudArrow) hudArrow.style.transform = 'rotate(180deg)';
}

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

// Handler Khusus Start Mission & Restart
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

