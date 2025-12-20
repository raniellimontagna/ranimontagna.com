import { NextIntlClientProvider } from 'next-intl'
import pt from '../../messages/pt.json'

export const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NextIntlClientProvider locale="pt" messages={pt}>
      {children}
    </NextIntlClientProvider>
  )
}
