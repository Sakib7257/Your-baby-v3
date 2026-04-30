const { createCanvas, loadImage, registerFont } = require('canvas');
const cp = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const exec = promisify(cp.exec);

let fontFamily = 'Sans';
let fontFamilyLight = 'Sans';

// ===== SAFE FONT LOAD =====
try {
  const fontPath = path.join(__dirname, 'fonts', 'Orbitron-Bold.ttf');
  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: 'Orbitron' });
    fontFamily = 'Orbitron';
  }
} catch {}

try {
  const fontPath2 = path.join(__dirname, 'fonts', 'Orbitron-Regular.ttf');
  if (fs.existsSync(fontPath2)) {
    registerFont(fontPath2, { family: 'OrbitronLight' });
    fontFamilyLight = 'OrbitronLight';
  }
} catch {}

// ===== HELPERS =====
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// ===== EXPORT =====
module.exports = {
  config: {
    name: "anc",
    version: "8.0",
    author: "Redwan (Xe Mo)",
    role: 0,
    shortDescription: "Xe Mo's Sovereign Command Dashboard",
    longDescription: "Xe Mo's Sovereign Command Dashboard — Ultra Premium Edition",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {

      // ===== SAFE DATA =====
      let cpu = 0, mem = 0, uptime = "0h 0m";
      let cpuCores = "N/A", osInfo = "Linux", nodeVer = process.version || "N/A";
      let totalRam = "N/A", freeRam = "N/A";
      let diskUsage = 0, netInfo = "N/A";
try {
  const up = await exec('uptime -p');
  uptime = up.stdout
    .toString()
    .trim()
    .toLowerCase()
    .replace("up ", "")
    .replace(/,/g, "")
    .replace(/\s+/g, " ")
    .replace(/hours?/g, "h")
    .replace(/minutes?/g, "m")
    .replace(/seconds?/g, "s")
    .trim();
} catch {}
      try {
        const c = await exec("top -bn1 | grep 'Cpu(s)' | awk '{print 100 - $8}'");
        cpu = parseFloat(c.stdout) || 0;
      } catch {}

      try {
        const m = await exec("free | awk '/Mem:/ {printf(\"%.2f\", $3/$2 * 100)}'");
        mem = parseFloat(m.stdout) || 0;
      } catch {}

      try {
        const cores = await exec("nproc");
        cpuCores = cores.stdout.trim() + " Cores";
      } catch {}

      try {
        const os = await exec("uname -r");
        osInfo = "Linux " + os.stdout.trim().split('-')[0];
      } catch {}

      try {
        const ramInfo = await exec("free -h | awk '/Mem:/ {print $2, $3}'");
        const parts = ramInfo.stdout.trim().split(' ');
        totalRam = parts[0] || "N/A";
        freeRam = parts[1] || "N/A";
      } catch {}

      try {
        const disk = await exec("df / | awk 'NR==2 {print $5}' | tr -d '%'");
        diskUsage = parseFloat(disk.stdout) || 0;
      } catch {}

      cpu = parseFloat(cpu).toFixed(1);
      mem = parseFloat(mem).toFixed(1);
      diskUsage = parseFloat(diskUsage).toFixed(1);

      // ===== CANVAS =====
      const W = 960, H = 720;
      const canvas = createCanvas(W, H);
      const ctx = canvas.getContext('2d');

      // ===== BACKGROUND =====
      try {
        const bg = await loadImage('https://i.ibb.co/RTwPYZmp/image.jpg');
        ctx.filter = 'blur(6px) brightness(0.4)';
        ctx.drawImage(bg, 0, 0, W, H);
        ctx.filter = 'none';
      } catch {
        // Deep space fallback
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, '#010409');
        bgGrad.addColorStop(0.4, '#0a0d1a');
        bgGrad.addColorStop(1, '#060212');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // ===== DARK VEIL =====
      const veil = ctx.createLinearGradient(0, 0, 0, H);
      veil.addColorStop(0, 'rgba(4,5,18,0.82)');
      veil.addColorStop(0.5, 'rgba(6,3,20,0.75)');
      veil.addColorStop(1, 'rgba(2,2,12,0.92)');
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, W, H);

      // ===== AMBIENT GLOW BLOBS =====
      function drawGlowBlob(cx, cy, r, color, alpha) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, color.replace('1)', `${alpha})`));
        g.addColorStop(1, color.replace('1)', '0)'));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      drawGlowBlob(160, 120, 220, 'rgba(139,92,246,1)', 0.18);
      drawGlowBlob(820, 600, 200, 'rgba(20,184,166,1)', 0.15);
      drawGlowBlob(500, 360, 280, 'rgba(59,130,246,1)', 0.06);
      drawGlowBlob(80, 600, 180, 'rgba(236,72,153,1)', 0.10);
      drawGlowBlob(900, 100, 150, 'rgba(251,191,36,1)', 0.08);

      // ===== NOISE TEXTURE OVERLAY =====
      for (let i = 0; i < 5000; i++) {
        const nx = Math.random() * W;
        const ny = Math.random() * H;
        const alpha = Math.random() * 0.045;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fillRect(nx, ny, 1, 1);
      }

      // ===== GRID LINES (subtle) =====
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ===== DECORATIVE SCANNING LINE =====
      const scanGrad = ctx.createLinearGradient(0, 0, W, 0);
      scanGrad.addColorStop(0, 'rgba(139,92,246,0)');
      scanGrad.addColorStop(0.4, 'rgba(139,92,246,0.35)');
      scanGrad.addColorStop(0.6, 'rgba(99,102,241,0.35)');
      scanGrad.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, 178, W, 1.5);

      // ===== TOP BORDER LINE =====
      const topBorder = ctx.createLinearGradient(0, 0, W, 0);
      topBorder.addColorStop(0, 'rgba(139,92,246,0)');
      topBorder.addColorStop(0.2, 'rgba(139,92,246,0.9)');
      topBorder.addColorStop(0.5, 'rgba(99,102,241,1)');
      topBorder.addColorStop(0.8, 'rgba(20,184,166,0.9)');
      topBorder.addColorStop(1, 'rgba(20,184,166,0)');
      ctx.fillStyle = topBorder;
      ctx.fillRect(0, 0, W, 2.5);

      // ===== BOTTOM BORDER =====
      const btmBorder = ctx.createLinearGradient(0, 0, W, 0);
      btmBorder.addColorStop(0, 'rgba(20,184,166,0)');
      btmBorder.addColorStop(0.3, 'rgba(20,184,166,0.8)');
      btmBorder.addColorStop(0.7, 'rgba(139,92,246,0.8)');
      btmBorder.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.fillStyle = btmBorder;
      ctx.fillRect(0, H - 2.5, W, 2.5);

      // ===== CORNER BRACKETS =====
      function drawCornerBracket(x, y, size, flip) {
        const sx = flip ? -1 : 1;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(sx, 1);
        ctx.strokeStyle = 'rgba(139,92,246,0.7)';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, size);
        ctx.lineTo(0, 0);
        ctx.lineTo(size, 0);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(99,102,241,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(4, size - 4);
        ctx.lineTo(4, 4);
        ctx.lineTo(size - 4, 4);
        ctx.stroke();
        ctx.restore();
      }

      drawCornerBracket(12, 12, 28, false);
      drawCornerBracket(W - 12, 12, 28, true);
      drawCornerBracket(12, H - 12, 28, false);
      ctx.save();
      ctx.translate(W - 12, H - 12);
      ctx.scale(-1, -1);
      ctx.strokeStyle = 'rgba(139,92,246,0.7)';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 28); ctx.lineTo(0, 0); ctx.lineTo(28, 0);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(99,102,241,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(4, 24); ctx.lineTo(4, 4); ctx.lineTo(24, 4);
      ctx.stroke();
      ctx.restore();

      // ===== CARD FUNCTION (GLASS MORPHISM ULTRA) =====
      function card(x, y, w, h, accentColor = 'rgba(139,92,246,0.5)', glow = false) {
        ctx.save();

        // Shadow / glow
        if (glow) {
          ctx.shadowColor = accentColor.replace(/[\d.]+\)$/, '0.4)');
          ctx.shadowBlur = 28;
        }

        // Outer glow border gradient
        const borderGrad = ctx.createLinearGradient(x, y, x + w, y + h);
        borderGrad.addColorStop(0, accentColor.replace(/[\d.]+\)$/, '0.6)'));
        borderGrad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
        borderGrad.addColorStop(1, accentColor.replace(/[\d.]+\)$/, '0.3)'));

        // Glass fill
        const glassFill = ctx.createLinearGradient(x, y, x, y + h);
        glassFill.addColorStop(0, 'rgba(255,255,255,0.07)');
        glassFill.addColorStop(0.5, 'rgba(255,255,255,0.025)');
        glassFill.addColorStop(1, 'rgba(255,255,255,0.04)');

        ctx.fillStyle = glassFill;
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 16);
        ctx.fill();
        ctx.stroke();

        // Inner highlight top edge
        ctx.shadowBlur = 0;
        const highlight = ctx.createLinearGradient(x, y, x + w, y);
        highlight.addColorStop(0, 'rgba(255,255,255,0)');
        highlight.addColorStop(0.3, 'rgba(255,255,255,0.12)');
        highlight.addColorStop(0.7, 'rgba(255,255,255,0.08)');
        highlight.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = highlight;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 1);
        ctx.lineTo(x + w - 16, y + 1);
        ctx.stroke();

        ctx.restore();
      }

      // ===== SLEEK PROGRESS BAR =====
      function bar(x, y, w, p, color1, color2) {
        const pct = Math.min(Math.max(p, 0), 100);

        // Track
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.beginPath();
        ctx.roundRect(x, y, w, 7, 3.5);
        ctx.fill();

        // Fill gradient
        const barGrad = ctx.createLinearGradient(x, y, x + w, y);
        barGrad.addColorStop(0, color1);
        barGrad.addColorStop(1, color2);
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(x, y, w * (pct / 100), 7, 3.5);
        ctx.fill();

        // Shimmer
        const shimmer = ctx.createLinearGradient(x, y, x, y + 7);
        shimmer.addColorStop(0, 'rgba(255,255,255,0.3)');
        shimmer.addColorStop(0.5, 'rgba(255,255,255,0)');
        ctx.fillStyle = shimmer;
        ctx.beginPath();
        ctx.roundRect(x, y, w * (pct / 100), 3.5, [3.5, 3.5, 0, 0]);
        ctx.fill();

        // Glow tip
        if (pct > 2) {
          const tipX = x + w * (pct / 100) - 4;
          const tipGlow = ctx.createRadialGradient(tipX, y + 3.5, 0, tipX, y + 3.5, 10);
          tipGlow.addColorStop(0, color2.replace(/[\d.]+\)$/, '0.6)'));
          tipGlow.addColorStop(1, color2.replace(/[\d.]+\)$/, '0)'));
          ctx.fillStyle = tipGlow;
          ctx.fillRect(tipX - 10, y - 6, 20, 18);
        }
      }

      // ===== RING GAUGE (premium) =====
      function ringGauge(cx, cy, r, pct, label, value, colorA, colorB) {
        pct = Math.min(Math.max(pct, 0), 100);
        const startAngle = -Math.PI * 0.75;
        const endAngle = Math.PI * 0.75;
        const fillAngle = startAngle + (endAngle - startAngle) * (pct / 100);

        // Outer glow
        ctx.save();
        ctx.shadowColor = colorA.replace(/[\d.]+\)$/, '0.5)');
        ctx.shadowBlur = 18;

        // BG arc
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.stroke();

        // Gradient arc
        const arcGrad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
        arcGrad.addColorStop(0, colorA);
        arcGrad.addColorStop(1, colorB);
        ctx.strokeStyle = arcGrad;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, fillAngle);
        ctx.stroke();
        ctx.restore();

        // Tick marks
        for (let i = 0; i <= 10; i++) {
          const a = startAngle + (endAngle - startAngle) * (i / 10);
          const inner = r + 14;
          const outer = r + (i % 5 === 0 ? 20 : 17);
          ctx.strokeStyle = i / 10 <= pct / 100
            ? colorA.replace(/[\d.]+\)$/, '0.6)')
            : 'rgba(255,255,255,0.15)';
          ctx.lineWidth = i % 5 === 0 ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(cx + inner * Math.cos(a), cy + inner * Math.sin(a));
          ctx.lineTo(cx + outer * Math.cos(a), cy + outer * Math.sin(a));
          ctx.stroke();
        }

        // Value text
        ctx.fillStyle = '#fff';
        ctx.font = `bold 22px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = colorA.replace(/[\d.]+\)$/, '0.8)');
        ctx.shadowBlur = 12;
        ctx.fillText(value + '%', cx, cy - 4);
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(200,200,220,0.7)';
        ctx.font = `10px ${fontFamilyLight || fontFamily}`;
        ctx.fillText(label, cx, cy + 16);
        ctx.textBaseline = 'alphabetic';
      }

      // ===== STAT DOT BADGE =====
      function dot(x, y, color) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ===== HEXAGON ICON =====
      function hexIcon(cx, cy, r, fillColor) {
        ctx.save();
        ctx.shadowColor = fillColor.replace(/[\d.]+\)$/, '0.5)');
        ctx.shadowBlur = 12;
        ctx.fillStyle = fillColor.replace(/[\d.]+\)$/, '0.15)');
        ctx.strokeStyle = fillColor.replace(/[\d.]+\)$/, '0.6)');
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 180 * (60 * i - 30);
          const px = cx + r * Math.cos(a);
          const py = cy + r * Math.sin(a);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // ===== SECTION DIVIDER =====
      function divider(y, label) {
        const dGrad = ctx.createLinearGradient(30, y, W - 30, y);
        dGrad.addColorStop(0, 'rgba(139,92,246,0)');
        dGrad.addColorStop(0.1, 'rgba(139,92,246,0.5)');
        dGrad.addColorStop(0.9, 'rgba(20,184,166,0.5)');
        dGrad.addColorStop(1, 'rgba(20,184,166,0)');
        ctx.fillStyle = dGrad;
        ctx.fillRect(30, y, W - 60, 1);

        if (label) {
          ctx.fillStyle = 'rgba(180,180,220,0.5)';
          ctx.font = `9px ${fontFamilyLight || fontFamily}`;
          ctx.textAlign = 'left';
          ctx.fillText('◆  ' + label + '  ◆', 30, y - 6);
        }
      }

      // ===========================
      // ===== HEADER SECTION =====
      // ===========================

      // Logo hex
      hexIcon(52, 50, 22, 'rgba(139,92,246,1)');

      // ⚙ symbol inside hex
      ctx.fillStyle = 'rgba(200,180,255,0.9)';
      ctx.font = `bold 16px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText('⚡', 52, 56);

      // Title
      const titleGrad = ctx.createLinearGradient(84, 30, 400, 70);
      titleGrad.addColorStop(0, '#c4b5fd');
      titleGrad.addColorStop(0.4, '#818cf8');
      titleGrad.addColorStop(0.8, '#2dd4bf');
      titleGrad.addColorStop(1, '#60a5fa');
      ctx.fillStyle = titleGrad;
      ctx.font = `bold 32px ${fontFamily}`;
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(139,92,246,0.7)';
      ctx.shadowBlur = 20;
      ctx.fillText('SOVEREIGN COMMAND', 84, 47);
      ctx.shadowBlur = 0;

      // Subtitle
      ctx.fillStyle = 'rgba(148,163,184,0.85)';
      ctx.font = `11px ${fontFamilyLight || fontFamily}`;
      ctx.fillText('DASHBOARD  ·  ULTRA PREMIUM  ·  SYSTEM MONITOR', 84, 66);

      // Author tag
      const authBadgeX = W - 16;
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(139,92,246,0.25)';
      ctx.beginPath();
      ctx.roundRect(authBadgeX - 188, 32, 188, 26, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(139,92,246,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#c4b5fd';
      ctx.font = `bold 11px ${fontFamily}`;
      ctx.fillText('✦  Tanjiro)  ✦', authBadgeX - 10, 49);

      // Datetime
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      ctx.fillStyle = 'rgba(148,163,184,0.7)';
      ctx.font = `10px ${fontFamilyLight || fontFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText(`${dateStr}  |  ${timeStr}`, W - 20, 75);

      // Status dot
      dot(W - 190, 49, '#2dd4bf');

      divider(88, 'SYSTEM STATUS OVERVIEW');

      // ===========================
      // ===== STAT CARDS ROW =====
      // ===========================

      const cardY = 100, cardH = 105, cardW = 200;
      const cards = [
        {
          x: 18, label: 'UPTIME', value: uptime, sub: 'System Active',
          c1: '#2dd4bf', c2: '#0ea5e9', accent: 'rgba(45,212,191,1)', pct: 80
        },
        {
          x: 238, label: 'CPU LOAD', value: cpu + '%', sub: cpuCores,
          c1: '#f472b6', c2: '#e11d48', accent: 'rgba(244,114,182,1)', pct: cpu
        },
        {
          x: 458, label: 'RAM USAGE', value: mem + '%', sub: `${freeRam} / ${totalRam}`,
          c1: '#a78bfa', c2: '#7c3aed', accent: 'rgba(167,139,250,1)', pct: mem
        },
        {
          x: 678, label: 'DISK USAGE', value: diskUsage + '%', sub: 'Root Partition',
          c1: '#fbbf24', c2: '#f59e0b', accent: 'rgba(251,191,36,1)', pct: diskUsage
        },
      ];

      cards.forEach(cd => {
        card(cd.x, cardY, cardW, cardH, cd.accent, true);

        // Corner accent triangle
        ctx.save();
        ctx.fillStyle = cd.accent.replace(/[\d.]+\)$/, '0.15)');
        ctx.beginPath();
        ctx.moveTo(cd.x + cardW - 2, cardY + 2);
        ctx.lineTo(cd.x + cardW - 2, cardY + 36);
        ctx.lineTo(cd.x + cardW - 36, cardY + 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Label
        ctx.fillStyle = cd.accent;
        ctx.font = `bold 9px ${fontFamily}`;
        ctx.textAlign = 'left';
        ctx.fillText('◈ ' + cd.label, cd.x + 14, cardY + 22);

        // Value
        const valGrad = ctx.createLinearGradient(cd.x + 14, cardY + 30, cd.x + 14, cardY + 70);
        valGrad.addColorStop(0, '#fff');
        valGrad.addColorStop(1, 'rgba(200,200,220,0.7)');
        ctx.fillStyle = valGrad;
        ctx.font = `bold 28px ${fontFamily}`;
        ctx.shadowColor = cd.accent;
        ctx.shadowBlur = 10;
        ctx.fillText(cd.value, cd.x + 14, cardY + 60);
        ctx.shadowBlur = 0;

        // Sub label
        ctx.fillStyle = 'rgba(148,163,184,0.75)';
        ctx.font = `9px ${fontFamilyLight || fontFamily}`;
        ctx.fillText(cd.sub, cd.x + 14, cardY + 76);

        // Bar
        bar(cd.x + 14, cardY + 87, cardW - 28, cd.pct, cd.c1, cd.c2);

        // Percentage micro label
        ctx.fillStyle = cd.accent;
        ctx.font = `8px ${fontFamily}`;
        ctx.textAlign = 'right';
        ctx.fillText(parseFloat(cd.pct).toFixed(0) + '%', cd.x + cardW - 14, cardY + 97);
      });

      divider(214, 'PERFORMANCE GAUGES');

      // ===========================
      // ===== GAUGE SECTION =====
      // ===========================

      const gaugeY = 380;
      card(18, 224, 580, 280, 'rgba(99,102,241,0.5)', true);

      // Section title inside card
      ctx.fillStyle = 'rgba(165,180,252,0.9)';
      ctx.font = `bold 11px ${fontFamily}`;
      ctx.textAlign = 'left';
      ctx.fillText('◈ REAL-TIME PERFORMANCE ANALYSIS', 36, 248);

      ringGauge(145, 360, 66, cpu, 'CPU', cpu,
        'rgba(244,114,182,1)', 'rgba(225,29,72,0.8)');

      ringGauge(330, 360, 66, mem, 'RAM', mem,
        'rgba(167,139,250,1)', 'rgba(124,58,237,0.8)');

      ringGauge(510, 360, 66, diskUsage, 'DISK', diskUsage,
        'rgba(251,191,36,1)', 'rgba(245,158,11,0.8)');

      // Legend row
      const legends = [
        { label: 'CPU', color: '#f472b6' },
        { label: 'RAM', color: '#a78bfa' },
        { label: 'DISK', color: '#fbbf24' },
      ];
      legends.forEach((lg, i) => {
        const lx = 90 + i * 185;
        dot(lx, 458, lg.color);
        ctx.fillStyle = 'rgba(148,163,184,0.75)';
        ctx.font = `9px ${fontFamilyLight || fontFamily}`;
        ctx.textAlign = 'left';
        ctx.fillText(lg.label, lx + 10, 462);
      });

      // ===========================
      // ===== SIDE PANEL =====
      // ===========================

      card(616, 224, 326, 280, 'rgba(20,184,166,0.5)', true);

      ctx.fillStyle = 'rgba(45,212,191,0.9)';
      ctx.font = `bold 11px ${fontFamily}`;
      ctx.textAlign = 'left';
      ctx.fillText('◈ SYSTEM ENVIRONMENT', 634, 248);

      const sysInfoRows = [
        { icon: '⚙', label: 'Node.js', value: nodeVer },
        { icon: '🐧', label: 'OS Kernel', value: osInfo },
        { icon: '⚡', label: 'CPU Cores', value: cpuCores },
        { icon: '📀', label: 'Total RAM', value: totalRam },
        { icon: '💾', label: 'RAM Used', value: freeRam },
        { icon: '🔷', label: 'Status', value: 'ONLINE ●' },
      ];

      sysInfoRows.forEach((row, i) => {
        const ry = 272 + i * 36;

        // Row bg
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)';
        ctx.beginPath();
        ctx.roundRect(630, ry - 14, 298, 28, 6);
        ctx.fill();

        // Icon
        ctx.font = `14px ${fontFamily}`;
        ctx.fillText(row.icon, 638, ry + 6);

        // Label
        ctx.fillStyle = 'rgba(148,163,184,0.75)';
        ctx.font = `9px ${fontFamilyLight || fontFamily}`;
        ctx.fillText(row.label.toUpperCase(), 660, ry);

        // Value
        const isStatus = row.label === 'Status';
        ctx.fillStyle = isStatus ? '#2dd4bf' : '#e2e8f0';
        ctx.font = `bold 11px ${fontFamily}`;
        ctx.textAlign = 'right';
        if (isStatus) {
          ctx.shadowColor = '#2dd4bf';
          ctx.shadowBlur = 8;
        }
        ctx.fillText(row.value, 920, ry);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'left';
      });

      divider(516, 'ACTIVITY TIMELINE');

      // ===========================
      // ===== TIMELINE BAR =====
      // ===========================

      card(18, 524, 922, 90, 'rgba(99,102,241,0.4)', false);

      ctx.fillStyle = 'rgba(165,180,252,0.9)';
      ctx.font = `bold 11px ${fontFamily}`;
      ctx.textAlign = 'left';
      ctx.fillText('◈ LOAD SIMULATION SPECTRUM', 36, 548);

      const timeSlots = 24;
      const slotW = (W - 80) / timeSlots;
      for (let i = 0; i < timeSlots; i++) {
        const h_ = 20 + Math.random() * 42;
        const hue = i / timeSlots;
        const rVal = Math.round(lerp(139, 20, hue));
        const gVal = Math.round(lerp(92, 184, hue));
        const bVal = Math.round(lerp(246, 166, hue));
        const slotGrad = ctx.createLinearGradient(0, 600, 0, 560);
        slotGrad.addColorStop(0, `rgba(${rVal},${gVal},${bVal},0.8)`);
        slotGrad.addColorStop(1, `rgba(${rVal},${gVal},${bVal},0.2)`);
        ctx.fillStyle = slotGrad;
        ctx.beginPath();
        ctx.roundRect(36 + i * slotW + 2, 600 - h_, slotW - 4, h_, [3, 3, 0, 0]);
        ctx.fill();

        if (i % 6 === 0) {
          ctx.fillStyle = 'rgba(148,163,184,0.5)';
          ctx.font = `7px ${fontFamilyLight || fontFamily}`;
          ctx.textAlign = 'center';
          ctx.fillText(`${String(i).padStart(2, '0')}:00`, 36 + i * slotW + slotW / 2, 610);
        }
      }

      // ===========================
      // ===== FOOTER =====
      // ===========================

      divider(624, '');

      // Left: version
      ctx.fillStyle = 'rgba(100,116,139,0.7)';
      ctx.font = `9px ${fontFamilyLight || fontFamily}`;
      ctx.textAlign = 'left';
      ctx.fillText('v8.0  ·  SOVEREIGN COMMAND DASHBOARD', 30, 644);

      // Center decoration
      ctx.fillStyle = 'rgba(139,92,246,0.6)';
      ctx.font = `10px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText('◆ ◆ ◆', W / 2, 644);

      // Right: author
      const footerGrad = ctx.createLinearGradient(W - 220, 635, W - 16, 650);
      footerGrad.addColorStop(0, '#c4b5fd');
      footerGrad.addColorStop(1, '#2dd4bf');
      ctx.fillStyle = footerGrad;
      ctx.font = `bold 9px ${fontFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText('CRAFTED BY  Tanjiro)', W - 16, 644);

      // ===== CORNER DETAILS (decorative data strings) =====
      ctx.fillStyle = 'rgba(99,102,241,0.3)';
      ctx.font = `7px ${fontFamilyLight || fontFamily}`;
      ctx.textAlign = 'left';
      ctx.fillText('SYS::ARCH_X64  //  NET::STABLE  //  SEC::ACTIVE', 30, 660);
      ctx.textAlign = 'right';
      ctx.fillText('UPT::' + uptime + '  //  PRC::NOMINAL  //  AUTH::XE_MO', W - 30, 660);

      // ===== GLOSS OVERLAY =====
      const glossGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
      glossGrad.addColorStop(0, 'rgba(255,255,255,0.025)');
      glossGrad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glossGrad;
      ctx.fillRect(0, 0, W, H);

      // ===== VIGNETTE =====
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      // ===== SAVE =====
      const img = path.join(__dirname, 'anc.png');
      fs.writeFileSync(img, canvas.toBuffer());

      return api.sendMessage({
        attachment: fs.createReadStream(img)
      }, event.threadID);

    } catch (err) {
      console.log(err);
      return api.sendMessage("❌ Error generating dashboard!", event.threadID);
    }
  }
};
