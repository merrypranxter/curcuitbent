const clamp = (v, min = 0, max = 255) => Math.max(min, Math.min(max, v))

function noise2D(x, y) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

function luma(r, g, b) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

function signalValue(source, r, g, b, x, y, width, height) {
  switch (source) {
    case 'RED': return r / 255
    case 'GREEN': return g / 255
    case 'BLUE': return b / 255
    case 'LUMA': return luma(r, g, b)
    case 'X': return width <= 1 ? 0 : x / (width - 1)
    case 'Y': return height <= 1 ? 0 : y / (height - 1)
    case 'NOISE': return noise2D(x, y)
    default: return 0
  }
}

function mixChannel(current, source, mode, strength) {
  const s = clamp(strength, 0, 1)
  if (mode === 'SHORT') return clamp(current * (1 - s) + source * 255 * s)
  if (mode === 'BRIDGE') return clamp(current + (source - 0.5) * 255 * s)
  return clamp(current * (1 - s) + source * 255 * s)
}

export function bendImage(sourceData, width, height, connections) {
  if (!sourceData || !width || !height) return null

  const src = sourceData.data
  const out = new ImageData(width, height)
  const dst = out.data

  const xWires = connections.filter(w => w.target === 'X_OFFSET')
  const yWires = connections.filter(w => w.target === 'Y_OFFSET')
  const otherWires = connections.filter(w => w.target !== 'X_OFFSET' && w.target !== 'Y_OFFSET')

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const baseIndex = (y * width + x) * 4
      const br = src[baseIndex]
      const bg = src[baseIndex + 1]
      const bb = src[baseIndex + 2]

      let sx = x
      let sy = y

      for (const wire of xWires) {
        const sig = signalValue(wire.source, br, bg, bb, x, y, width, height)
        const bipolar = sig * 2 - 1
        const maxShift = Math.max(8, width * 0.22)
        sx += bipolar * maxShift * wire.strength * (wire.mode === 'SHORT' ? 1.7 : 1)
      }

      for (const wire of yWires) {
        const sig = signalValue(wire.source, br, bg, bb, x, y, width, height)
        const bipolar = sig * 2 - 1
        const maxShift = Math.max(8, height * 0.22)
        sy += bipolar * maxShift * wire.strength * (wire.mode === 'SHORT' ? 1.7 : 1)
      }

      sx = Math.round(((sx % width) + width) % width)
      sy = Math.round(((sy % height) + height) % height)

      const sampleIndex = (sy * width + sx) * 4
      let r = src[sampleIndex]
      let g = src[sampleIndex + 1]
      let b = src[sampleIndex + 2]

      for (const wire of otherWires) {
        const sig = signalValue(wire.source, r, g, b, sx, sy, width, height)

        if (wire.target === 'RED') r = mixChannel(r, sig, wire.mode, wire.strength)
        if (wire.target === 'GREEN') g = mixChannel(g, sig, wire.mode, wire.strength)
        if (wire.target === 'BLUE') b = mixChannel(b, sig, wire.mode, wire.strength)

        if (wire.target === 'THRESHOLD') {
          const threshold = 0.5 * (1 - wire.strength) + sig * wire.strength
          const on = luma(r, g, b) >= threshold ? 255 : 0
          if (wire.mode === 'SHORT') {
            r = g = b = on
          } else {
            const amount = wire.mode === 'BRIDGE' ? wire.strength * 0.72 : wire.strength * 0.48
            r = r * (1 - amount) + on * amount
            g = g * (1 - amount) + on * amount
            b = b * (1 - amount) + on * amount
          }
        }

        if (wire.target === 'POSTERIZE') {
          const levels = Math.max(2, Math.round(2 + sig * 14 * Math.max(0.15, wire.strength)))
          const step = 255 / (levels - 1)
          const amount = wire.mode === 'SHORT' ? 1 : wire.strength
          const q = value => Math.round(value / step) * step
          r = r * (1 - amount) + q(r) * amount
          g = g * (1 - amount) + q(g) * amount
          b = b * (1 - amount) + q(b) * amount
        }
      }

      dst[baseIndex] = clamp(r)
      dst[baseIndex + 1] = clamp(g)
      dst[baseIndex + 2] = clamp(b)
      dst[baseIndex + 3] = src[sampleIndex + 3]
    }
  }

  return out
}
