'use client'

import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import {
  BookMinimalistic,
  Code,
  Laptop,
  Letter,
  Magnifer,
  Moon,
  Sun,
  User,
} from '@solar-icons/react/ssr'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { getSocialLinksAsArray } from '@/shared/lib/social-links'
import { useCommandMenu } from '@/shared/store/use-command-menu/use-command-menu'
import { useTheme } from '@/shared/store/use-theme/use-theme'

export function CommandMenu() {
  const { isOpen, setOpen, toggle } = useCommandMenu()
  const { setTheme } = useTheme()
  const router = useRouter()
  const t = useTranslations('commandMenu')
  const commandSocialLinks = getSocialLinksAsArray().filter((social) =>
    ['github', 'linkedin', 'twitter', 'instagram'].includes(social.id),
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [toggle])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  const navigateTo = (href: string) => {
    runCommand(() => {
      if (href.startsWith('http')) {
        window.open(href, '_blank')
      } else {
        const element = document.getElementById(href.replace('#', ''))
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        } else {
          router.push(href)
        }
      }
    })
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setOpen(false)}
        />

        <Dialog.Content
          className="fixed inset-0 z-51 pointer-events-none flex items-start justify-center p-4 pt-[15vh] sm:pt-[20vh] focus:outline-none focus-visible:outline-none"
          onInteractOutside={() => setOpen(false)}
        >
          <VisuallyHidden.Root>
            <Dialog.Title>Global Command Menu</Dialog.Title>
            <Dialog.Description>
              Search for commands, navigate to sections, change theme, or visit social links.
            </Dialog.Description>
          </VisuallyHidden.Root>

          <Command
            className="surface-panel pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-2xl border border-line shadow-panel animate-in zoom-in-95 duration-200"
            label="Global Command Menu"
          >
            <div className="flex items-center border-b border-line px-4">
              <Magnifer className="mr-3 h-5 w-5 text-muted" />
              <Command.Input
                placeholder={t('placeholder')}
                className="flex h-14 w-full rounded-md bg-transparent py-4 text-sm font-medium text-foreground outline-none placeholder:text-muted focus:outline-none focus:ring-0 focus-visible:outline-none"
              />
              <div className="hidden rounded-md bg-surface-strong border border-line px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted uppercase tracking-widest sm:block">
                Esc
              </div>
            </div>

            <Command.List className="max-h-75 overflow-y-auto overflow-x-hidden p-2 scrollbar-thin">
              <Command.Empty className="py-8 text-center text-sm text-muted">
                {t('noResults')}
              </Command.Empty>

              <Command.Group
                heading={
                  <span className="font-bold uppercase tracking-widest">{t('sections')}</span>
                }
                className="px-2 pt-2 pb-1 text-[10px] text-muted/60"
              >
                <Command.Item
                  onSelect={() => navigateTo('#about')}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 aria-selected:bg-surface-strong aria-selected:text-foreground"
                >
                  <User className="h-4 w-4" />
                  {t('about')}
                </Command.Item>
                <Command.Item
                  onSelect={() => navigateTo('#projects')}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 aria-selected:bg-surface-strong aria-selected:text-foreground"
                >
                  <Code className="h-4 w-4" />
                  {t('projects')}
                </Command.Item>
                <Command.Item
                  onSelect={() => navigateTo('#experience')}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 aria-selected:bg-surface-strong aria-selected:text-foreground"
                >
                  <Laptop className="h-4 w-4" />
                  {t('experience')}
                </Command.Item>
                <Command.Item
                  onSelect={() => navigateTo('#contact')}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 aria-selected:bg-surface-strong aria-selected:text-foreground"
                >
                  <Letter className="h-4 w-4" />
                  {t('contact')}
                </Command.Item>
                <Command.Item
                  onSelect={() => navigateTo('/blog')}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 aria-selected:bg-surface-strong aria-selected:text-foreground"
                >
                  <BookMinimalistic className="h-4 w-4" />
                  {t('blog')}
                </Command.Item>
              </Command.Group>

              <div className="my-2 h-px bg-line/50" />

              <Command.Group
                heading={<span className="font-bold uppercase tracking-widest">{t('theme')}</span>}
                className="px-2 pt-2 pb-1 text-[10px] text-muted/60"
              >
                <Command.Item
                  onSelect={() => runCommand(() => setTheme('light'))}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 aria-selected:bg-accent/10 aria-selected:text-accent-strong"
                >
                  <Sun className="h-4 w-4" />
                  {t('light')}
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => setTheme('dark'))}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 aria-selected:bg-accent/10 aria-selected:text-accent-strong"
                >
                  <Moon className="h-4 w-4" />
                  {t('dark')}
                </Command.Item>
              </Command.Group>

              <div className="my-2 h-px bg-line/50" />

              <Command.Group
                heading={<span className="font-bold uppercase tracking-widest">{t('social')}</span>}
                className="px-2 pt-2 pb-1 text-[10px] text-muted/60"
              >
                {commandSocialLinks.map((social) => {
                  const Icon = social.icon

                  return (
                    <Command.Item
                      key={social.id}
                      onSelect={() => navigateTo(social.href)}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 aria-selected:bg-surface-strong aria-selected:text-foreground"
                    >
                      <Icon className="h-4 w-4" />
                      {social.name}
                    </Command.Item>
                  )
                })}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
