const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const repoRoot = path.resolve(__dirname, '../..');
const outputDir = path.join(repoRoot, 'image/social');
const portraitPath = path.join(repoRoot, 'image/clinic-portrait.png');
const qrPath = path.join(outputDir, 'booking-qr.png');

const portrait = fs.readFileSync(portraitPath).toString('base64');
const qr = fs.readFileSync(qrPath).toString('base64');

const palette = {
  paper: '#f4f1ea',
  surface: '#faf8f2',
  ink: '#1c1a17',
  muted: '#605a50',
  accent: '#8a302a',
  accentSoft: '#ead9d5',
  line: '#d9d3c7',
  navy: '#173f6a',
  green: '#20a86b',
  greenSoft: '#e4f4ec',
  gold: '#c98c1d',
};

const font = 'DejaVu Sans, Arial, sans-serif';

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function svgShell(width, height, body, definitions = '') {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>${definitions}</defs>
    <rect width="${width}" height="${height}" fill="${palette.paper}"/>
    ${body}
  </svg>`;
}

function arText({ x, y, text, size, weight = 600, fill = palette.ink, anchor = 'end', letterSpacing = 0 }) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${font}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${letterSpacing}">${xmlEscape(text)}</text>`;
}

function enText({ x, y, text, size, weight = 500, fill = palette.muted, anchor = 'start', letterSpacing = 0 }) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${font}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" direction="ltr" letter-spacing="${letterSpacing}">${xmlEscape(text)}</text>`;
}

function pill({ x, y, width, label, fill = palette.surface, stroke = palette.line, color = palette.ink, size = 24 }) {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="62" rx="31" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
    ${arText({ x: x + width / 2, y: y + 41, text: label, size, weight: 600, fill: color, anchor: 'middle' })}`;
}

function serviceCard({ x, y, width, kicker, title, english, accent = palette.accent, accentFill = palette.accentSoft }) {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="178" rx="26" fill="${palette.surface}" stroke="${palette.line}" stroke-width="2"/>
    <rect x="${x + width - 18}" y="${y}" width="18" height="178" rx="9" fill="${accent}"/>
    <rect x="${x + 28}" y="${y + 28}" width="116" height="38" rx="19" fill="${accentFill}"/>
    ${arText({ x: x + 86, y: y + 55, text: kicker, size: 19, weight: 700, fill: accent, anchor: 'middle' })}
    ${arText({ x: x + width - 48, y: y + 102, text: title, size: 31, weight: 700 })}
    ${enText({ x: x + width - 48, y: y + 143, text: english, size: 20, weight: 500, anchor: 'end' })}`;
}

function posterSvg() {
  const defs = `
    <clipPath id="poster-photo"><rect x="72" y="190" width="936" height="570" rx="42"/></clipPath>
    <linearGradient id="poster-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.58" stop-color="#1c1a17" stop-opacity="0"/><stop offset="1" stop-color="#1c1a17" stop-opacity="0.56"/></linearGradient>
    <filter id="poster-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#5a5044" flood-opacity="0.16"/></filter>`;

  const body = `
    <rect x="0" y="0" width="1080" height="18" fill="${palette.accent}"/>
    ${arText({ x: 1008, y: 148, text: 'عيادات حضورية واستشارات عن بُعد', size: 30, weight: 700, fill: palette.accent })}
    ${enText({ x: 72, y: 147, text: 'ENT & PEDIATRIC ENT', size: 20, weight: 700, fill: palette.muted, letterSpacing: 2 })}

    <rect x="72" y="190" width="936" height="570" rx="42" fill="#ddd8d0"/>
    <image href="data:image/png;base64,${portrait}" x="72" y="190" width="936" height="570" preserveAspectRatio="xMidYMin slice" clip-path="url(#poster-photo)"/>
    <rect x="72" y="190" width="936" height="570" rx="42" fill="url(#poster-fade)"/>
    ${arText({ x: 950, y: 658, text: 'د. علي سعد الشهراني', size: 58, weight: 700, fill: '#ffffff' })}
    ${enText({ x: 950, y: 700, text: 'Dr Ali Saad Alshahrani', size: 25, weight: 600, fill: '#f4f1ea', anchor: 'end' })}

    <g filter="url(#poster-shadow)">
      <rect x="64" y="720" width="952" height="292" rx="38" fill="${palette.surface}"/>
    </g>
    ${arText({ x: 950, y: 806, text: 'استشاري الأنف والأذن والحنجرة', size: 43, weight: 700, fill: palette.navy })}
    ${arText({ x: 950, y: 867, text: 'تخصص دقيق في طب أنف وأذن وحنجرة الأطفال', size: 33, weight: 600 })}
    ${enText({ x: 950, y: 915, text: 'Consultant Otolaryngologist | Pediatric ENT', size: 25, weight: 500, fill: palette.muted, anchor: 'end' })}
    <line x1="130" y1="953" x2="950" y2="953" stroke="${palette.line}" stroke-width="2"/>
    ${arText({ x: 950, y: 991, text: 'للأطفال والبالغين', size: 24, weight: 600, fill: palette.accent })}

    ${arText({ x: 1008, y: 1082, text: 'اختر طريقة الحجز المناسبة', size: 38, weight: 700 })}
    ${enText({ x: 72, y: 1080, text: 'Choose how you would like to book', size: 21, weight: 500, fill: palette.muted })}

    ${serviceCard({ x: 72, y: 1120, width: 450, kicker: 'حضوري', title: 'عيادات بلسم', english: 'Balsam Clinics' })}
    ${serviceCard({ x: 558, y: 1120, width: 450, kicker: 'عن بُعد', title: 'سنار', english: 'Sanar' })}
    ${serviceCard({ x: 72, y: 1320, width: 450, kicker: 'عن بُعد', title: 'كيورا', english: 'Cura' })}
    ${serviceCard({ x: 558, y: 1320, width: 450, kicker: 'عبر التطبيق', title: 'الحبيب لايف كير', english: 'Al Habib Live Care', accent: palette.green, accentFill: palette.greenSoft })}

    <rect x="72" y="1518" width="232" height="232" rx="28" fill="${palette.surface}" stroke="${palette.line}" stroke-width="2"/>
    <image href="data:image/png;base64,${qr}" x="88" y="1534" width="200" height="200"/>
    ${arText({ x: 1008, y: 1589, text: 'للحجز وعرض جميع الخيارات', size: 36, weight: 700, fill: palette.accent })}
    ${arText({ x: 1008, y: 1644, text: 'امسح الرمز أو افتح الرابط', size: 27, weight: 600 })}
    ${enText({ x: 1008, y: 1692, text: 'shahrani.me/clinic-booking.html', size: 24, weight: 600, fill: palette.navy, anchor: 'end' })}
    ${enText({ x: 1008, y: 1730, text: 'Scan to book', size: 20, weight: 500, fill: palette.muted, anchor: 'end' })}
    ${arText({ x: 1008, y: 1802, text: 'للحالات الطارئة: يرجى التوجه إلى أقرب قسم طوارئ.', size: 18, weight: 500, fill: palette.muted })}`;

  return svgShell(1080, 1920, body, defs);
}

function profileSvg() {
  const defs = `
    <clipPath id="profile-photo"><circle cx="540" cy="540" r="486"/></clipPath>
    <filter id="profile-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#5a5044" flood-opacity="0.18"/></filter>`;

  const body = `
    <circle cx="540" cy="540" r="512" fill="${palette.surface}" stroke="${palette.line}" stroke-width="4" filter="url(#profile-shadow)"/>
    <image href="data:image/png;base64,${portrait}" x="54" y="54" width="972" height="972" preserveAspectRatio="xMidYMid slice" clip-path="url(#profile-photo)"/>
    <circle cx="540" cy="540" r="486" fill="none" stroke="${palette.accent}" stroke-width="14"/>`;

  return svgShell(1080, 1080, body, defs);
}

function whatsappCoverSvg() {
  const defs = `
    <clipPath id="header-photo"><path d="M825 0h300v600H710c72-150 104-346 115-600Z"/></clipPath>
    <linearGradient id="header-fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${palette.paper}" stop-opacity="0"/><stop offset="1" stop-color="${palette.paper}" stop-opacity="0.55"/></linearGradient>`;

  const body = `
    <rect x="0" y="0" width="18" height="600" fill="${palette.accent}"/>
    <image href="data:image/png;base64,${portrait}" x="710" y="0" width="415" height="600" preserveAspectRatio="xMidYMid slice" clip-path="url(#header-photo)"/>
    <rect x="680" y="0" width="160" height="600" fill="url(#header-fade)"/>

    ${arText({ x: 735, y: 116, text: 'د. علي سعد الشهراني', size: 49, weight: 700, fill: palette.navy })}
    ${arText({ x: 735, y: 177, text: 'استشاري الأنف والأذن والحنجرة', size: 31, weight: 700 })}
    ${arText({ x: 735, y: 224, text: 'تخصص دقيق في طب أنف وأذن وحنجرة الأطفال', size: 24, weight: 600 })}
    ${enText({ x: 735, y: 262, text: 'Consultant Otolaryngologist | Pediatric ENT', size: 19, weight: 500, fill: palette.muted, anchor: 'end' })}

    ${pill({ x: 54, y: 326, width: 172, label: 'عيادات بلسم', size: 20 })}
    ${pill({ x: 242, y: 326, width: 114, label: 'سنار', size: 20 })}
    ${pill({ x: 372, y: 326, width: 114, label: 'كيورا', size: 20 })}
    ${pill({ x: 502, y: 326, width: 230, label: 'الحبيب لايف كير', fill: palette.greenSoft, stroke: palette.green, color: palette.green, size: 20 })}

    ${arText({ x: 735, y: 477, text: 'عيادات حضورية واستشارات عن بُعد', size: 25, weight: 700, fill: palette.accent })}
    ${enText({ x: 735, y: 520, text: 'shahrani.me/clinic-booking.html', size: 21, weight: 600, fill: palette.navy, anchor: 'end' })}`;

  return svgShell(1125, 600, body, defs);
}

async function render(name, svg, width, height) {
  const imagePath = path.join(outputDir, `${name}.jpg`);
  await sharp(Buffer.from(svg))
    .resize(width, height)
    .flatten({ background: palette.paper })
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toFile(imagePath);
  return { imagePath };
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const outputs = await Promise.all([
    render('whatsapp-clinic-poster', posterSvg(), 1080, 1920),
    render('whatsapp-profile', profileSvg(), 1080, 1080),
    render('whatsapp-business-cover', whatsappCoverSvg(), 1125, 600),
  ]);
  for (const output of outputs) {
    console.log(path.relative(repoRoot, output.imagePath));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
