import { measureStrands } from '../strands'

function title() {
  const h1 = document.createElement('h1')
  const first = document.createElement('span')
  const last = document.createElement('span')
  const slot = document.createElement('span')
  h1.append(first, last, slot)
  const rect = (top: number, left: number, width: number, height: number) =>
    ({
      top,
      left,
      width,
      height,
      bottom: top + height,
      right: left + width,
      x: left,
      y: top,
    }) as DOMRect
  h1.getBoundingClientRect = () => rect(0, 0, 600, 260)
  first.getBoundingClientRect = () => rect(10, 20, 400, 120)
  last.getBoundingClientRect = () => rect(130, 20, 500, 120)
  return { h1, slot }
}

it('arches the top wire up for lights and sags the bottom one down', () => {
  const { h1, slot } = title()
  const { wires } = measureStrands(h1, slot, { spacing: 40, minCount: 6, sag: 0.1 })
  const [top, bottom] = wires
  expect(top.points).toHaveLength(10)
  const mid = top.points[Math.floor(top.points.length / 2)]
  expect(mid.y).toBeLessThan(top.points[0].y)
  expect(mid.up).toBe(true)
  const low = bottom.points[Math.floor(bottom.points.length / 2)]
  expect(low.y).toBeGreaterThan(bottom.points[0].y)
})

it('raises the top wire and lets it sag down for bunting', () => {
  const { h1, slot } = title()
  const lights = measureStrands(h1, slot, { spacing: 40, minCount: 6, sag: 0.1 })
  const bunting = measureStrands(h1, slot, {
    spacing: 40,
    minCount: 6,
    sag: 0.1,
    top: { lift: 0.3, sagsDown: true },
  })
  const start = (path: string) => Number(path.split(' ')[2])
  const [lit] = lights.wires
  const [hung] = bunting.wires
  // Raised by 30 % of the 120 px line.
  expect(start(hung.path)).toBeCloseTo(start(lit.path) - 36)
  const mid = hung.points[Math.floor(hung.points.length / 2)]
  expect(mid.y).toBeGreaterThan(hung.points[0].y)
})
