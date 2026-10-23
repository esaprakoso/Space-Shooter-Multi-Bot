# Space Shooter Multi Bot

Game tembak-menembak pesawat luar angkasa di browser. Kamu (biru) bertarung di arena tak terbatas melawan bot merah, dengan bantuan bot biru yang bisa ditambah kapan saja. Ada fisika inersia, bahan bakar, magazine, meteor yang bisa didorong peluru, dan pickup acak.

Tanpa build step: cukup dua file, `index.html` dan `play.js`.

## Cara menjalankan

1. Simpan `index.html` dan `play.js` di folder yang sama.
2. Buka `index.html` di browser.

Tailwind CSS dimuat dari CDN (`cdn.jsdelivr.net`), jadi perlu koneksi internet.

## Kontrol

### Keyboard

| Tombol | Aksi |
|---|---|
| `W` / `↑` | Gas (main engine) |
| `S` / `↓` | Mundur (retro thruster) |
| `A` / `←` | Belok kiri (RCS) |
| `D` / `→` | Belok kanan (RCS) |
| `Space` | Tembak |

### Layar sentuh (landscape)

Tombol on-screen muncul otomatis di perangkat sentuh dalam mode landscape: ◀ ▶ di kiri bawah, ▲ ▼ dan **FIRE** di kanan bawah. Multi-touch didukung. Di mode portrait muncul petunjuk untuk memutar perangkat.

### Tombol lain

- **+ BOT MERAH / + BOT BIRU** (kiri atas): menambah bot secara dinamis.
- **RESTART MISSION**: muncul saat game berakhir.

## Aturan permainan

- **Tim:** kamu di tim biru. Bot biru adalah kawan, bot merah adalah musuh.
- **Hull:** 100. Habis berarti pesawat hancur. Setelah terkena damage, pesawat kebal selama 0,8 detik.
- **Friendly fire aktif:** peluru melukai siapa saja kecuali penembaknya sendiri, termasuk kawan.
- **Tabrakan:** antar pesawat dan dengan meteor bersifat elastis dan menimbulkan damage sesuai kekuatan benturan.
- **Menang:** semua musuh hancur. Kalau kamu sudah mati tapi bot kawan masih hidup saat musuh habis, tim kamu menang.
- **Kalah:** hull player habis.

### Bahan bakar

Dua tangki terpisah, keduanya terisi lagi saat tidak dipakai:

- **Main engine** untuk gas.
- **RCS** untuk belok dan mundur.

Kalau tangki habis, fungsinya terkunci sampai terisi kembali hingga 30%.

### Magazine

| | Player | Bot |
|---|---|---|
| Peluru per magazine | 20 | 6 |
| Magazine cadangan awal | 2 | 2 |
| Maks magazine cadangan | 5 | 3 |
| Waktu reload | 1,5 detik | 2 detik |

Saat peluru di magazine habis, pesawat reload otomatis memakai 1 magazine cadangan. Kalau peluru dan magazine cadangan habis, tidak bisa menembak sampai mengambil pickup magazine. HUD menampilkan `RELOAD` atau `NO AMMO`.

### Pickup

Muncul acak di sekitar layar (maksimal 6 sekaligus). Terambil saat disentuh pesawat mana pun, tetapi hanya kalau berguna bagi pesawat itu.

- **Hijau (+)**: memulihkan 30 hull.
- **Kuning**: menambah 1 magazine cadangan.

### Meteor

Ada tiga ukuran. Peluru memberi damage 15 dan juga mendorong meteor (transfer momentum), jadi menembak terus-menerus membuat meteor makin terdorong sampai hancur.

| Ukuran | HP | Peluru untuk hancur |
|---|---|---|
| Kecil | 15 | 1 |
| Sedang | 45 | 3 |
| Besar | 90 | 6 |

Meteor yang rusak tampak makin pudar.

### Arena tak terbatas

Tidak ada batas layar. Kamera selalu memusatkan player, dan latar bintang bergeser dengan efek parallax. Meteor dan pickup muncul di sekitar kamera dan dihapus kalau sudah jauh.

### Mode penonton

Setelah player mati, perang tetap berjalan. Geser kamera dengan tombol panah atau WASD untuk menonton.

## HUD dan indikator

- **Kanan atas:** hull, main engine, RCS, dan ammo player (`peluru/ukuran magazine · MAG cadangan`).
- **Tengah atas:** jumlah **MUSUH** dan **KAWAN** yang masih hidup (player tidak dihitung sebagai kawan).
- **Di atas setiap bot:** bar hull dan bar ammo kecil yang mengikuti pesawat.
- **Panah merah di tepi layar:** menunjuk musuh di luar layar, lengkap dengan jarak dalam "m" (piksel dibagi 10).

## Perilaku bot

Prioritas dari atas ke bawah:

1. **Menghindar:** menjauh dari meteor, dan dari pesawat lain yang terlalu dekat. Saat menghindar bot tidak menembak.
2. **Mencari pickup:** hull di bawah 60 mencari pickup health, magazine cadangan habis mencari pickup magazine (radius 700 px).
3. **Menyerang:** mengejar musuh terdekat, menjaga jarak sekitar 180–320 px, dan menembak saat bidikan sudah searah dan jarak di bawah 450 px.

Bot tidak punya logika untuk menahan tembakan saat ada kawan di garis tembak.

## Struktur kode

```
index.html   HUD, tombol, kontrol sentuh, memuat Tailwind CDN dan play.js
play.js      seluruh logika game
```

Isi `play.js`:

- **Konstanta** di bagian atas: tim, ukuran pesawat, `TEAMS` (warna), `STATS` (parameter player dan bot), meteor, pickup, dan jarak menghindar.
- **`class Ship`:** satu komponen untuk player dan semua bot. Mengurus tampilan SVG, fisika, fuel, magazine, tembakan, damage, dan HUD. Bot memakai `ai()`, player memakai `readKeys()`.
- **`spawnBot(team)`:** membuat bot baru (`'red'` atau `'blue'`).
- **Meteor, peluru, pickup:** masing-masing punya fungsi spawn dan update.
- **Kamera, latar bintang, partikel, dan panah musuh:** digambar di canvas.
- **`gameLoop`:** urutan per frame: input/AI → fisika → tabrakan → kamera → pickup → peluru → meteor → render.

## Konfigurasi

Semua parameter ada di bagian atas `play.js`, tidak perlu argumen atau file konfigurasi:

| Konstanta | Fungsi |
|---|---|
| `PLAYER_TEAM` | Tim player (`'blue'`) |
| `INITIAL_BOTS` | Bot awal saat start dan restart (default `['red']`) |
| `STATS.player` / `STATS.bot` | Kecepatan putar, daya dorong, konsumsi fuel, cooldown tembak, ukuran magazine, waktu reload |
| `METEOR_TYPES` | Radius dan HP tiap ukuran meteor |
| `BULLET_DAMAGE`, `BULLET_MASS` | Damage dan dorongan peluru ke meteor |
| `PICKUP_MAX`, `PICKUP_SPAWN_CHANCE` | Jumlah dan frekuensi pickup |
| `HEAL_AMOUNT`, `MAG_AMOUNT` | Besar efek pickup |
| `AVOID_METEOR`, `AVOID_SHIP` | Jarak aman bot (px) |
| `BULLET_LIFE` | Umur peluru dalam frame |
| `MAX_PARTICLES` | Batas partikel ledakan |

## Catatan performa

Bintang dan partikel digambar di canvas, sedangkan peluru, meteor, dan pickup memakai elemen DOM dengan inline style. Bagian HUD hanya menulis ke DOM saat nilainya berubah. Kalau game terasa berat dengan banyak bot, kurangi jumlah bot atau `MAX_PARTICLES`.

## Keterbatasan

- Bot yang jauh tetap mengejar musuh terdekat sejauh apa pun. Player bisa menyusul jauh karena kecepatan maksimalnya lebih tinggi.
- Tidak ada penyimpanan skor, suara, atau pengaturan tingkat kesulitan.
- Kontrol sentuh hanya tersedia dalam mode landscape.
