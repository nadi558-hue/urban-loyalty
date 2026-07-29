import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const sharp = require('sharp')
import { promises as fs } from 'fs'

// The source sheets are large and not in git; they live alongside the other
// design assets. Override with AVATAR_SHEETS if they move.
const SRC = process.env.AVATAR_SHEETS
  ?? 'C:/Users/nadi5/OneDrive/Desktop/AI/אפליקציה חבר מועדון urban/Avatar/'
// Relative to this file, so the script follows the repo rather than one machine.
const OUT = new URL('./public/avatars/', import.meta.url).pathname.replace(/^\//, '')
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

/**
 * Drop the sliver of a neighbouring figure that a cell boundary clipped, then
 * trim the transparent margin that leaves behind.
 *
 * An even grid cuts on arithmetic, not on where the figures actually are, so a
 * neighbour's shoulder or foot survives at the edge of the crop as a detached
 * fragment. Fragments are identified as columns of opacity separated from the
 * body by a fully transparent gap, and discarded when they carry under a tenth
 * of the main figure's mass — the real ones measured 0-3%, so the threshold is
 * nowhere near anything legitimate. The flame beside streak_flame and the crown
 * over level_up overlap their figure's columns and are never candidates.
 *
 * Height is preserved so the shared baseline survives; only width changes.
 */
async function cleanEdges(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: ch } = info

  const colMass = new Array(w).fill(0)
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) if (data[(y * w + x) * ch + 3] > 10) colMass[x]++
  }

  const islands = []
  for (let x = 0, start = -1; x <= w; x++) {
    if (x < w && colMass[x] > 0) { if (start < 0) start = x }
    else if (start >= 0) { islands.push([start, x]); start = -1 }
  }
  if (islands.length === 0) return buf

  const mass = islands.map(([a, b]) => colMass.slice(a, b).reduce((s, v) => s + v, 0))
  const keep = Math.max(...mass) * 0.1
  const kept = islands.filter((_, i) => mass[i] >= keep)

  const left = kept[0][0]
  const right = kept[kept.length - 1][1]
  for (let x = 0; x < w; x++) {
    if (x >= left && x < right) continue
    for (let y = 0; y < h; y++) data[(y * w + x) * ch + 3] = 0
  }

  return sharp(data, { raw: { width: w, height: h, channels: ch } })
    .extract({ left, top: 0, width: right - left, height: h })
    .png({ compressionLevel: 9 })
    .toBuffer()
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
      const cell = await sharp(img)
        .extract({ left: c * cw, top: r * ch, width: cw, height: ch })
        .resize({ width: Math.round(cw * (TARGET_H / ch)), height: TARGET_H })
        .png({ compressionLevel: 9 })
        .toBuffer()
      await fs.writeFile(`${OUT}${outDir}/${name}.png`, await cleanEdges(cell))
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
    const cell = await sharp(img)
      .extract({ left: x0, top, width: x1 - x0, height })
      .resize({ width: Math.round((x1 - x0) * (TARGET_H / height)), height: TARGET_H })
      .png({ compressionLevel: 9 })
      .toBuffer()
    await fs.writeFile(`${OUT}${outDir}/${name}.png`, await cleanEdges(cell))
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
      const cell = await sharp(img)
        .extract({ left: x0, top: y0, width: x1 - x0, height: h })
        // Bottom-aligned: every pose stands on the same line.
        .extend({ top: cellH - h, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .resize({ height: TARGET_H })
        .png({ compressionLevel: 9 })
        .toBuffer()
      await fs.writeFile(`${OUT}${outDir}/${name}.png`, await cleanEdges(cell))
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
