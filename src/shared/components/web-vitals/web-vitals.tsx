'use client'

import { useEffect } from 'react'
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

type WebVitalsProps = {
  consentGranted?: boolean
  measurementId?: string
}

function sendMetric(metric: Metric, measurementId: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    const config = {
      event_category: 'Web Vitals',
      event_label: metric.id,
      send_to: measurementId,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    }

    window.gtag('event', metric.name, config)
  }

  if (typeof window !== 'undefined' && window.va) {
    window.va('track', 'Web Vitals', {
      metric: metric.name,
      value: metric.value,
      id: metric.id,
    })
  }
}

export function WebVitals({ consentGranted = false, measurementId }: WebVitalsProps) {
  useEffect(() => {
    if (!consentGranted || !measurementId) {
      return
    }

    let active = true
    const reportMetric = (metric: Metric) => {
      if (active) {
        sendMetric(metric, measurementId)
      }
    }

    onCLS(reportMetric)
    onFCP(reportMetric)
    onLCP(reportMetric)
    onTTFB(reportMetric)
    onINP(reportMetric)

    return () => {
      active = false
    }
  }, [consentGranted, measurementId])

  return null
}

declare global {
  interface Window {
    va?: (
      command: string,
      eventName: string,
      config?: {
        metric?: string
        value?: number
        id?: string
      },
    ) => void
  }
}
