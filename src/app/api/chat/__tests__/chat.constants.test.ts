import { SYSTEM_PROMPT_EN, SYSTEM_PROMPT_ES, SYSTEM_PROMPT_PT } from '../chat.constants'

describe('chat system prompts', () => {
  it('presents Lemon as Ranielli current experience without implying an active job search', () => {
    expect(SYSTEM_PROMPT_PT).toContain('Lemon Energia (Jul 2026 - Presente)')
    expect(SYSTEM_PROMPT_EN).toContain('Lemon Energia (Jul 2026 - Present)')
    expect(SYSTEM_PROMPT_ES).toContain('Lemon Energia (Jul 2026 - Presente)')

    expect(SYSTEM_PROMPT_PT).not.toContain('novas oportunidades')
    expect(SYSTEM_PROMPT_EN).not.toContain('new opportunities')
    expect(SYSTEM_PROMPT_ES).not.toContain('nuevas oportunidades')
  })
})
