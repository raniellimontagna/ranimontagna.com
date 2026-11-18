import { isEmptySpot } from '../empty-spot'

describe('isEmptySpot', () => {
  const make = (html: string) => {
    document.body.innerHTML = html
    return document.body
  }

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it.each([
    ['<a href="/x"><span id="t">link</span></a>'],
    ['<button><span id="t">ok</span></button>'],
    ['<label><input id="t" /></label>'],
    ['<textarea id="t"></textarea>'],
    ['<div role="button" id="t"></div>'],
    ['<div tabindex="0"><span id="t">widget</span></div>'],
    ['<dialog open><p id="t">card</p></dialog>'],
    ['<div data-no-season-click><p id="t">game</p></div>'],
    ['<div role="dialog"><p id="t">Vega</p></div>'],
    ['<div aria-modal="true"><p id="t">menu</p></div>'],
  ])('is not empty inside %s', (html) => {
    make(html)
    expect(isEmptySpot(document.getElementById('t'), '')).toBe(false)
  })

  it('is empty on plain page space, but not while text is selected', () => {
    make('<main tabindex="-1"><section><p id="t">Texto</p></section></main>')
    const target = document.getElementById('t')
    expect(isEmptySpot(target, '')).toBe(true)
    expect(isEmptySpot(target, 'Texto')).toBe(false)
    expect(isEmptySpot(null, '')).toBe(false)
  })
})
