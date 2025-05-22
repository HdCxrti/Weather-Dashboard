const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'client', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log(`Created directory: ${iconsDir}`);
}

// Source icon
const sourceIcon = path.join(__dirname, 'generated-icon.png');

// Required icon sizes
const sizes = [72, 96, 128, 144, 192, 512];

// Create icons of different sizes
sizes.forEach(size => {
  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  sharp(sourceIcon)
    .resize(size, size)
    .toFile(outputPath)
    .then(() => {
      console.log(`Created icon: ${outputPath}`);
    })
    .catch(err => {
      console.error(`Error creating ${size}x${size} icon:`, err);
    });
});
