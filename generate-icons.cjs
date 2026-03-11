const canvas = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];

// Create TodoNotes icon with checkmark design
function createIcon(size) {
  const c = canvas.createCanvas(size, size);
  const ctx = c.getContext('2d');
  
  // Background - gradient blue/purple
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#6366f1');  // Indigo
  gradient.addColorStop(1, '#8b5cf6');  // Violet
  
  // Rounded rectangle background
  const radius = size * 0.2;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // White checkmark/note icon
  ctx.fillStyle = '#ffffff';
  
  // Draw a stylized checkmark with note
  const centerX = size / 2;
  const centerY = size / 2;
  const iconSize = size * 0.5;
  
  // Note paper shape
  ctx.beginPath();
  const padding = size * 0.2;
  ctx.roundRect(padding, padding, size - 2*padding, size - 2*padding, size * 0.05);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  
  // Lines on note
  ctx.fillStyle = '#6366f1';
  const lineHeight = size * 0.08;
  const lineMargin = size * 0.28;
  const lineWidth = size * 0.35;
  
  // 3 lines representing text
  ctx.fillRect(lineMargin, size * 0.35, lineWidth, lineHeight);
  ctx.fillRect(lineMargin, size * 0.5, lineWidth * 0.8, lineHeight);
  ctx.fillRect(lineMargin, size * 0.65, lineWidth * 0.6, lineHeight);
  
  // Checkmark
  ctx.strokeStyle = '#10b981';  // Green
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(size * 0.55, size * 0.7);
  ctx.lineTo(size * 0.68, size * 0.83);
  ctx.lineTo(size * 0.85, size * 0.55);
  ctx.stroke();
  
  return c;
}

// Create icons
sizes.forEach(size => {
  const icon = createIcon(size);
  const filename = `icon-${size}.png`;
  fs.writeFileSync(path.join('public', filename), icon.toBuffer('image/png'));
  console.log(`Created ${filename}`);
});

// Also create apple-touch-icon (uses 180x180 for iPhone)
const appleIcon = createIcon(180);
fs.writeFileSync(path.join('public', 'apple-touch-icon.png'), appleIcon.toBuffer('image/png'));
console.log('Created apple-touch-icon.png');

// Create favicon
const favicon = createIcon(32);
fs.writeFileSync(path.join('public', 'favicon.ico'), favicon.toBuffer('image/png'));
console.log('Created favicon.ico');

console.log('All icons generated successfully!');
