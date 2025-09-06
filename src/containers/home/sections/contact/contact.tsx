'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Mail, Phone, Linkedin, MessageCircle, ExternalLink } from 'lucide-react'

export function Contact() {
  const t = useTranslations('contact')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const contactMethods = [
    {
      icon: Mail,
      title: t('methods.email.title'),
      description: t('methods.email.description'),
      action: t('methods.email.action'),
      href: 'mailto:raniellimontagna@hotmail.com',
      color: 'blue',
    },
    {
      icon: Linkedin,
      title: t('methods.linkedin.title'),
      description: t('methods.linkedin.description'),
      action: t('methods.linkedin.action'),
      href: 'https://linkedin.com/in/ranimontagna',
      color: 'blue',
    },
    {
      icon: Phone,
      title: t('methods.phone.title'),
      description: t('methods.phone.description'),
      action: t('methods.phone.action'),
      href: 'https://wa.me/5554999790871',
      color: 'green',
    },
  ]

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-32 dark:bg-slate-900"
    >
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,#1e293b08_1px,transparent_1px),linear-gradient(-45deg,#64748b08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-32 right-32 h-64 w-64 rounded-full bg-blue-200/20 blur-3xl dark:bg-blue-700/20"></div>
        <div className="absolute bottom-32 left-32 h-80 w-80 rounded-full bg-purple-300/10 blur-3xl dark:bg-purple-600/10"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center lg:mb-16">
          <div
            className={`mb-6 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-1000 dark:bg-slate-800 dark:text-slate-300 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {t('badge')}
          </div>

          <h2
            className={`mb-6 text-3xl font-bold text-slate-900 transition-all delay-200 duration-1000 sm:text-4xl lg:text-6xl dark:text-slate-100 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {t('title.part1')}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('title.part2')}
            </span>
          </h2>
          <p
            className={`mx-auto max-w-3xl text-lg text-slate-600 transition-all delay-400 duration-1000 sm:text-xl dark:text-slate-300 ${
              mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {t('subtitle')}
          </p>
        </div>

        <div
          className={`mb-16 transition-all delay-600 duration-1000 lg:mb-20 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h3 className="mb-10 text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('methods.title')}
          </h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon
              return (
                <div
                  key={method.title}
                  className="group rounded-xl border border-slate-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800"
                  style={{ animationDelay: `${600 + index * 150}ms` }}
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 ${
                      method.color === 'blue'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'bg-green-100 dark:bg-green-900/30'
                    }`}
                  >
                    <IconComponent
                      className={`h-6 w-6 ${
                        method.color === 'blue'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}
                    />
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {method.title}
                  </h4>
                  <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                    {method.description}
                  </p>
                  <a
                    href={method.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center text-sm font-medium transition-colors ${
                      method.color === 'blue'
                        ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                        : 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
                    }`}
                  >
                    {method.action}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
