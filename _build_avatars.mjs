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

const P16 = [
  'basic', 'energetic', 'empathetic', 'celebrate',
  'streak_flame', 'trophy', 'clap', 'thumbs_up',
  'wave', 'lets_go', 'wink', 'offer_hand',
  'streak_lost', 'rest', 'level_up', 'meditate',
]

await buildGrid({ file: 'maya sheet 1.png', key: keyGreen, cols: 4, rows: 4, names: P16, outDir: 'maya' })
await buildGrid({ file: 'sara sheet 1.png', key: keyWhite, cols: 4, rows: 4, names: P16, outDir: 'sara' })

// idan's sheet came back 6x2 rather than the 4x4 asked for, the generator chose
// its own subset, and the figures don't sit on an even grid — in row 1 the
// celebrate figure's raised arms touch its neighbour, so an even split cuts it
// in half. These x-windows were measured from each row's alpha profile.
// Row 1 cell 4 is a second hand-on-chest variant, dropped rather than shipped
// as a near-duplicate of empathetic.
const R1 = { top: 0, height: 896 }
const R2 = { top: 896, height: 896 }
await buildBoxes({
  file: 'idan sheet 1.png', key: keyGreen, outDir: 'idan',
  boxes: [
    { name: 'basic',      x0: 81,   x1: 358,  ...R1 },
    { name: 'energetic',  x0: 395,  x1: 944,  ...R1 },
    { name: 'empathetic', x0: 962,  x1: 1235, ...R1 },
    // Body sits at 1668-1848 but the raised arms reach out to either side,
    // so the window has to be much wider than the torso.
    { name: 'celebrate',  x0: 1550, x1: 1980, ...R1 },
    { name: 'trophy',     x0: 1986, x1: 2364, ...R1 },
    { name: 'wave',       x0: 67,   x1: 399,  ...R2 },
    { name: 'lets_go',    x0: 448,  x1: 775,  ...R2 },
    { name: 'wink',       x0: 825,  x1: 1121, ...R2 },
    { name: 'offer_hand', x0: 1245, x1: 1599, ...R2 },
    { name: 'rest',       x0: 1643, x1: 1943, ...R2 },
    { name: 'meditate',   x0: 1978, x1: 2375, ...R2 },
  ],
})
