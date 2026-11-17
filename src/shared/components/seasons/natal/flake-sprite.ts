const SPRITE = 32

/** The same color fully transparent, so the rim fades without a dark fringe. */
function clear(color: string) {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color)
  if (!hex) return 'rgba(255, 255, 255, 0)'
  const [r, g, b] = hex.slice(1).map((part) => Number.parseInt(part, 16))
  return `rgba(${r}, ${g}, ${b}, 0)`
}

/** One soft flake, drawn once and stamped for every flake: cheaper than blur per frame. */
export function makeFlakeSprite(color: string) {
  const sprite = document.createElement('canvas')
  sprite.width = SPRITE
  sprite.height = SPRITE
  const ctx = sprite.getContext('2d')
  if (!ctx) return sprite
  const half = SPRITE / 2
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.4, color)
  gradient.addColorStop(1, clear(color))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, SPRITE, SPRITE)
  return sprite
}
