import './[locale]/globals.css'
import '@/shared/components/retro-mode/retro-mode.css'
import '@/shared/components/retro-mode/worlds/worlds-common.css'
import '@/shared/components/retro-mode/worlds/xp.css'
import '@/shared/components/retro-mode/worlds/dos.css'
import '@/shared/components/retro-mode/worlds/gameboy.css'
import '@/shared/components/retro-mode/worlds/newspaper.css'
import '@/shared/components/retro-mode/worlds/ide.css'
import '@/shared/components/retro-mode/worlds/mac.css'

// Since we have a root `not-found.tsx` page, a layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
