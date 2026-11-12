import en from '../../../messages/en.json'
import es from '../../../messages/es.json'
import pt from '../../../messages/pt.json'

function flatKeys(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) return [prefix]
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      flatKeys(child, prefix ? `${prefix}.${key}` : key),
    )
  }
  return [prefix]
}

it('pt, en and es expose exactly the same message keys', () => {
  expect(flatKeys(en).sort()).toEqual(flatKeys(pt).sort())
  expect(flatKeys(es).sort()).toEqual(flatKeys(pt).sort())
})
