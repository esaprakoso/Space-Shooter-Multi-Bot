// ================= KONSTANTA =================
const PLAYER_TEAM = 'blue';      // tim player
const INITIAL_BOTS = ['red'];    // bot awal saat start / restart
const W = 40, H = 48, RADIUS = 18, MASS = 25;
const MAX_FUEL = 100, UNLOCK = 30, MAX_HULL = 100;
const FRICTION = 0.985, ANG_FRICTION = 0.93;
const MAX_METEORS = 10;
const BULLET_DAMAGE = 15;      // damage peluru ke meteor
const BULLET_LIFE = 100;       // umur peluru (frame) sebelum hilang
const BULLET_MASS = 2;         // massa peluru (untuk dorongan momentum)
const METEOR_MAX_SPEED = 5;
const METEOR_TYPES = [         // r = radius, hp = durabilitas (kecil = 1 tembakan hancur)
    { r: 8, hp: 15 },
    { r: 12, hp: 45 },
    { r: 18, hp: 90 },
];
const AVOID_METEOR = 80;   // jarak aman bot dari meteor (px)
const AVOID_SHIP = 60;     // jarak aman bot dari pesawat lain (px, di luar badan)

const TEAMS = {
    blue: { body: '#3B82F6', cockpit: '#93C5FD', rcs: '#38BDF8', glow: '59,130,246', bullet: '#22d3ee' },
    red: { body: '#EF4444', cockpit: '#FCA5A5', rcs: '#EF4444', glow: '239,68,68', bullet: '#f87171' },
};

const STATS = {
    player: { turn: 0.35, main: 0.25, rev: 0.08, rcsUse: 0.4, mainUse: 0.5, mainRegen: 0.25, cooldown: 120, wallDamage: true, maxAmmo: 20, ammoRegen: 0.05, ammoUnlock: 10 },
    bot: { turn: 0.2, main: 0.12, rev: 0.1, rcsUse: 0.4, mainUse: 0.4, mainRegen: 0.3, cooldown: 1000, wallDamage: false, maxAmmo: 6, ammoRegen: 0.008, ammoUnlock: 3 },
};

// ================= DOM HUD PLAYER =================
const $ = (id) => document.getElementById(id);
const gameOverBox = $('game-over-box');
const statusTitle = $('status-title');
const hullBar = $('hull-bar'), hullText = $('hull-text');
const mainFuelBar = $('main-fuel-bar'), mainFuelText = $('main-fuel-text');
const rcsFuelBar = $('rcs-fuel-bar'), rcsFuelText = $('rcs-fuel-text');
const ammoBar = $('ammo-bar'), ammoText = $('ammo-text');

// ================= STATE =================
const keys = {};
const ships = [];
const bullets = [];
const meteors = [];
const cam = { x: 0, y: 0 };   // pojok kiri-bawah layar dalam koordinat dunia

// ================= UTIL =================
function resolveCollision(a, b, restitution = 0.75) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const minDist = a.radius + b.radius;
    if (dist >= minDist || dist === 0) return 0;

    const nx = dx / dist, ny = dy / dist;
    const overlap = minDist - dist;
    const total = a.mass + b.mass;

    a.x -= nx * overlap * (b.mass / total);
    a.y -= ny * overlap * (b.mass / total);
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
    const colors = ['#f97316', '#ef4444', '#eab308', '#38bdf8', '#ffffff'];
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'fixed left-0 bottom-0 rounded-full pointer-events-none z-30';
        const size = Math.random() * 5 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        p.style.cssText = `width:${size}px;height:${size}px;background:${color};box-shadow:0 0 8px ${color}`;
        document.body.appendChild(p);

        const a = Math.random() * Math.PI * 2, s = Math.random() * 7 + 2;
        let px = cx, py = cy, op = 1;
        (function anim() {
            px += Math.cos(a) * s; py += Math.sin(a) * s; op -= 0.035;
            p.style.transform = `translate(${px - cam.x}px, ${-(py - cam.y)}px)`;
            p.style.opacity = op;
            if (op > 0) requestAnimationFrame(anim); else p.remove();
        })();
    }
}

// ================= KOMPONEN: SHIP =================
// Satu class untuk player & bot (merah/biru). x,y = titik tengah pesawat.
class Ship {
    constructor(team, isPlayer = false) {
        this.team = team;
        this.isPlayer = isPlayer;
        this.c = TEAMS[team];
        this.p = isPlayer ? STATS.player : STATS.bot;
        this.radius = RADIUS;
        this.mass = MASS;
        this.buildPlane();
        if (!isPlayer) this.buildHud();
    }

    buildPlane() {
        const c = this.c;
        const el = document.createElement('div');
        el.className = 'fixed left-0 bottom-0 w-10 h-12 pointer-events-none z-10';
        el.innerHTML = `
        <svg viewBox="-8 -6 40 42" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full"
             style="filter:drop-shadow(0 0 8px rgba(${c.glow},0.8))">
            <path data-fx="thrust" d="M9 28L12 38L15 28Z" fill="#F97316" class="hidden"/>
            <path data-fx="left" d="M1 22L-5 24L1 26Z" fill="${c.rcs}" class="hidden"/>
            <path data-fx="right" d="M23 22L29 24L23 26Z" fill="${c.rcs}" class="hidden"/>
            <g data-fx="rev" class="hidden">
                <path d="M4 12L-1 6L6 9Z" fill="${c.rcs}"/>
                <path d="M20 12L25 6L18 9Z" fill="${c.rcs}"/>
            </g>
            <path d="M12 2L24 26L12 21L0 26L12 2Z" fill="${c.body}"/>
            <path d="M12 6L16 16L12 14L8 16L12 6Z" fill="${c.cockpit}"/>
        </svg>`;
        document.body.appendChild(el);
        this.el = el;
        this.fxEls = {};
        el.querySelectorAll('[data-fx]').forEach(n => this.fxEls[n.dataset.fx] = n);
    }

    // HUD bar melayang di atas pesawat (hanya bot)
    buildHud() {
        const hud = document.createElement('div');
        hud.className = 'fixed left-0 bottom-0 w-14 z-20 pointer-events-none';
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
            hull: MAX_HULL, main: MAX_FUEL, rcs: MAX_FUEL,
            mainEmpty: false, rcsEmpty: false,
            ammo: this.p.maxAmmo, ammoEmpty: false,
            dead: false, invuln: false, lastShot: 0,
            input: {}, fx: {},
        });
        this.el.classList.remove('hidden');
        this.el.style.opacity = 1;
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
    }

    // Target = musuh (beda tim) terdekat
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

        // --- Menghindar: tolak dari meteor & batas layar (prioritas di atas menyerang) ---
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
            if (Math.abs(fd) < 70) i.thrust = true;       // menghadap arah kabur -> gas
            else if (Math.abs(fd) > 110) i.reverse = true; // membelakangi -> mundur
            return;
        }

        const t = this.nearestEnemy();
        if (!t) return;

        const dx = t.x - this.x, dy = t.y - this.y;
        const dist = Math.hypot(dx, dy);
        let diff = (Math.atan2(dx, dy) * 180) / Math.PI - this.angle;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;

        if (Math.abs(diff) > 6) { i.left = diff < 0; i.right = diff > 0; }
        if (dist > 320) i.thrust = true;
        else if (dist < 180) i.reverse = true;
        if (Math.abs(diff) < 8 && dist < 450) i.shoot = true;
    }

    step(ts) {
        const p = this.p, i = this.input;

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
        this.rcs = rcsUsed ? Math.max(0, this.rcs - p.rcsUse) : Math.min(MAX_FUEL, this.rcs + 0.3);
        this.main = thrust ? Math.max(0, this.main - p.mainUse) : Math.min(MAX_FUEL, this.main + p.mainRegen);
        this.fx = { left, right, rev, thrust };

        this.vAngle *= ANG_FRICTION;
        this.angle += this.vAngle;
        this.vx *= FRICTION; this.vy *= FRICTION;
        this.x += this.vx; this.y += this.vy;

        // Amunisi: habis -> terkunci sampai terisi ulang >= ammoUnlock
        if (this.ammo < 1) this.ammoEmpty = true;
        else if (this.ammoEmpty && this.ammo >= p.ammoUnlock) this.ammoEmpty = false;
        this.ammo = Math.min(p.maxAmmo, this.ammo + p.ammoRegen);

        if (i.shoot && !this.ammoEmpty && ts - this.lastShot > p.cooldown) {
            this.shoot();
            this.ammo -= 1;
            this.lastShot = ts;
        }
    }

    shoot() {
        const rad = (this.angle * Math.PI) / 180;
        const el = document.createElement('div');
        el.className = 'fixed left-0 bottom-0 rounded-full pointer-events-none z-10';
        el.style.cssText = `width:8px;height:16px;background:${this.c.bullet};box-shadow:0 0 10px ${this.c.bullet}`;
        document.body.appendChild(el);
        bullets.push({
            el, owner: this, angle: this.angle, life: BULLET_LIFE,
            x: this.x, y: this.y,
            vx: this.vx + 14 * Math.sin(rad), vy: this.vy + 14 * Math.cos(rad),
        });
    }

    takeDamage(amount) {
        if (this.invuln || this.dead || amount <= 0) return;
        this.hull = Math.max(0, this.hull - amount);
        createExplosion(this.x, this.y, 10);
        if (this.hull <= 0) return this.destroy();

        this.invuln = true;
        this.el.style.opacity = 0.4;
        setTimeout(() => { this.el.style.opacity = 1; this.invuln = false; }, 800);
    }

    destroy() {
        this.dead = true;
        createExplosion(this.x, this.y, 36);
        if (this.isPlayer) {
            this.el.classList.add('hidden');
            showStatus('YOU LOST!', 'text-red-500');
        } else {
            this.remove();
            checkVictory();
        }
    }

    // Hapus bot dari game (DOM + array)
    remove() {
        this.el.remove();
        if (this.hud) this.hud.remove();
        const idx = ships.indexOf(this);
        if (idx >= 0) ships.splice(idx, 1);
    }

    render() {
        this.el.style.transform = `translate(${this.x - W / 2 - cam.x}px, ${-(this.y - H / 2 - cam.y)}px) rotate(${this.angle}deg)`;
        for (const k in this.fxEls) this.fxEls[k].classList.toggle('hidden', !this.fx[k === 'rev' ? 'rev' : k]);

        if (this.isPlayer) {
            hullBar.style.width = `${this.hull}%`;
            hullText.textContent = `${Math.round(this.hull)}%`;
            mainFuelBar.style.width = `${this.main}%`;
            mainFuelText.textContent = `${Math.round(this.main)}%`;
            rcsFuelBar.style.width = `${this.rcs}%`;
            rcsFuelText.textContent = `${Math.round(this.rcs)}%`;
            ammoBar.style.width = `${(this.ammo / this.p.maxAmmo) * 100}%`;
            ammoBar.style.opacity = this.ammoEmpty ? 0.4 : 1;
            ammoText.textContent = this.ammoEmpty ? 'RELOAD' : `${Math.floor(this.ammo)}/${this.p.maxAmmo}`;
        } else {
            this.hud.style.transform = `translate(${this.x - 28 - cam.x}px, ${-(this.y + H / 2 + 6 - cam.y)}px)`;
            this.hudBar.style.width = `${this.hull}%`;
            this.hudAmmo.style.width = `${(this.ammo / this.p.maxAmmo) * 100}%`;
            this.hudAmmo.style.opacity = this.ammoEmpty ? 0.4 : 1;
        }
    }
}

// ================= GAME STATE =================
const player = new Ship(PLAYER_TEAM, true);
ships.push(player);

function showStatus(text, colorClass) {
    statusTitle.innerHTML = `<span class="${colorClass}">${text}</span>`;
    gameOverBox.classList.remove('hidden');
}

function checkVictory() {
    if (player.dead) return;
    if (!ships.some(s => !s.dead && s.team !== PLAYER_TEAM)) {
        showStatus('VICTORY! SEMUA MUSUH HANCUR', 'text-green-400');
    }
}

function spawnBot(team) {
    const rx = team === 'red' ? 0.05 + Math.random() * 0.25 : 0.62 + Math.random() * 0.18;
    const bot = new Ship(team);
    bot.reset(cam.x + window.innerWidth * rx, cam.y + window.innerHeight * (0.15 + Math.random() * 0.7), team === 'red' ? 90 : -90);
    ships.push(bot);
    if (!player.dead) gameOverBox.classList.add('hidden');
}

function resetGame() {
    [...ships].forEach(s => { if (!s.isPlayer) s.remove(); });
    player.reset(0, 0, 0); updateCamera();

    Object.keys(keys).forEach(k => keys[k] = false);
    bullets.forEach(b => b.el.remove()); bullets.length = 0;
    meteors.forEach(m => m.el.remove()); meteors.length = 0;

    gameOverBox.classList.add('hidden');
    INITIAL_BOTS.forEach(spawnBot);
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
    el.className = 'fixed left-0 bottom-0 rounded-full border border-stone-400 bg-stone-700/90 pointer-events-none z-10 shadow-[0_0_4px_rgba(168,162,158,0.5)]';
    el.style.width = el.style.height = `${radius * 2}px`;
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

        // Terlalu jauh dari kamera -> hapus
        if (Math.hypot(m.x - (cam.x + window.innerWidth / 2), m.y - (cam.y + window.innerHeight / 2)) > Math.hypot(window.innerWidth, window.innerHeight)) {
            m.el.remove(); meteors.splice(i, 1);
            continue;
        }

        m.el.style.transform = `translate(${m.x - m.radius - cam.x}px, ${-(m.y - m.radius - cam.y)}px)`;

        // Peluru vs meteor: kurangi HP + transfer momentum (meteor terdorong)
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
            b.el.remove(); bullets.splice(bi, 1);
            if (m.hp <= 0) { destroyed = true; break; }
        }
        if (destroyed) {
            createExplosion(m.x, m.y, 12 + m.radius);
            m.el.remove(); meteors.splice(i, 1);
            continue;
        }
        m.el.style.opacity = 0.45 + 0.55 * (m.hp / m.maxHp); // makin rusak makin pudar

        // Semua pesawat vs meteor
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
        b.el.style.transform = `translate(${b.x - 4 - cam.x}px, ${-(b.y - 8 - cam.y)}px) rotate(${b.angle}deg)`;

        // Friendly fire aktif: kena siapa saja kecuali penembaknya sendiri
        const target = ships.find(s => !s.dead && s !== b.owner && Math.hypot(b.x - s.x, b.y - s.y) < s.radius + 6);
        const out = --b.life <= 0;

        if (target || out) {
            b.el.remove(); bullets.splice(i, 1);
            if (target) target.takeDamage(15);
        }
    }
}

// ================= GAME LOOP =================
function gameLoop(ts) {
    if (Math.random() < 0.03) spawnMeteor();

    for (const s of [...ships]) {
        if (s.dead) continue;
        s.isPlayer ? s.readKeys() : s.ai();
        s.step(ts);
    }

    // Tabrakan antar pesawat
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

    updateCamera();
    updateBackground();
    updateBullets();
    updateMeteors();
    ships.forEach(s => s.render());
    requestAnimationFrame(gameLoop);
}

// ================= KAMERA & LATAR =================
// Dunia tak terbatas: kamera selalu memusatkan player (diam saat player mati)
function updateCamera() {
    if (player.dead) return;
    cam.x = player.x - window.innerWidth / 2;
    cam.y = player.y - window.innerHeight / 2;
}

// Bintang berlapis (parallax) supaya gerakan terasa di ruang kosong
const bg = document.createElement('div');
bg.className = 'fixed inset-0 z-0 pointer-events-none';
bg.style.backgroundImage = [
    'radial-gradient(1px 1px at 30px 40px, rgba(255,255,255,.5) 50%, transparent)',
    'radial-gradient(1.5px 1.5px at 120px 90px, rgba(255,255,255,.7) 50%, transparent)',
    'radial-gradient(2px 2px at 70px 150px, rgba(255,255,255,.9) 50%, transparent)',
].join(',');
bg.style.backgroundSize = '170px 190px, 230px 210px, 310px 270px';
document.body.prepend(bg);

function updateBackground() {
    const f = [0.2, 0.4, 0.7];
    bg.style.backgroundPosition = f.map(k => `${-cam.x * k}px ${cam.y * k}px`).join(',');
}

// ================= INPUT & START =================
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') e.preventDefault();
    keys[e.code] = true;
});
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// blur() agar tombol Space (tembak) tidak ikut "menekan" tombol yang terfokus
$('reset-btn').addEventListener('click', (e) => { resetGame(); e.currentTarget.blur(); });
$('add-red').addEventListener('click', (e) => { spawnBot('red'); e.currentTarget.blur(); });
$('add-blue').addEventListener('click', (e) => { spawnBot('blue'); e.currentTarget.blur(); });

player.reset(0, 0, 0); updateCamera();
INITIAL_BOTS.forEach(spawnBot);
requestAnimationFrame(gameLoop);