import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const sharp = require('sharp')

const SRC = 'C:/Users/nadi5/OneDrive/Desktop/AI/אפליקציה חבר מועדון urban/Avatar/'
const OUT = 'C:/Users/nadi5/OneDrive/Desktop/AI/clude code test/urban-app/public/avatars/'
const TARGET_H = 700

/**
 * Chroma-key the green backdrop.
 *
 * Green only leads the other channels in the backdrop — skin, the burgundy and
 * olive kit, the gold trophy and the warm glow are all red-dominant. Keeping the
 * test at `g >= r` is what lets the semi-transparent golden aura survive while
 * its green-blended fringe is removed.
 */
function keyGreen(data, ch) {
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    if (g > 70 && g >= r * 1.02 && g > b * 1.20) data[i + 3] = 0
  }
}

/** Key a white backdrop — tight, so sparkles and skin highlights survive. */
function keyWhite(data, ch) {
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    if (r > 246 && g > 246 && b > 244 && Math.abs(r - g) < 5 && Math.abs(g - b) < 6) data[i + 3] = 0
  }
}

async function keyed(file, key) {
  const { data, info } = await sharp(SRC + file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  key(data, info.channels)
  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png().toBuffer()
}

/** Even grid — poses share a cell size, so scale and baseline match. */
async function buildGrid({ file, key, cols, rows, names, outDir }) {
  const img = await keyed(file, key)
  const { width, height } = await sharp(img).metadata()
  const cw = Math.floor(width / cols)
  const ch = Math.floor(height / rows)
  let n = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const name = names[r * cols + c]
      if (!name) continue
      await sharp(img)
        .extract({ left: c * cw, top: r * ch, width: cw, height: ch })
        .resize({ width: Math.round(cw * (TARGET_H / ch)), height: TARGET_H })
        .png({ compressionLevel: 9 })
        .toFile(`${OUT}${outDir}/${name}.png`)
      n++
    }
  }
  console.log(`${outDir}: ${n} poses (cell ${cw}x${ch})`)
}

/** Explicit x-windows for sheets whose figures don't sit on an even grid.
 *  Row height stays fixed so vertical scale and baseline still match. */
async function buildBoxes({ file, key, boxes, outDir }) {
  const img = await keyed(file, key)
  for (const { name, x0, x1, top, height } of boxes) {
    await sharp(img)
      .extract({ left: x0, top, width: x1 - x0, height })
      .resize({ width: Math.round((x1 - x0) * (TARGET_H / height)), height: TARGET_H })
      .png({ compressionLevel: 9 })
      .toFile(`${OUT}${outDir}/${name}.png`)
  }
  console.log(`${outDir}: ${boxes.length} poses`)
}

/**
 * Rows of tight per-cell windows, padded to a uniform cell height and aligned
 * on the baseline. Used when the sheet's rows are a clean grid but sit at
 * uneven heights — cropping tight and padding keeps every figure at its true
 * relative scale (a lotus pose really is shorter than a standing one) without
 * letting a neighbouring row's feet leak into the top of a crop.
 */
async function buildRowsPadded({ file, key, rows, cellH, outDir }) {
  const img = await keyed(file, key)
  let n = 0
  for (const { y0, y1, cells } of rows) {
    const h = y1 - y0
    for (const { name, x0, x1 } of cells) {
      if (!name) continue
      await sharp(img)
        .extract({ left: x0, top: y0, width: x1 - x0, height: h })
        // Bottom-aligned: every pose stands on the same line.
        .extend({ top: cellH - h, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .resize({ height: TARGET_H })
        .png({ compressionLevel: 9 })
        .toFile(`${OUT}${outDir}/${name}.png`)
      n++
    }
  }
  console.log(`${outDir}: ${n} poses`)
}

const P16 = [
  'basic', 'energetic', 'empathetic', 'celebrate',
  'streak_flame', 'trophy', 'clap', 'thumbs_up',
  'wave', 'lets_go', 'wink', 'offer_hand',
  'streak_lost', 'rest', 'level_up', 'meditate',
]

await buildGrid({ file: 'maya sheet 1.png', key: keyGreen, cols: 4, rows: 4, names: P16, outDir: 'maya' })
await buildGrid({ file: 'sara sheet 1.png', key: keyWhite, cols: 4, rows: 4, names: P16, outDir: 'sara' })

// idan's second sheet is a clean separated 4x4, but the four rows sit at
// different heights and the vertical gaps between them are only ~50px — an
// even split would clip row 1's feet, and a uniform-height window would pull a
// neighbouring row's heads into the crop. So each cell is measured tight from
// its row's alpha profile and padded up to a shared cell height instead.
await buildRowsPadded({
  file: 'idan sheet 1.png', key: keyGreen, outDir: 'idan', cellH: 610,
  rows: [
    { y0: 45, y1: 648, cells: [
      { name: 'basic', x0: 57, x1: 399 }, { name: 'energetic', x0: 431, x1: 873 },
      { name: 'empathetic', x0: 940, x1: 1290 }, { name: 'celebrate', x0: 1302, x1: 1742 },
    ] },
    { y0: 699, y1: 1228, cells: [
      { name: 'streak_flame', x0: 56, x1: 492 }, { name: 'trophy', x0: 535, x1: 908 },
      { name: 'clap', x0: 963, x1: 1271 }, { name: 'thumbs_up', x0: 1346, x1: 1704 },
    ] },
    { y0: 1278, y1: 1808, cells: [
      { name: 'wave', x0: 36, x1: 428 }, { name: 'lets_go', x0: 514, x1: 849 },
      { name: 'wink', x0: 926, x1: 1280 }, { name: 'offer_hand', x0: 1332, x1: 1709 },
    ] },
    { y0: 1829, y1: 2376, cells: [
      { name: 'streak_lost', x0: 14, x1: 484 }, { name: 'rest', x0: 495, x1: 848 },
      { name: 'level_up', x0: 869, x1: 1278 }, { name: 'meditate', x0: 1307, x1: 1746 },
    ] },
  ],
})
