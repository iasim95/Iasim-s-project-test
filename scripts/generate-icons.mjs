import sharp from "sharp";
import { mkdirSync } from "fs";

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="45%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient>
    <linearGradient id="logo-vignette" x1="0%" y1="60%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.18"/>
    </linearGradient>
    <radialGradient id="logo-gloss" cx="32%" cy="18%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="512" height="512" rx="115" fill="url(#logo-bg)"/>
  <rect width="512" height="512" rx="115" fill="url(#logo-vignette)"/>
  <rect width="512" height="512" rx="115" fill="url(#logo-gloss)"/>
  <text x="256" y="362" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-weight="700" font-size="292" fill="#0f2454" opacity="0.25">€</text>
  <text x="256" y="356" text-anchor="middle" font-family="Arial, Helvetica, sans-serif"
        font-weight="700" font-size="292" fill="#ffffff">€</text>
</svg>
`;

mkdirSync("public/icons", { recursive: true });

const sizes = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(`public/icons/${name}`);
  console.log("wrote", name);
}
