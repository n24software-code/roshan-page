#!/usr/bin/env node
/**
 * Give the project lockups a transparent background.
 *
 * The supplied PNGs in `public/logos/` are fully opaque: each carries the
 * design's green-to-black wash baked in behind the artwork. Dropped onto the
 * page gradient that reads as a visible dark rectangle around every logo.
 *
 * The artwork itself is white line work on that dark ground, so the background
 * can be keyed out exactly:
 *
 *   1. The lockups have a clear margin, so the outermost columns of any row are
 *      always background. Averaging them gives a per-row background level that
 *      tracks the vertical gradient precisely.
 *   2. alpha = (luminance - rowBackground), normalised against the *typical*
 *      brightness of the artwork rather than a percentile of the whole image.
 *      Above-background values split into two populations — background near
 *      zero and artwork near some white level — so the white point is the
 *      median of everything in the upper half of the range. That lands solid
 *      fills and line work alike at full opacity, while anti-aliased edges keep
 *      their partial alpha, so nothing is hard-clipped.
 *   3. RGB is set to pure white — restoring the artwork's intended white, which
 *      the capture had dulled to roughly #c9d0cc.
 *
 * Only the background is removed; no shape, edge or proportion is altered.
 *
 * Usage:  node scripts/logo-alpha.mjs public/logos
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { inflateSync, deflateSync } from 'node:zlib'

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const MARGIN = 6 // columns sampled at each edge to model the background
const NOISE_FLOOR = 0.035 // below this fraction of full scale, treat as background
const ARTWORK_CUT = 0.5 // fraction of peak above which a pixel counts as artwork

// --- CRC32 -----------------------------------------------------------------
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

// --- decode ----------------------------------------------------------------
function decodePng(buf) {
  if (!buf.subarray(0, 8).equals(SIGNATURE)) throw new Error('not a PNG')

  let off = 8
  let header = null
  const idat = []

  while (off < buf.length) {
    const length = buf.readUInt32BE(off)
    const type = buf.toString('latin1', off + 4, off + 8)
    const data = buf.subarray(off + 8, off + 8 + length)
    if (type === 'IHDR') {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        depth: data[8],
        colorType: data[9],
        interlace: data[12],
      }
    } else if (type === 'IDAT') {
      idat.push(data)
    } else if (type === 'IEND') break
    off += 12 + length
  }

  if (!header) throw new Error('no IHDR')
  const { width, height, depth, colorType, interlace } = header
  if (depth !== 8 || colorType !== 6 || interlace !== 0) {
    throw new Error(`unsupported PNG (depth ${depth}, colorType ${colorType}, interlace ${interlace})`)
  }

  const raw = inflateSync(Buffer.concat(idat))
  const bpp = 4
  const stride = width * bpp
  const pixels = Buffer.alloc(height * stride)

  // Reverse the per-scanline filters (PNG spec 9.2).
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)]
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1))
    const row = pixels.subarray(y * stride, (y + 1) * stride)
    const prev = y > 0 ? pixels.subarray((y - 1) * stride, y * stride) : null

    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? row[i - bpp] : 0
      const b = prev ? prev[i] : 0
      const c = prev && i >= bpp ? prev[i - bpp] : 0
      let value
      switch (filter) {
        case 0: value = src[i]; break
        case 1: value = src[i] + a; break
        case 2: value = src[i] + b; break
        case 3: value = src[i] + ((a + b) >> 1); break
        case 4: {
          const p = a + b - c
          const pa = Math.abs(p - a)
          const pb = Math.abs(p - b)
          const pc = Math.abs(p - c)
          value = src[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)
          break
        }
        default: throw new Error(`bad filter type ${filter} on row ${y}`)
      }
      row[i] = value & 0xff
    }
  }

  return { width, height, pixels }
}

// --- encode ----------------------------------------------------------------
function encodePng({ width, height, pixels }) {
  const stride = width * 4
  const raw = Buffer.alloc(height * (stride + 1))
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter: None
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  const chunk = (type, data) => {
    const out = Buffer.alloc(12 + data.length)
    out.writeUInt32BE(data.length, 0)
    out.write(type, 4, 'latin1')
    data.copy(out, 8)
    out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length)
    return out
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // colour type: RGBA
  ihdr[10] = 0  // compression
  ihdr[11] = 0  // filter
  ihdr[12] = 0  // interlace

  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// --- background keying -----------------------------------------------------
const luminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b

function keyOutBackground({ width, height, pixels }) {
  const lum = new Float32Array(width * height)
  for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
    lum[i] = luminance(pixels[p], pixels[p + 1], pixels[p + 2])
  }

  // Per-row background level, sampled from the untouched left/right margins.
  const background = new Float32Array(height)
  for (let y = 0; y < height; y++) {
    let sum = 0
    let n = 0
    for (let k = 0; k < MARGIN; k++) {
      sum += lum[y * width + k] + lum[y * width + (width - 1 - k)]
      n += 2
    }
    background[y] = sum / n
  }

  const above = new Float32Array(width * height)
  let brightest = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      const value = lum[i] - background[y]
      above[i] = value
      if (value > brightest) brightest = value
    }
  }
  if (brightest <= 0) throw new Error('image is uniform; nothing to key')

  // White point = median brightness of the artwork population. Using the median
  // rather than the maximum keeps a solid fill that the capture rendered
  // slightly grey from ending up translucent.
  const artwork = Array.from(above).filter((v) => v > brightest * ARTWORK_CUT)
  artwork.sort((a, b) => a - b)
  const peak = artwork.length ? artwork[artwork.length >> 1] : brightest

  let opaque = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      let a = above[i] / peak
      if (a < NOISE_FLOOR) a = 0
      else if (a > 1) a = 1
      const p = i * 4
      pixels[p] = 255
      pixels[p + 1] = 255
      pixels[p + 2] = 255
      pixels[p + 3] = Math.round(a * 255)
      if (pixels[p + 3] === 255) opaque++
    }
  }

  return { coverage: opaque / (width * height) }
}

// --- run -------------------------------------------------------------------
const dir = process.argv[2] ?? 'public/logos'
for (const name of readdirSync(dir).filter((f) => f.endsWith('.png')).sort()) {
  const path = join(dir, name)
  const before = readFileSync(path)
  const image = decodePng(before)
  const { coverage } = keyOutBackground(image)
  const after = encodePng(image)
  writeFileSync(path, after)
  console.log(
    `${name.padEnd(24)} ${image.width}x${image.height}  ` +
      `${(before.length / 1024).toFixed(0).padStart(4)} KB -> ${(after.length / 1024).toFixed(0).padStart(3)} KB  ` +
      `artwork ${(coverage * 100).toFixed(1)}%`,
  )
}
