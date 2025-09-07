import { fireEvent, render, screen } from '@/tests/functions'
import { LanguageSwitcher } from './languageSwitcher'

describe('LanguageSwitcher', () => {
  it('should render the LanguageSwitcher component', () => {
    render(<LanguageSwitcher />)

    const button = document.querySelector('button[aria-label="Change language"]')

    expect(button).toBeDefined()
  })

  it('should be able to open and close the language menu', async () => {
    render(<LanguageSwitcher />)

    const button = screen.getByRole('button', { name: /change language/i })

    fireEvent.click(button)

    const languageOptionEn = await screen.findByTestId('language-option-en')
    expect(languageOptionEn).toBeDefined()

    fireEvent.click(languageOptionEn)

    expect(languageOptionEn).toBeDefined()
  })
})
