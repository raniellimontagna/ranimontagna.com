'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export function CTASection() {
  const t = useTranslations('projectsPage')

  return (
    <section className="mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="surface-panel mx-auto w-full overflow-hidden rounded-4xl border border-line shadow-xl"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-line bg-surface/50 px-4 py-3">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>
          <div className="text-xs font-mono text-muted">github.com</div>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        {/* Terminal Content */}
        <div className="p-8 sm:p-12 font-mono">
          <div className="flex flex-col gap-6">
            {/* Command Line */}
            <div className="flex items-center gap-3 text-lg sm:text-xl">
              <span className="text-accent-mint">➜</span>
              <span className="text-accent-lavender">~</span>
              <span className="text-foreground">
                <span className="text-accent-sand">git</span> checkout explore-all
              </span>
            </div>

            {/* Response Text */}
            <div className="flex flex-col gap-2 text-muted">
              <p className="typing-effect border-l-2 border-line pl-4">
                <span className="text-accent-mint">✔</span>{' '}
                <span className="text-foreground">{t('cta.title')}</span>
              </p>
              <p className="border-l-2 border-line pl-4">{t('cta.subtitle')}</p>
            </div>

            {/* Action Button */}
            <div className="mt-4">
              <a
                href="https://github.com/raniellimontagna"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-foreground px-6 py-3 font-semibold text-background transition-all hover:bg-foreground/90 hover:shadow-lg hover:-translate-y-1 hover:shadow-foreground/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t('cta.button')}
                </span>

                {/* Button Shine Effect */}
                <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
