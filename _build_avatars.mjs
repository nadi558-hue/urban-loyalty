import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const sharp = require('sharp')

const SRC = 'C:/Users/nadi5/OneDrive/Desktop/AI/אפליקציה חבר מועדון urban/Avatar/'
const OUT = 'C:/Users/nadi5/OneDrive/Desktop/AI/clude code test/urban-app/public/avatars/'
const TARGET_H = 640

/**
 * Both sheets were exported with the transparency checkerboard rendered as real
 * pixels — 0% of either file is actually transparent. The pattern is only ever
 * neutral grey and the artwork is warm-toned throughout (even the cream tank
 * top reads warm, not neutral), so keying on strict neutrality within the
 * checker's brightness range removes the background without eating the figure.
 */
async function keyOut(file, lo, hi) {
  const { data, info } = await sharp(SRC + file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const ch = info.channels
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const neutral = Math.abs(r - g) < 6 && Math.abs(g - b) < 6 && Math.abs(r - b) < 6
    if (neutral && r >= lo && r <= hi) data[i + 3] = 0
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: ch } }).png().toBuffer()
}

async function build({ file, lo, hi, cells, outDir }) {
  const keyed = await keyOut(file, lo, hi)
  for (const { name, left, top, width, height } of cells) {
    await sharp(keyed)
      .extract({ left, top, width, height })
      .resize({ width: Math.round(width * (TARGET_H / height)), height: TARGET_H })
      .png({ compressionLevel: 9 })
      .toFile(`${OUT}${outDir}/${name}.png`)
  }
  console.log(`${outDir}: ${cells.length} poses`)
}

const MAYA_NAMES = [
  'basic','energetic','empathetic','celebrate',
  'streak_flame','trophy','clap','thumbs_up',
  'wave','lets_go','wink','offer_hand',
  'streak_lost','rest','level_up','meditate',
]
const CW = 448, CH = 600, BAND = 75
const mayaCells = MAYA_NAMES.map((name, i) => ({
  name, left: (i % 4) * CW, top: Math.floor(i / 4) * CH, width: CW, height: CH - BAND,
}))

const IW = 512, IH = 1010
const idanCells = [
  ...['basic','energetic','empathetic'].map((name, c) => ({ name, left: c*IW, top: 175,  width: IW, height: IH })),
  ...['celebrate','lets_go','rest'].map((name, c)   => ({ name, left: c*IW, top: 1540, width: IW, height: IH })),
]

// maya's checker is a tight light pair; idan's export is more compressed so its
// squares have blurred edges spanning the whole range between the two greys.
await build({ file: 'maya1.png',  lo: 214, hi: 250, cells: mayaCells, outDir: 'maya' })
await build({ file: 'idan 1.png', lo: 126, hi: 219, cells: idanCells, outDir: 'idan' })
