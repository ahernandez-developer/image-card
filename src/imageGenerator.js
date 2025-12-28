import sharp from 'sharp';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function imageGenerator({ headlineText, mainImageUrl, options }) {
  try {
    const mainImageResponse = await axios({
      url: mainImageUrl,
      responseType: 'arraybuffer',
    });
    const mainImageBuffer = Buffer.from(mainImageResponse.data, 'binary');

    const canvasWidth = 1080;
    const canvasHeight = 1080;
    const padding = 40;
    const fontSize = 60; // Reduced font size
    const lineHeight = fontSize * 1.2;

    // 1. Main Image (Background)
    const mainImageLayer = await sharp(mainImageBuffer)
      .resize({
        width: canvasWidth,
        height: canvasHeight,
        fit: 'cover',
        position: 'center',
      })
      .toBuffer();

    // 2. Branding (Logo)
    const logoPath = path.join(__dirname, '../assets', 'logo.jpg');
    const logoSize = 150;
    const circleMask = Buffer.from(
      `<svg><circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" /></svg>`
    );
    const logoBuffer = await sharp(logoPath)
      .resize({ width: logoSize, height: logoSize })
      .composite([{
        input: circleMask,
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();

    // 4. Text and Accent Bar
    const accentColor = options?.accentColor || '#FFD700';
    const wrappedLines = wrapText(headlineText, canvasWidth - padding * 2, fontSize);
    const textHeight = wrappedLines.length * lineHeight;
    const accentBarHeight = 10;
    const accentBarY = canvasHeight - textHeight - padding - accentBarHeight - 10; // 10px above the text
    const textStartY = accentBarY + accentBarHeight + 10;

    // 3. Gradient Overlay
    const gradientStartY = accentBarY - padding; // Start gradient above the accent bar
    const gradientHeight = canvasHeight - gradientStartY;
    const gradientBuffer = await sharp({
      create: {
        width: canvasWidth,
        height: gradientHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg><defs><linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:black;stop-opacity:0" /><stop offset="50%" style="stop-color:black;stop-opacity:0.8" /><stop offset="100%" style="stop-color:black;stop-opacity:0.8" /></linearGradient></defs><rect x="0" y="0" width="${canvasWidth}" height="${gradientHeight}" fill="url(#grad)" /></svg>`
          ),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();
    
    const accentBarWidth = 300;
    const textSvg = `
      <svg width="${canvasWidth}" height="${canvasHeight}">
        <style>
          .title {
            fill: white;
            font-size: ${fontSize}px;
            font-weight: bold;
            font-family: 'DejaVu Sans', 'Noto Sans', sans-serif;
            text-transform: uppercase;
          }
        </style>
        <rect x="${padding}" y="${accentBarY}" width="${accentBarWidth}" height="${accentBarHeight}" fill="${accentColor}" />
        <text x="${padding}" y="${textStartY + fontSize * 0.8}" class="title">
          ${wrappedLines.map((line, index) => `<tspan x="${padding}" dy="${index === 0 ? 0 : lineHeight}px">${line}</tspan>`).join('')}
        </text>
      </svg>
    `;
    const textBuffer = Buffer.from(textSvg);

    // Composite all layers
    const finalImage = await sharp(mainImageLayer)
      .composite([
        {
          input: gradientBuffer,
          top: gradientStartY,
          left: 0,
        },
        {
          input: logoBuffer,
          top: padding,
          left: padding,
        },
        {
          input: textBuffer,
          top: 0,
          left: 0,
        },
      ])
      .toFormat(options?.outputFormat || 'jpeg')
      .toBuffer();

    return finalImage;
  } catch (error) {
    console.error('Error in imageGenerator:', error);
    throw new Error('Failed to generate image');
  }
}

// Basic text wrapping function (approximation)
function wrapText(text, maxWidth, fontSize) {
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';
  const avgCharWidth = fontSize * 0.55; // Adjusted approximation

  words.forEach(word => {
    if ((currentLine + word).length * avgCharWidth > maxWidth) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  lines.push(currentLine.trim());
  return lines.filter(line => line.length > 0);
}