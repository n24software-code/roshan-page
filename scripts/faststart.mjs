#!/usr/bin/env node
/**
 * Move each MP4's `moov` atom in front of `mdat` ("faststart").
 *
 * The films exported for this project all carry `moov` at the END of the file,
 * which forces a browser to download the whole thing before it can render a
 * single frame — MARAFY took ~11s to start on localhost. Relocating `moov` to
 * the front lets playback begin as soon as the first chunks arrive.
 *
 * Chunk offset tables (`stco` / `co64`) hold absolute file offsets, so every
 * entry is shifted by the size of the relocated `moov`.
 *
 * Usage:  node scripts/faststart.mjs public/videos
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const CONTAINERS = new Set([
  'moov', 'trak', 'mdia', 'minf', 'stbl', 'edts', 'udta', 'mvex', 'moof', 'traf',
])

function readBoxes(buf, start = 0, end = buf.length) {
  const boxes = []
  let off = start
  while (off + 8 <= end) {
    let size = buf.readUInt32BE(off)
    const type = buf.toString('latin1', off + 4, off + 8)
    let header = 8
    if (size === 1) {
      size = Number(buf.readBigUInt64BE(off + 8))
      header = 16
    } else if (size === 0) {
      size = end - off
    }
    if (size < header || off + size > end) break
    boxes.push({ type, start: off, size, header })
    off += size
  }
  return boxes
}

/** Shift every chunk offset inside `moov` by `delta`, in place. */
function shiftChunkOffsets(buf, start, end, delta) {
  let shifted = 0
  for (const box of readBoxes(buf, start, end)) {
    const body = box.start + box.header
    if (box.type === 'stco') {
      const count = buf.readUInt32BE(body + 4)
      for (let i = 0; i < count; i++) {
        const at = body + 8 + i * 4
        buf.writeUInt32BE(buf.readUInt32BE(at) + delta, at)
      }
      shifted += count
    } else if (box.type === 'co64') {
      const count = buf.readUInt32BE(body + 4)
      for (let i = 0; i < count; i++) {
        const at = body + 8 + i * 8
        buf.writeBigUInt64BE(buf.readBigUInt64BE(at) + BigInt(delta), at)
      }
      shifted += count
    } else if (CONTAINERS.has(box.type)) {
      shifted += shiftChunkOffsets(buf, body, box.start + box.size, delta)
    }
  }
  return shifted
}

function faststart(path) {
  const buf = readFileSync(path)
  const top = readBoxes(buf)
  const moov = top.find((b) => b.type === 'moov')
  const mdat = top.find((b) => b.type === 'mdat')

  if (!moov || !mdat) return { path, status: 'skipped (no moov/mdat)' }
  if (moov.start < mdat.start) return { path, status: 'already faststart' }

  const moovBuf = Buffer.from(buf.subarray(moov.start, moov.start + moov.size))

  // Every stco/co64 entry must account for moov landing before mdat. Any box
  // that sat after moov is being dropped, so guard against that first.
  const trailing = top.filter((b) => b.start > moov.start)
  if (trailing.length) {
    return { path, status: `skipped (boxes after moov: ${trailing.map((b) => b.type).join(',')})` }
  }

  const shifted = shiftChunkOffsets(moovBuf, 0, moovBuf.length, moov.size)

  const before = top.filter((b) => b.start < mdat.start)
  const out = Buffer.concat([
    ...before.map((b) => buf.subarray(b.start, b.start + b.size)),
    moovBuf,
    buf.subarray(mdat.start, mdat.start + mdat.size),
  ])

  if (out.length !== buf.length) {
    return { path, status: `ABORTED (size drift ${buf.length} -> ${out.length})` }
  }

  writeFileSync(path, out)
  return { path, status: `moved moov to front (${shifted} chunk offsets shifted)` }
}

const dir = process.argv[2] ?? 'public/videos'
for (const name of readdirSync(dir).filter((f) => f.endsWith('.mp4')).sort()) {
  const path = join(dir, name)
  const size = statSync(path).size
  const { status } = faststart(path)
  console.log(`${name.padEnd(28)} ${(size / 1048576).toFixed(1).padStart(6)} MB  ${status}`)
}
