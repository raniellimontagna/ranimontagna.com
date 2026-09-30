import './[locale]/globals.css'
import '@/shared/components/retro-mode/retro-mode.css'

// Since we have a root `not-found.tsx` page, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
