import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')

describe('docs describe the redesigned site', () => {
  it('README no longer mentions the removed contact form', () => {
    const readme = read('README.md')
    expect(readme).not.toContain('/api/contact')
    expect(readme).not.toMatch(/contact form/i)
  })

  it('.env.example drops the contact form settings', () => {
    expect(read('.env.example')).not.toMatch(/CONTACT_RATE_LIMIT/)
  })
})
