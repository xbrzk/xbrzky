// =========================================================
//  KODE UMUM SITUS (loader, tema, ketik, menu, animasi, AI)
// =========================================================
const $ = (id) => document.getElementById(id);

// ===== Loader: hilang setelah halaman siap, lalu halaman bisa di-scroll =====
(() => {
    const loader = $("loader");
    let selesai = false;

    function buka() {
        if (selesai) return;
        selesai = true;
        document.body.classList.add("loaded");
        if (loader) loader.classList.add("hide");
    }

    // tunggu animasi bar loader (1,5 dtk) dan semua aset; cadangan 3 dtk
    const minimal = new Promise((r) => setTimeout(r, 1600));
    const siap = new Promise((r) =>
        document.readyState === "complete"
            ? r()
            : window.addEventListener("load", r, { once: true })
    );
    Promise.all([minimal, siap]).then(buka);
    setTimeout(buka, 3000);
})();

// ===== Mode terang / gelap =====
(() => {
    const tombol = $("tema");
    const meta = document.querySelector('meta[name="theme-color"]');
    let gelap = true;

    try {
        const simpan = localStorage.getItem("tema");
        if (simpan) gelap = simpan === "dark";
    } catch (e) {}

    function terapkan(nilai, kabari) {
        gelap = nilai;
        document.body.classList.toggle("dark", gelap);

        if (tombol) {
            tombol.textContent = gelap ? "🌙" : "☀";
            tombol.setAttribute("aria-pressed", String(gelap));
        }
        if (meta) meta.setAttribute("content", gelap ? "#0b0b0f" : "#f4f3f2");

        if (kabari) {
            document.dispatchEvent(
                new CustomEvent("xbrzki:themechange", { detail: { dark: gelap } })
            );
        }
    }

    terapkan(gelap, false);

    if (tombol) {
        tombol.addEventListener("click", () => {
            terapkan(!gelap, true);
            try { localStorage.setItem("tema", gelap ? "dark" : "light"); } catch (e) {}
        });
    }
})();

// ===== Efek mengetik =====
(() => {
    const el = $("ketik");
    if (!el) return;

    const kata = ["Frontend Web Developer", "UI Enthusiast", "Tech Enthusiast"];
    const kurang = matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (kurang) {
        el.textContent = kata[0];
        return;
    }

    let k = 0, h = 0, hapus = false;

    function jalan() {
        const sekarang = kata[k];
        h += hapus ? -1 : 1;
        el.textContent = sekarang.slice(0, h);

        let jeda = hapus ? 40 : 90;

        if (!hapus && h === sekarang.length) {
            hapus = true;
            jeda = 1500;
        } else if (hapus && h === 0) {
            hapus = false;
            k = (k + 1) % kata.length;
            jeda = 400;
        }
        setTimeout(jalan, jeda);
    }

    setTimeout(jalan, 1800);
})();

// ===== Menu HP (hamburger) =====
(() => {
    const burger = $("hamburger");
    const menu = document.querySelector(".nav-links");
    if (!burger || !menu) return;

    function atur(buka) {
        burger.classList.toggle("aktif", buka);
        menu.classList.toggle("buka", buka);
        document.body.classList.toggle("menu-buka", buka);
    }

    burger.addEventListener("click", () => atur(!menu.classList.contains("buka")));
    menu.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => atur(false))
    );
})();

// ===== Animasi muncul saat di-scroll =====
(() => {
    const items = document.querySelectorAll(".muncul");

    if (!("IntersectionObserver" in window)) {
        items.forEach((i) => i.classList.add("tampil"));
        return;
    }

    const io = new IntersectionObserver((daftar) => {
        daftar.forEach((e) => {
            if (e.isIntersecting) {
                e.target.classList.add("tampil");
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12 });

    items.forEach((i) => io.observe(i));
})();

// ===== Menu aktif mengikuti scroll =====
(() => {
    const links = [...document.querySelectorAll(".nav-links a")];
    const seksi = links
        .map((a) => document.querySelector(a.getAttribute("href")))
        .filter(Boolean);

    function cek() {
        const y = window.scrollY + window.innerHeight * 0.35;
        let aktif = seksi[0];
        seksi.forEach((s) => { if (s.offsetTop <= y) aktif = s; });
        links.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + aktif.id)
        );
    }

    window.addEventListener("scroll", cek, { passive: true });
    cek();
})();

// ===== Teks berjalan (marquee) =====
(() => {
    document.querySelectorAll(".marquee-isi").forEach((el) => {
        const teks = el.dataset.teks || "";
        const separuh = Array.from({ length: 6 }, () => `<span>${teks} •</span>`).join("");
        el.innerHTML = separuh + separuh; // dua salinan sama: animasi -50% mulus
    });
})();

// ===== Asisten AI sederhana (jawaban berbasis kata kunci) =====
(() => {
    const btn = $("ai-btn");
    const panel = $("ai-panel");
    const tutup = $("ai-tutup");
    const pesan = $("ai-pesan");
    const form = $("ai-form");
    const input = $("ai-input");
    if (!btn || !panel || !pesan || !form || !input) return;

    const jawaban = [
        [/halo|hai|hi|hello/i, "Halo! Saya asisten Rizki. Tanya soal skill, proyek, atau kontak ya."],
        [/skill|keahlian|bisa apa|teknologi|tech/i, "Rizki fokus di HTML, CSS, JavaScript, dan desain responsif. Tools: VS Code, Git, GitHub."],
        [/proyek|project|karya/i, "Ada Portfolio Website, Kalkulator Web, dan To-Do List App. Lihat bagian Projects di halaman ini."],
        [/kontak|hubungi|wa|whatsapp|telepon|phone/i, 'Hubungi via <a href="https://wa.me/62895408104500" target="_blank">WhatsApp</a> atau Instagram @xb.rzki.'],
        [/kuliah|kampus|universitas|pendidikan/i, "Rizki kuliah di Universitas Terbuka."],
        [/lokasi|tinggal|asal|jambi/i, "Rizki berbasis di Jambi, Indonesia."],
        [/cv|resume/i, 'CV Rizky bisa diunduh di sini: <a href="img/CV-Rizky.jpg.jpg" download="CV-Rizky.jpg">Download CV</a>']
    ];

    function tambah(teks, siapa, html) {
        const d = document.createElement("div");
        d.className = "ai-msg " + siapa;
        if (html) d.innerHTML = teks; else d.textContent = teks;
        pesan.appendChild(d);
        pesan.scrollTop = pesan.scrollHeight;
    }

    tambah("Halo! Ada yang ingin kamu tahu tentang Rizki?", "bot");

    btn.addEventListener("click", () => {
        panel.classList.toggle("buka");
        if (panel.classList.contains("buka")) input.focus();
    });
    if (tutup) tutup.addEventListener("click", () => panel.classList.remove("buka"));

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const q = input.value.trim();
        if (!q) return;

        tambah(q, "user");
        input.value = "";

        const cocok = jawaban.find(([pola]) => pola.test(q));
        setTimeout(() => {
            if (cocok) tambah(cocok[1], "bot", true);
            else tambah("Maaf, saya belum paham. Coba tanya soal skill, proyek, atau kontak.", "bot");
        }, 400);
    });
})();

// ===== Kartu ID gantung 3D (three.js) =====
(() => {
    const hero = $("home");
    const canvas = $("lanyardGL");
    const hint = $("lanyardHint");

    if (!hero || !canvas || typeof THREE === "undefined") return;

    // ===== PENGATURAN =====
    const PHOTO_SRC = "img/foto.png";
    const LOGO_SRC = "img/logoUT.png";

    const NAMA = "M.rizky anjani";
    const PERAN = "TECH ENTHUSIAST";
    const KAMPUS = "UNIVERSITAS TERBUKA";

    const GRAVITY = 30;
    const DAMPING = 0.992;
    const TILT = -0.035;
    const FLIP_SPRING = 60;
    const FLIP_DAMP = 5.5;

    const CARD_X = {
        desktop: 0.775,
        tablet: 0.76,
        mobile: 0.76
    };

    const reduce = matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // ===== Renderer, kamera, cahaya =====
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;

    const scene = new THREE.Scene();
    const CAM_Z = 14;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, CAM_Z);

    // Pantulan buatan untuk permukaan logam dan plastik.
    (function pantulan() {
        const c = document.createElement("canvas");
        c.width = 512;
        c.height = 256;

        const g = c.getContext("2d");
        const gr = g.createLinearGradient(0, 0, 0, 256);

        gr.addColorStop(0, "#1a1214");
        gr.addColorStop(0.5, "#0a0708");
        gr.addColorStop(1, "#050405");

        g.fillStyle = gr;
        g.fillRect(0, 0, 512, 256);

        g.fillStyle = "#6a6a6a";
        g.fillRect(60, 50, 120, 64);

        g.fillStyle = "#5a4a4a";
        g.fillRect(330, 36, 90, 96);

        g.fillStyle = "#661018";
        g.fillRect(230, 110, 60, 50);

        const t = new THREE.CanvasTexture(c);
        t.mapping = THREE.EquirectangularReflectionMapping;
        t.encoding = THREE.sRGBEncoding;

        const pm = new THREE.PMREMGenerator(renderer);
        scene.environment = pm.fromEquirectangular(t).texture;

        pm.dispose();
        t.dispose();
    })();

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(3, 4, 6);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xff2a3a, 0.5);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    // ===== Gambar: foto dan logo =====
    const anis = renderer.capabilities.getMaxAnisotropy();

    let foto = null;
    let logo = null;

    function muat(src, cb) {
        if (!src) return;

        const i = new Image();

        i.onload = () => cb(i);
        i.src = src;
    }

    function lambang(g, x, y, r, warna = "#fff") {
        if (logo) {
            const c = document.createElement("canvas");

            c.width = c.height = Math.max(2, Math.ceil(r * 2));

            const cg = c.getContext("2d");

            cg.drawImage(logo, 0, 0, c.width, c.height);
            cg.globalCompositeOperation = "source-in";
            cg.fillStyle = warna;
            cg.fillRect(0, 0, c.width, c.height);

            g.drawImage(c, x - r, y - r, r * 2, r * 2);
            return;
        }

        g.save();
        g.fillStyle = warna;
        g.beginPath();
        g.arc(x, y, r, 0, 7);
        g.fill();

        g.globalCompositeOperation = "destination-out";

        for (let i = -2; i <= 2; i++) {
            g.fillRect(
                x - r,
                y + i * r * 0.38 - r * 0.06,
                r * 2,
                r * 0.12
            );
        }

        g.restore();
    }

    const kotak = (g, x, y, w, h, r) => {
        g.beginPath();

        if (g.roundRect) {
            g.roundRect(x, y, w, h, r);
        } else {
            g.rect(x, y, w, h);
        }
    };

    function tekstur(w, h) {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;

        const t = new THREE.CanvasTexture(c);
        t.encoding = THREE.sRGBEncoding;
        t.anisotropy = anis;

        return { c, t };
    }

    const TW = 800;
    const TH = 1250;

    const DEPAN = tekstur(TW, TH);
    const BELAKANG = tekstur(TW, TH);
    const TALI = tekstur(128, 512);

    // ===== Sisi depan kartu =====
    function gambarDepan() {
        const g = DEPAN.c.getContext("2d");
        const W = TW;
        const H = TH;

        g.fillStyle = "#08080b";
        g.fillRect(0, 0, W, H);

        if (foto) {
            const s = Math.max(
                W / foto.naturalWidth,
                H / foto.naturalHeight
            );

            const iw = foto.naturalWidth * s;
            const ih = foto.naturalHeight * s;

            g.drawImage(
                foto,
                (W - iw) / 2,
                (H - ih) * 0.2,
                iw,
                ih
            );
        } else {
            g.fillStyle = "#17181f";
            g.beginPath();
            g.arc(W * 0.55, H * 0.42, 130, 0, 7);
            g.fill();

            g.beginPath();
            g.ellipse(
                W * 0.55,
                H * 0.85,
                250,
                200,
                0,
                Math.PI,
                0
            );
            g.fill();
        }

        const atas = g.createLinearGradient(0, 0, 0, H * 0.3);
        atas.addColorStop(0, "rgba(0,0,0,.85)");
        atas.addColorStop(1, "rgba(0,0,0,0)");

        g.fillStyle = atas;
        g.fillRect(0, 0, W, H * 0.3);

        const bawah = g.createLinearGradient(0, H * 0.62, 0, H);
        bawah.addColorStop(0, "rgba(0,0,0,0)");
        bawah.addColorStop(1, "rgba(0,0,0,.88)");

        g.fillStyle = bawah;
        g.fillRect(0, H * 0.62, W, H * 0.38);

        // Cahaya merah diagonal.
        g.save();
        g.globalCompositeOperation = "lighter";
        g.fillStyle = "rgba(255,40,55,.38)";
        g.translate(W * 0.9, H * 0.9);
        g.rotate(-0.75);
        g.fillRect(-420, -22, 560, 34);
        g.fillRect(-420, 30, 440, 12);
        g.restore();

        // Lubang untuk tali.
        g.fillStyle = "#000";
        kotak(g, W / 2 - 70, 34, 140, 28, 14);
        g.fill();

        lambang(g, 110, 150, 46);

        g.fillStyle = "#fff";
        g.textAlign = "left";
        g.font = "600 30px Poppins, sans-serif";

        g.fillText("UNIVERSITAS", 176, 142);
        g.fillText("TERBUKA", 176, 180);

        g.font = "700 92px Poppins, sans-serif";
        g.fillText(NAMA, 60, H * 0.84);

        g.font = "600 30px Poppins, sans-serif";

        if ("letterSpacing" in g) {
            g.letterSpacing = "4px";
        }

        g.fillText(PERAN, 62, H * 0.84 + 54);

        if ("letterSpacing" in g) {
            g.letterSpacing = "0px";
        }

        g.fillStyle = "#ff2a3a";
        g.fillRect(62, H * 0.84 + 84, 56, 5);

        DEPAN.t.needsUpdate = true;
    }

    // ===== Sisi belakang kartu =====
    function gambarBelakang() {
        const g = BELAKANG.c.getContext("2d");
        const W = TW;
        const H = TH;

        g.fillStyle = "#0a0a0e";
        g.fillRect(0, 0, W, H);

        const rg = g.createRadialGradient(
            W / 2, 0, 10,
            W / 2, 0, W
        );

        rg.addColorStop(0, "rgba(220,30,45,.6)");
        rg.addColorStop(1, "rgba(0,0,0,0)");

        g.fillStyle = rg;
        g.fillRect(0, 0, W, H);

        g.fillStyle = "#000";
        kotak(g, W / 2 - 70, 34, 140, 28, 14);
        g.fill();

        g.textAlign = "center";

        const logoR = new Image();

        logoR.onload = () => {
            const rasio = logoR.naturalWidth / logoR.naturalHeight;
            const lebarLogo = 260;
            const tinggiLogo = lebarLogo / rasio;

            g.drawImage(
                logoR,
                (W - lebarLogo) / 2,
                170,
                lebarLogo,
                tinggiLogo
            );

            BELAKANG.t.needsUpdate = true;
        };

        logoR.src = "img/favicon.png";

        g.fillStyle = "#fff";
        g.font = "700 50px Poppins, sans-serif";
        g.fillText("Muhammad Rizky Anjani", W / 2, 520);

        g.fillStyle = "rgba(255,255,255,.75)";
        g.font = "400 30px Poppins, sans-serif";

        [
            "Universitas Terbuka",
            "HTML, CSS, JavaScript",
            "Jambi, Indonesia"
        ].forEach((t, i) => {
            g.fillText(t, W / 2, 640 + i * 62);
        });

        g.fillStyle = "#ff2a3a";
        g.fillRect(W / 2 - 28, 880, 56, 5);

        BELAKANG.t.needsUpdate = true;
    }

    // ===== Tekstur tali: hitam saat malam, putih saat siang =====
    function gambarTali() {
        const g = TALI.c.getContext("2d");
        const W = 128;
        const H = 512;

        const gelapAktif = document.body.classList.contains("dark");
        const warnaTeks = gelapAktif ? "#f7f5f2" : "#17171c";

        const gx = g.createLinearGradient(0, 0, W, 0);

        if (gelapAktif) {
            gx.addColorStop(0, "#050506");
            gx.addColorStop(0.28, "#111116");
            gx.addColorStop(0.5, "#202027");
            gx.addColorStop(0.72, "#111116");
            gx.addColorStop(1, "#050506");
        } else {
            gx.addColorStop(0, "#d9d6d3");
            gx.addColorStop(0.18, "#f2f0ed");
            gx.addColorStop(0.5, "#fffdfa");
            gx.addColorStop(0.82, "#f0eeeb");
            gx.addColorStop(1, "#d4d1ce");
        }

        g.fillStyle = gx;
        g.fillRect(0, 0, W, H);

        // Serat kain halus.
        g.save();

        g.globalAlpha = gelapAktif ? 0.22 : 0.28;
        g.strokeStyle = gelapAktif ? "#777780" : "#aaa5a0";
        g.lineWidth = 1;

        for (let x = 3; x < W; x += 5) {
            g.beginPath();
            g.moveTo(x, 0);
            g.lineTo(x, H);
            g.stroke();
        }

        g.globalAlpha = gelapAktif ? 0.55 : 0.6;
        g.strokeStyle = gelapAktif ? "#303038" : "#c5c0bb";
        g.lineWidth = 2;

        g.beginPath();
        g.moveTo(8, 0);
        g.lineTo(8, H);
        g.moveTo(W - 8, 0);
        g.lineTo(W - 8, H);
        g.stroke();

        g.restore();

        // Aksen merah lebih lembut di mode siang.
        g.save();
        g.globalCompositeOperation = "screen";

        g.fillStyle = gelapAktif
            ? "rgba(255,40,55,.42)"
            : "rgba(225,31,53,.12)";

        g.translate(0, 330);
        g.rotate(-0.9);
        g.fillRect(-60, 0, 260, 18);
        g.fillRect(-60, 38, 260, 6);
        g.restore();

        g.fillStyle = warnaTeks;
        g.textAlign = "center";

        lambang(g, W / 2, 62, 28, warnaTeks);

        g.font = "600 13px Poppins, sans-serif";
        g.fillText("UNIVERSITAS", W / 2, 118);
        g.fillText("TERBUKA", W / 2, 134);

        lambang(g, W / 2, 218, 28, warnaTeks);
        g.fillText("UNIVERSITAS", W / 2, 274);
        g.fillText("TERBUKA", W / 2, 290);

        TALI.t.needsUpdate = true;
    }

    function gambarSemua() {
        gambarDepan();
        gambarBelakang();
        gambarTali();
    }

    gambarSemua();

    // gambar ulang setelah font Poppins siap, supaya teks di kartu tajam
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(gambarSemua);
    }

    document.addEventListener("xbrzki:themechange", (event) => {
        const gelapAktif =
            event.detail?.dark ??
            document.body.classList.contains("dark");

        rim.color.set(gelapAktif ? 0xff2a3a : 0xe5a1a8);
        rim.intensity = gelapAktif ? 0.5 : 0.22;

        gambarTali();
    });

    rim.color.set(
        document.body.classList.contains("dark")
            ? 0xff2a3a
            : 0xe5a1a8
    );

    rim.intensity = document.body.classList.contains("dark")
        ? 0.5
        : 0.22;

    (
        document.fonts
            ? document.fonts.load("700 90px Poppins")
            : Promise.resolve()
    ).then(gambarSemua);

    muat(PHOTO_SRC, (i) => {
        foto = i;
        gambarDepan();
    });

    muat(LOGO_SRC, (i) => {
        logo = i;
        gambarSemua();
    });

    TALI.t.wrapT = THREE.RepeatWrapping;

    // ===== Model kartu + pengait =====
    const CW = 1.6;
    const CH = 2.5;
    const TEBAL = 0.07;
    const RIM = 0.035;
    const ATT = 0.62;

    function bentuk(w, h, r) {
        const s = new THREE.Shape();
        const x = -w / 2;
        const y = -h / 2;

        s.moveTo(x + r, y);
        s.lineTo(x + w - r, y);
        s.quadraticCurveTo(x + w, y, x + w, y + r);
        s.lineTo(x + w, y + h - r);
        s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        s.lineTo(x + r, y + h);
        s.quadraticCurveTo(x, y + h, x, y + h - r);
        s.lineTo(x, y + r);
        s.quadraticCurveTo(x, y, x + r, y);

        return s;
    }

    const bentukKartu = bentuk(CW, CH, 0.15);
    const geoWajah = new THREE.ShapeGeometry(bentukKartu, 16);

    {
        const p = geoWajah.attributes.position;
        const uv = geoWajah.attributes.uv;

        for (let i = 0; i < p.count; i++) {
            uv.setXY(
                i,
                (p.getX(i) + CW / 2) / CW,
                (p.getY(i) + CH / 2) / CH
            );
        }
    }

    const geoBadan = new THREE.ExtrudeGeometry(
        bentukKartu,
        {
            depth: TEBAL,
            bevelEnabled: true,
            bevelThickness: 0.02,
            bevelSize: RIM,
            bevelSegments: 3,
            curveSegments: 16
        }
    );

    geoBadan.translate(0, 0, -TEBAL / 2);

    const kartu = new THREE.Group();

    kartu.add(new THREE.Mesh(
        geoBadan,
        new THREE.MeshStandardMaterial({
            color: 0x6a0b17,
            emissive: 0xff1f33,
            emissiveIntensity: 0.45,
            metalness: 0.1,
            roughness: 0.7,
            envMapIntensity: 0.2
        })
    ));

    const matWajah = (m) => new THREE.MeshPhysicalMaterial({
        map: m,
        roughness: 0.65,
        metalness: 0,
        envMapIntensity: 0.2
    });

    const zf = TEBAL / 2 + 0.022;

    const depan = new THREE.Mesh(geoWajah, matWajah(DEPAN.t));
    depan.position.z = zf;
    kartu.add(depan);

    const belakang = new THREE.Mesh(geoWajah, matWajah(BELAKANG.t));
    belakang.position.z = -zf;
    belakang.rotation.y = Math.PI;
    kartu.add(belakang);

    const krom = new THREE.MeshStandardMaterial({
        color: 0x8a8d94,
        metalness: 1,
        roughness: 0.4,
        envMapIntensity: 0.6
    });

    const gelap = new THREE.MeshStandardMaterial({
        color: 0x15161a,
        metalness: 0.9,
        roughness: 0.5,
        envMapIntensity: 0.4
    });

    const taruh = (mesh, y) => {
        mesh.position.y = CH / 2 + y;
        kartu.add(mesh);
        return mesh;
    };

    taruh(
        new THREE.Mesh(
            new THREE.TorusGeometry(0.1, 0.03, 16, 32),
            krom
        ),
        0
    );

    const klip = new THREE.Mesh(
        new THREE.ExtrudeGeometry(
            bentuk(0.3, 0.34, 0.06),
            {
                depth: 0.1,
                bevelEnabled: true,
                bevelThickness: 0.02,
                bevelSize: 0.02,
                bevelSegments: 2
            }
        ),
        gelap
    );

    klip.geometry.translate(0, 0, -0.05);
    taruh(klip, 0.2);

    const batang = (w, h, x, y) => {
        const m = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, 0.07),
            krom
        );

        m.position.set(x, CH / 2 + y, 0);
        kartu.add(m);
    };

    batang(0.64, 0.045, 0, 0.6);
    batang(0.64, 0.045, 0, 0.36);
    batang(0.045, 0.28, -0.3, 0.48);
    batang(0.045, 0.28, 0.3, 0.48);

    scene.add(kartu);

    // ===== Tali 3D =====
    const SEG = 60;
    const LEBAR = 0.34;

    const geoTali = new THREE.BufferGeometry();

    const posTali = new Float32Array((SEG + 1) * 6);
    const uvTali = new Float32Array((SEG + 1) * 4);
    const norTali = new Float32Array((SEG + 1) * 6);
    const idx = [];

    for (let i = 0; i <= SEG; i++) {
        uvTali.set([0, i / SEG, 1, i / SEG], i * 4);
        norTali.set([0, 0, 1, 0, 0, 1], i * 6);

        if (i < SEG) {
            const a = i * 2;
            idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
    }

    geoTali.setAttribute(
        "position",
        new THREE.BufferAttribute(posTali, 3)
    );

    geoTali.setAttribute(
        "uv",
        new THREE.BufferAttribute(uvTali, 2)
    );

    geoTali.setAttribute(
        "normal",
        new THREE.BufferAttribute(norTali, 3)
    );

    geoTali.setIndex(idx);

    const tali = new THREE.Mesh(
        geoTali,
        new THREE.MeshStandardMaterial({
            map: TALI.t,
            roughness: 0.85,
            metalness: 0,
            envMapIntensity: 0.15,
            side: THREE.DoubleSide
        })
    );

    tali.frustumCulled = false;
    tali.position.z = -0.03;
    scene.add(tali);

    // ===== Fisika tali dan kartu =====
    const N = 6;
    const A = { x: 0, y: 0 };

    let LEN = 0.4;
    const LINK_KARTU = ATT + CH;

    const pts = [];

    for (let i = 0; i <= N + 1; i++) {
        pts.push({
            x: 0,
            y: 0,
            ox: 0,
            oy: 0,
            w: i === 0 ? 0 : 1,
            fix: i === 0
        });
    }

    const Cp = pts[N];
    const Bp = pts[N + 1];

    let yaw = 0;
    let yawVel = 0;
    let yawTarget = 0;
    let waktu = 0;
    let siap = false;

    let unit = 150;
    let W = 0;
    let H = 0;
    let restBawah = 0;
    let restX = 0;

    const hubung = (a, b, len) => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1e-6;
        const k = (d - len) / d;
        const s = a.w + b.w;

        if (!s) return;

        a.x += dx * k * a.w / s;
        a.y += dy * k * a.w / s;
        b.x -= dx * k * b.w / s;
        b.y -= dy * k * b.w / s;
    };

    const tekuk = (a, b, min) => {
        const d = Math.hypot(b.x - a.x, b.y - a.y);

        if (d < min) hubung(a, b, min);
    };

    function ukuran() {
        W = hero.clientWidth;
        H = hero.clientHeight;

        renderer.setSize(W, H, false);

        unit = W <= 600
            ? 95
            : W <= 900
                ? 100
                : Math.max(100, Math.min(H, 960) * 0.165);

        const dunia = H / unit;

        camera.fov =
            2 * Math.atan(dunia / 2 / CAM_Z) * 180 / Math.PI;

        camera.aspect = W / H;
        camera.updateProjectionMatrix();

        const fx = W <= 600
            ? CARD_X.mobile
            : W <= 900
                ? CARD_X.tablet
                : CARD_X.desktop;

        A.x = (fx - 0.5) * W / unit;
        A.y = dunia / 2 + 0.3;

        const jatuh = Math.max(1.7, (H * 0.27) / unit);

        LEN = (jatuh + 0.3) / N;

        TALI.t.repeat.set(1, (jatuh + 0.3) / 2);

        restX = W * fx;
        restBawah = (jatuh + LINK_KARTU) * unit;

        hint.style.left = restX + "px";
        hint.style.top = restBawah + 26 + "px";

        if (!siap) {
            const a = reduce ? 0 : 0.55;

            for (let i = 0; i <= N + 1; i++) {
                const d = i <= N
                    ? i * LEN
                    : N * LEN + LINK_KARTU;

                const p = pts[i];

                p.x = p.ox = A.x + Math.sin(a) * d;
                p.y = p.oy = A.y - Math.cos(a) * d;
            }

            siap = true;
            hint.classList.add("siap");
        }
    }

    // ===== Interaksi tarik dan balik kartu =====
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const bidang = new THREE.Plane(
        new THREE.Vector3(0, 0, 1),
        0
    );

    const hv = new THREE.Vector3();

    let tarik = false;
    let genggam = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let dX = 0;
    let dY = 0;
    let gerak = 0;
    let pernah = false;
    let tampak = true;

    const setRay = (cx, cy) => {
        const r = canvas.getBoundingClientRect();

        ndc.set(
            ((cx - r.left) / r.width) * 2 - 1,
            -((cy - r.top) / r.height) * 2 + 1
        );

        ray.setFromCamera(ndc, camera);
    };

    const diKartu = (cx, cy) => {
        setRay(cx, cy);
        return ray.intersectObject(kartu, true).length > 0;
    };

    const titikDunia = (cx, cy) => {
        setRay(cx, cy);
        ray.ray.intersectPlane(bidang, hv);

        return { x: hv.x, y: hv.y };
    };

    const terhalang = (el) =>
        el.closest && el.closest("a, button, input, .navbar, .ai-panel");

    window.addEventListener("touchstart", (e) => {
        const t = e.touches[0];

        if (
            tampak &&
            !terhalang(e.target) &&
            diKartu(t.clientX, t.clientY)
        ) {
            e.preventDefault();
        }
    }, { passive: false });

    window.addEventListener("pointerdown", (e) => {
        if (
            !tampak ||
            terhalang(e.target) ||
            !diKartu(e.clientX, e.clientY)
        ) {
            return;
        }

        tarik = true;
        gerak = 0;
        dX = e.clientX;
        dY = e.clientY;

        document.body.classList.add("lanyard-drag");

        const p = titikDunia(e.clientX, e.clientY);

        genggam = {
            x: Bp.x - p.x,
            y: Bp.y - p.y
        };

        target = { x: Bp.x, y: Bp.y };

        if (!pernah) {
            pernah = true;
            hint.classList.add("hide");
        }
    });

    window.addEventListener("pointermove", (e) => {
        if (tarik) {
            gerak = Math.max(
                gerak,
                Math.hypot(e.clientX - dX, e.clientY - dY)
            );

            const p = titikDunia(e.clientX, e.clientY);

            target = {
                x: p.x + genggam.x,
                y: p.y + genggam.y
            };
        } else if (tampak) {
            document.body.classList.toggle(
                "over-card",
                !terhalang(e.target) &&
                diKartu(e.clientX, e.clientY)
            );
        }
    });

    const lepas = () => {
        if (!tarik) return;

        tarik = false;
        Bp.w = 1;

        document.body.classList.remove("lanyard-drag");

        if (gerak < 6) {
            yawTarget = yawTarget === 0 ? Math.PI : 0;
        }
    };

    window.addEventListener("pointerup", lepas);
    window.addEventListener("pointercancel", lepas);

    // ===== Simulasi dan render =====
    const DT = 1 / 60;

    let sisa = 0;
    let terakhir = performance.now();
    let jalan = false;

    function langkah() {
        waktu += DT;

        for (const p of pts) {
            if (p.fix) continue;

            if (tarik && p === Bp) {
                let tx = target.x - A.x;
                let ty = target.y - A.y;

                const d = Math.hypot(tx, ty);
                const m = (N * LEN + LINK_KARTU) * 0.97;

                if (d > m) {
                    tx *= m / d;
                    ty *= m / d;
                }

                p.ox = p.x;
                p.oy = p.y;

                p.x += (A.x + tx - p.x) * 0.4;
                p.y += (A.y + ty - p.y) * 0.4;

                p.w = 0;
                continue;
            }

            const vx = (p.x - p.ox) * DAMPING;
            const vy = (p.y - p.oy) * DAMPING;

            p.ox = p.x;
            p.oy = p.y;

            p.x += vx;
            p.y += vy - GRAVITY * DT * DT;
        }

        if (!tarik && !reduce) {
            Bp.x += Math.sin(waktu * 0.9) * 0.00018;
        }

        pts[0].x = A.x;
        pts[0].y = A.y;

        for (let it = 0; it < 16; it++) {
            for (let i = 0; i < N; i++) {
                hubung(pts[i], pts[i + 1], LEN);
            }

            hubung(Cp, Bp, LINK_KARTU);

            for (let i = 0; i < N - 1; i++) {
                tekuk(pts[i], pts[i + 2], LEN * 1.9);
            }

            pts[0].x = A.x;
            pts[0].y = A.y;
        }

        yawVel += (
            -FLIP_SPRING * (yaw - yawTarget) -
            FLIP_DAMP * yawVel
        ) * DT + (Cp.x - Cp.ox) * 3;

        yaw += yawVel * DT;
    }

    function gambar() {
        const dx = Bp.x - Cp.x;
        const dy = Bp.y - Cp.y;

        const phi = Math.atan2(dx, -dy) + TILT;
        const off = ATT + CH / 2;

        kartu.position.set(
            Cp.x + Math.sin(phi) * off,
            Cp.y - Math.cos(phi) * off,
            0
        );

        kartu.rotation.set(0, yaw, phi, "ZYX");

        const ctrl = [];

        for (let i = 0; i <= N; i++) {
            ctrl.push(new THREE.Vector3(pts[i].x, pts[i].y, 0));
        }

        const kurva = new THREE.CatmullRomCurve3(
            ctrl,
            false,
            "catmullrom",
            0.5
        ).getPoints(SEG);

        for (let i = 0; i <= SEG; i++) {
            const a = kurva[Math.max(i - 1, 0)];
            const b = kurva[Math.min(i + 1, SEG)];

            let tx = b.x - a.x;
            let ty = b.y - a.y;

            const l = Math.hypot(tx, ty) || 1;

            tx /= l;
            ty /= l;

            const c = kurva[i];
            const h = LEBAR / 2;

            posTali.set([
                c.x - ty * h,
                c.y + tx * h,
                0,
                c.x + ty * h,
                c.y - tx * h,
                0
            ], i * 6);
        }

        geoTali.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    function frame(now) {
        if (!jalan) return;

        sisa += Math.min((now - terakhir) / 1000, 0.1);
        terakhir = now;

        if (document.body.classList.contains("loaded")) {
            while (sisa >= DT) {
                langkah();
                sisa -= DT;
            }
        } else {
            sisa = 0;
        }

        gambar();
        requestAnimationFrame(frame);
    }

    function mulai() {
        if (jalan) return;

        jalan = true;
        terakhir = performance.now();

        requestAnimationFrame(frame);
    }

    new ResizeObserver(ukuran).observe(hero);
    ukuran();

    new IntersectionObserver(([e]) => {
        tampak = e.isIntersecting;

        if (tampak) {
            mulai();
        } else {
            jalan = false;
        }
    }).observe(hero);

    window.addEventListener("scroll", () => {
        canvas.classList.toggle("di-belakang", window.scrollY > 30);
    }, { passive: true });
})();
// =========================================================
// MASKOT: robot-hantu putih. Mode terang = imut (headphone & ransel),
// mode gelap = taktis (helm, night vision, rompi). Satu maskot, dua mode.
// =========================================================
(() => {
    const kurangGerak = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pilih = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const sapaanSiang = ["Halo! 👋", "Hai, makasih udah mampir~", "Eh, ada yang datang!", "Selamat datang di sini 🤍"];
    const ucapanMalam = ["Mode malam aktif. Siaga!", "Gelap... night vision menyala.", "Misi dimulai, hati-hati ya!"];
    const ucapanSiangBalik = ["Yeay terang lagi!", "Mode siang, santai dulu~", "Akhirnya cerah lagi~"];
    const kejarSipil = ["Eh jangan dikejar dong! 🙈", "Tangkap aku kalau bisa! 😆"];
    const kejarMiliter = ["Awas, ada yang mendekat!", "Kontak! Mundur!", "Waduh ketahuan!"];
    const ketemuSipil = ["Hehe kena deh~ ✨", "Hai hai! 💙"];
    const ketemuMiliter = ["Target terkunci!", "Siap, laksanakan!"];
    const obrolanSiang = ["Lagi lihat-lihat apa nih?", "Jangan lupa mampir ke Projects ya", "Psst, coba klik tombol tema deh"];
    const bungaEmoji = ["🌸", "🌼", "🌷", "✨", "💮"];
    const bintang = ["⭐", "✨", "💥"];

    const DEFS = `<defs>
        <linearGradient id="mkBadan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dde5f2"/></linearGradient>
        <filter id="mkGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>`;
    const BADAN = `<path d="M50 8C28 8 16 24 16 44c0 16 2 30 8 40 3 6 10 7 14 4 4 4 20 4 24 0 4 3 11 2 14-4 6-10 8-24 8-40C84 24 72 8 50 8Z" fill="url(#mkBadan)" stroke="#c3cde0" stroke-width="1.3"/>`;
    const VISOR = `<rect x="23" y="29" width="54" height="31" rx="14" fill="#0a0d16" stroke="#1d2540" stroke-width="1.2"/><path d="M30 34q11-4 24-3" stroke="#fff" stroke-opacity=".16" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    const planet = (x, y, warna) => `<g fill="none" stroke="${warna}" stroke-width="1.3"><circle cx="${x}" cy="${y}" r="2.8"/><ellipse cx="${x}" cy="${y}" rx="5.2" ry="1.9" transform="rotate(-25 ${x} ${y})"/></g>`;

    function matkan(e, malam) {
        if (malam) {
            const c = "#ff2d3d";
            if (e === "takut") {
                return `<g filter="url(#mkGlow)" fill="${c}"><circle cx="37" cy="45" r="5.6"/><circle cx="63" cy="45" r="5.6"/></g><circle cx="37" cy="45" r="1.9" fill="#2a0508"/><circle cx="63" cy="45" r="1.9" fill="#2a0508"/>`;
            }
            return `<g filter="url(#mkGlow)" fill="${c}"><path d="M29 40 46 47.5 44 54 30 49Z"/><path d="M71 40 54 47.5 56 54 70 49Z"/></g>`;
        }
        const c = "#4fd8ff";
        if (e === "takut") {
            return `<g filter="url(#mkGlow)" fill="${c}"><ellipse cx="37.5" cy="45" rx="4.4" ry="7"/><ellipse cx="62.5" cy="45" rx="4.4" ry="7"/></g><circle cx="38.8" cy="42.4" r="1.5" fill="#fff"/><circle cx="63.8" cy="42.4" r="1.5" fill="#fff"/>`;
        }
        if (e === "sayang") {
            const hati = (x) => `<path d="M${x} 52C${x - 9.5} 45 ${x - 6.5} 38 ${x} 42.5 ${x + 6.5} 38 ${x + 9.5} 45 ${x} 52Z"/>`;
            return `<g filter="url(#mkGlow)" fill="${c}">${hati(37.5)}${hati(62.5)}</g><ellipse cx="28" cy="57" rx="3.4" ry="1.8" fill="#ff8fb5" opacity=".7"/><ellipse cx="72" cy="57" rx="3.4" ry="1.8" fill="#ff8fb5" opacity=".7"/>`;
        }
        const besar = e === "senang";
        const d = besar ? `M30 49q7.5-14 15 0M55 49q7.5-14 15 0` : `M31.5 48q6-11 12 0M56.5 48q6-11 12 0`;
        const pipi = besar ? `<ellipse cx="28" cy="57" rx="3.4" ry="1.8" fill="#ff8fb5" opacity=".7"/><ellipse cx="72" cy="57" rx="3.4" ry="1.8" fill="#ff8fb5" opacity=".7"/>` : "";
        return `<path d="${d}" stroke="${c}" stroke-width="${besar ? 4.2 : 3.6}" fill="none" stroke-linecap="round" filter="url(#mkGlow)"/>${pipi}`;
    }

    function siang(e) {
        const ransel = `<rect x="70" y="52" width="23" height="28" rx="9" fill="#1f2d52"/>${planet(81.5, 66, "#4fc3ff")}`;
        const tali = `<path d="M31 60q-3 11 0 21M69 60q3 11 0 21" stroke="#1f2d52" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
        const tangan = `<ellipse cx="23" cy="71" rx="7.5" ry="6.5" fill="#fff" stroke="#c3cde0" stroke-width="1.2"/><ellipse cx="77" cy="71" rx="7.5" ry="6.5" fill="#fff" stroke="#c3cde0" stroke-width="1.2"/>`;
        const kuping = (x) => `<ellipse cx="${x}" cy="45" rx="8.5" ry="12.5" fill="#1f2d52"/><circle cx="${x + (x < 50 ? 1 : -1)}" cy="45" r="6" fill="#f4f8ff"/>${planet(x + (x < 50 ? 1 : -1), 45, "#2f95e8")}`;
        const pita = `<path d="M18 38C19 12 81 12 82 38" stroke="#1f2d52" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
        return `${ransel}${BADAN}${tali}${tangan}${pita}${kuping(16)}${kuping(84)}${VISOR}${matkan(e, false)}`;
    }

    function malamSvg(e) {
        const ransel = `<rect x="68" y="44" width="26" height="38" rx="8" fill="#23252a" stroke="#111316"/><rect x="73" y="62" width="16" height="12" rx="3" fill="#17191c"/>`;
        const rompi = `<path d="M17 58Q50 51 83 58L84 78Q50 87 16 78Z" fill="#2b2e34" stroke="#15171a" stroke-width="1.2"/>
            <path d="M27 57l3 21M73 57l-3 21" stroke="#1c1e22" stroke-width="4" stroke-linecap="round"/>
            <rect x="34" y="66" width="10" height="9" rx="2" fill="#1c1e22"/><rect x="47" y="67" width="10" height="9" rx="2" fill="#1c1e22"/><rect x="60" y="66" width="9" height="9" rx="2" fill="#1c1e22"/>`;
        const senjata = `<g transform="rotate(-16 50 74)">
            <rect x="10" y="70" width="19" height="10" rx="2.5" fill="#1b1d21"/><rect x="28" y="68" width="40" height="10" rx="2" fill="#26282d"/>
            <rect x="66" y="70.5" width="22" height="5" rx="1.5" fill="#1b1d21"/><rect x="87" y="71.4" width="9" height="3" rx="1" fill="#101113"/>
            <rect x="42" y="76" width="7" height="13" rx="1.5" fill="#15171a"/><rect x="36" y="63.5" width="22" height="5" rx="1.5" fill="#15171a"/>
            <ellipse cx="38" cy="77" rx="6.5" ry="5.5" fill="#fff" stroke="#c3cde0" stroke-width="1.1"/><ellipse cx="70" cy="74" rx="6.5" ry="5.5" fill="#fff" stroke="#c3cde0" stroke-width="1.1"/></g>`;
        const kuping = (x) => `<ellipse cx="${x}" cy="45" rx="8.5" ry="12.5" fill="#2b2e34" stroke="#15171a"/><circle cx="${x + (x < 50 ? 1 : -1)}" cy="45" r="5.4" fill="#1c1e22"/>${planet(x + (x < 50 ? 1 : -1), 45, "#9aa0ac")}`;
        const helm = `<path d="M15 42C12 4 88 4 85 42Q50 29 15 42Z" fill="#2d3036" stroke="#15171a" stroke-width="1.3"/><path d="M26 22Q50 8 74 22" stroke="#4a4e57" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`;
        const nvg = `<rect x="50" y="6" width="28" height="7" rx="2.5" fill="#1c1e22"/>
            <g filter="url(#mkGlow)"><circle cx="58" cy="9" r="5.2" fill="#17191c" stroke="#2f3238"/><circle cx="58" cy="9" r="3.1" fill="#66ff7a"/><circle cx="71" cy="9" r="5.2" fill="#17191c" stroke="#2f3238"/><circle cx="71" cy="9" r="3.1" fill="#66ff7a"/></g>`;
        return `${ransel}${BADAN}${rompi}${senjata}${kuping(16)}${kuping(84)}${VISOR}${matkan(e, true)}${helm}${nvg}`;
    }

    function gambarMaskot(m) {
        const malam = document.body.classList.contains("dark");
        m.sosok.innerHTML = `<svg viewBox="0 0 100 100" role="img" aria-label="Maskot portofolio">${DEFS}${malam ? malamSvg(m.ekspresi) : siang(m.ekspresi)}</svg>`;
    }

    const wrap = document.createElement("div");
    wrap.className = "maskot-wrap";
    document.body.appendChild(wrap);

    function bungaDi(x, y, set) {
        const box = document.createElement("div");
        box.className = "maskot-bunga-global";
        box.style.left = x + "px"; box.style.top = y + "px";
        for (let i = 0; i < 6; i++) {
            const s = document.createElement("span");
            s.textContent = pilih(set);
            const sudut = (i / 6) * Math.PI * 2;
            s.style.setProperty("--dx", Math.cos(sudut) * 40 + "px");
            s.style.setProperty("--dy", Math.sin(sudut) * 40 + "px");
            s.style.animationDelay = (i * 0.03) + "s";
            box.appendChild(s);
        }
        document.body.appendChild(box);
        setTimeout(() => box.remove(), 1000);
    }

    const el = document.createElement("div");
    el.className = "maskot";
    el.innerHTML = `<div class="maskot-bubble"></div><div class="maskot-kaget">!!</div><div class="maskot-sosok"></div><div class="maskot-bayangan"></div>`;
    wrap.appendChild(el);

    const m = {
        el,
        bubble: el.querySelector(".maskot-bubble"),
        kaget: el.querySelector(".maskot-kaget"),
        sosok: el.querySelector(".maskot-sosok"),
        ekspresi: "normal",
        x: innerWidth * 0.3,
        arah: Math.random() < 0.5 ? 1 : -1,
        kecepatan: 0.6,
        gantiBerikut: performance.now() + 2500,
        diamSampai: 0,
        lari: false
    };
    gambarMaskot(m);

    function bicara(teks, lama = 2200) {
        m.bubble.textContent = teks;
        m.bubble.classList.add("tampil");
        clearTimeout(m.bubble._t);
        m.bubble._t = setTimeout(() => m.bubble.classList.remove("tampil"), lama);
    }
    function ubahEkspresi(ekspresi, lama) {
        m.ekspresi = ekspresi;
        gambarMaskot(m);
        if (lama) {
            clearTimeout(m._e);
            m._e = setTimeout(() => { m.ekspresi = "normal"; gambarMaskot(m); }, lama);
        }
    }
    function loncat() {
        if (kurangGerak) return;
        m.el.classList.remove("loncat");
        void m.el.offsetWidth;
        m.el.classList.add("loncat");
        setTimeout(() => m.el.classList.remove("loncat"), 700);
    }

    const batasX = () => Math.max(40, innerWidth - 100);
    setTimeout(() => bicara(pilih(sapaanSiang), 2600), 1600);

    let mouseX = -999, mouseY = -999;
    window.addEventListener("pointermove", (e) => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
    window.addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) { mouseX = t.clientX; mouseY = t.clientY; } }, { passive: true });

    el.addEventListener("click", () => {
        const malam = document.body.classList.contains("dark");
        const r = el.getBoundingClientRect();
        bungaDi(r.left + r.width / 2, r.top + r.height / 2, malam ? bintang : bungaEmoji);
        bicara(pilih(malam ? ketemuMiliter : ketemuSipil), 1600);
        ubahEkspresi(malam ? "takut" : "sayang", 1400);
        loncat();
    });

    function langkah(now) {
        const malam = document.body.classList.contains("dark");
        const pusat = m.x + 39;
        const jarak = Math.hypot(mouseX - pusat, mouseY - (innerHeight - 52));
        let v = m.kecepatan;

        if (jarak < 130) {
            if (!m.lari) {
                m.lari = true;
                bicara(pilih(malam ? kejarMiliter : kejarSipil), 1200);
                ubahEkspresi("takut");
            }
            m.kaget.classList.add("tampil");
            m.arah = pusat < mouseX ? -1 : 1;
            v = 2.6;
        } else {
            if (m.lari) {
                m.lari = false;
                ubahEkspresi("normal");
            }
            m.kaget.classList.remove("tampil");
            if (now > m.gantiBerikut) {
                m.gantiBerikut = now + 2000 + Math.random() * 3000;
                const r = Math.random();
                if (r < 0.3) m.arah *= -1;
                else if (r < 0.5) m.diamSampai = now + 1500;
                else if (r < 0.62) loncat();
                if (!malam && Math.random() < 0.4) {
                    bicara(pilih(obrolanSiang), 2200);
                    ubahEkspresi("senang", 1800);
                }
            }
            v = now < m.diamSampai ? 0 : m.kecepatan;
        }

        if (!kurangGerak) m.x += m.arah * v;
        if (m.x < 10) { m.x = 10; m.arah = 1; }
        if (m.x > batasX()) { m.x = batasX(); m.arah = -1; }

        el.style.transform = `translateX(${m.x}px)`;
        el.classList.toggle("hadap-kiri", m.arah < 0);
        el.classList.toggle("jalan", v > 0.1 && !kurangGerak);
        el.classList.toggle("lari", m.lari && !kurangGerak);

        requestAnimationFrame(langkah);
    }
    requestAnimationFrame(langkah);

    let modeTerakhir = document.body.classList.contains("dark");
    new MutationObserver(() => {
        const gelapSkrg = document.body.classList.contains("dark");
        if (gelapSkrg === modeTerakhir) return;
        modeTerakhir = gelapSkrg;
        ubahEkspresi("takut", 1600);
        bicara(pilih(gelapSkrg ? ucapanMalam : ucapanSiangBalik), 2600);
        loncat();
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

    addEventListener("resize", () => { m.x = Math.min(batasX(), Math.max(10, m.x)); });
})();