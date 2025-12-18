'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID: string
}

export function GoogleAnalytics({ GA_MEASUREMENT_ID }: GoogleAnalyticsProps) {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Load GA after user interaction or after 5 seconds (whichever comes first)
    const loadGA = () => setShouldLoad(true)

    const timeout = setTimeout(loadGA, 5000)

    const events = ['scroll', 'click', 'touchstart', 'keydown']
    events.forEach((event) => {
      window.addEventListener(event, loadGA, { once: true, passive: true })
    })

    return () => {
      clearTimeout(timeout)
      events.forEach((event) => {
        window.removeEventListener(event, loadGA)
      })
    }
  }, [])

  if (!shouldLoad) return null

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  )
}

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: {
        page_title?: string
        page_location?: string
        event_category?: string
        event_label?: string
        value?: number
      },
    ) => void
  }
}
