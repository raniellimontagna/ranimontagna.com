'use client'

import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { Command } from 'cmdk'
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
import { GithubIcon, LinkedinIcon } from '@/components/icons/brands'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useCommandMenu } from '@/store/useCommandMenu/useCommandMenu'
import { useTheme } from '@/store/useTheme/useTheme'

export function CommandMenu() {
  const { isOpen, setOpen, toggle } = useCommandMenu()
  const { setTheme } = useTheme()
  const router = useRouter()
  const t = useTranslations('commandMenu')

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
        {/* Overlay - click to close */}
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />

        {/* Content */}
        <Dialog.Content
          className="fixed inset-0 z-[51] pointer-events-none flex items-start justify-center p-4 pt-[15vh] sm:pt-[20vh]"
          onInteractOutside={() => setOpen(false)}
        >
          {/* Visually hidden title and description for accessibility */}
          <VisuallyHidden.Root>
            <Dialog.Title>Global Command Menu</Dialog.Title>
            <Dialog.Description>
              Search for commands, navigate to sections, change theme, or visit social links.
            </Dialog.Description>
          </VisuallyHidden.Root>

          {/* Command container */}
          <Command
            className="pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            label="Global Command Menu"
          >
            <div className="flex items-center border-b border-slate-200 px-3 dark:border-slate-800">
              <Magnifer className="mr-2 h-5 w-5 text-slate-400" />
              <Command.Input
                placeholder={t('placeholder')}
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
              />
              <div className="hidden rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 sm:block dark:bg-slate-800 dark:text-slate-400">
                Esc
              </div>
            </div>
            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 scrollbar-thin">
              <Command.Empty className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {t('noResults')}
              </Command.Empty>

              <Command.Group
                heading={t('sections')}
                className="mb-2 px-2 text-xs font-semibold text-slate-400 dark:text-slate-500"
              >
                <Command.Item
                  onSelect={() => navigateTo('#about')}
                  className="flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm text-slate-700 aria-selected:bg-blue-50 aria-selected:text-blue-600 dark:text-slate-300 dark:aria-selected:bg-blue-900/20 dark:aria-selected:text-blue-400"
                >
                  <User className="mr-2 h-4 w-4" />
                  {t('about')}
                </Command.Item>
                <Command.Item
                  onSelect={() => navigateTo('#projects')}
                  className="flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm text-slate-700 aria-selected:bg-blue-50 aria-selected:text-blue-600 dark:text-slate-300 dark:aria-selected:bg-blue-900/20 dark:aria-selected:text-blue-400"
                >
                  <Code className="mr-2 h-4 w-4" />
                  {t('projects')}
                </Command.Item>
                <Command.Item
                  onSelect={() => navigateTo('#experience')}
                  className="flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm text-slate-700 aria-selected:bg-blue-50 aria-selected:text-blue-600 dark:text-slate-300 dark:aria-selected:bg-blue-900/20 dark:aria-selected:text-blue-400"
                >
                  <Laptop className="mr-2 h-4 w-4" />
                  {t('experience')}
                </Command.Item>
                <Command.Item
                  onSelect={() => navigateTo('#contact')}
                  className="flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm text-slate-700 aria-selected:bg-blue-50 aria-selected:text-blue-600 dark:text-slate-300 dark:aria-selected:bg-blue-900/20 dark:aria-selected:text-blue-400"
                >
                  <Letter className="mr-2 h-4 w-4" />
                  {t('contact')}
                </Command.Item>
                <Command.Item
                  onSelect={() => navigateTo('/blog')}
                  className="flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm text-slate-700 aria-selected:bg-blue-50 aria-selected:text-blue-600 dark:text-slate-300 dark:aria-selected:bg-blue-900/20 dark:aria-selected:text-blue-400"
                >
                  <BookMinimalistic className="mr-2 h-4 w-4" />
                  {t('blog')}
                </Command.Item>
              </Command.Group>

              <Command.Group
                heading={t('theme')}
                className="mb-2 px-2 text-xs font-semibold text-slate-400 dark:text-slate-500"
              >
                <Command.Item
                  onSelect={() => runCommand(() => setTheme('light'))}
                  className="flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm text-slate-700 aria-selected:bg-blue-50 aria-selected:text-blue-600 dark:text-slate-300 dark:aria-selected:bg-blue-900/20 dark:aria-selected:text-blue-400"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  {t('light')}
                </Command.Item>
                <Command.Item
                  onSelect={() => runCommand(() => setTheme('dark'))}
                  className="flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm text-slate-700 aria-selected:bg-blue-50 aria-selected:text-blue-600 dark:text-slate-300 dark:aria-selected:bg-blue-900/20 dark:aria-selected:text-blue-400"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  {t('dark')}
                </Command.Item>
              </Command.Group>

              <Command.Group
                heading={t('social')}
                className="px-2 text-xs font-semibold text-slate-400 dark:text-slate-500"
              >
                <Command.Item
                  onSelect={() => navigateTo('https://github.com/raniellimontagna')}
                  className="flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm text-slate-700 aria-selected:bg-blue-50 aria-selected:text-blue-600 dark:text-slate-300 dark:aria-selected:bg-blue-900/20 dark:aria-selected:text-blue-400"
                >
                  <GithubIcon className="mr-2 h-4 w-4" />
                  GitHub
                </Command.Item>
                <Command.Item
                  onSelect={() => navigateTo('https://linkedin.com/in/raniellimontagna')}
                  className="flex cursor-pointer items-center rounded-lg px-2 py-2 text-sm text-slate-700 aria-selected:bg-blue-50 aria-selected:text-blue-600 dark:text-slate-300 dark:aria-selected:bg-blue-900/20 dark:aria-selected:text-blue-400"
                >
                  <LinkedinIcon className="mr-2 h-4 w-4" />
                  LinkedIn
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
