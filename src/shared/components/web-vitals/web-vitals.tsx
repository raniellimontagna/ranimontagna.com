'use client'

import { useEffect } from 'react'
import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

const pendingMetrics: Metric[] = []
const MAX_PENDING_METRICS = 50

function hasAnalyticsProvider() {
  return typeof window !== 'undefined' && (Boolean(window.gtag) || Boolean(window.va))
}

function pushPendingMetric(metric: Metric) {
  if (pendingMetrics.length >= MAX_PENDING_METRICS) {
    pendingMetrics.shift()
  }

  pendingMetrics.push(metric)
}

function sendMetric(metric: Metric) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    })
  }

  if (typeof window !== 'undefined' && window.va) {
    window.va('track', 'Web Vitals', {
      metric: metric.name,
      value: metric.value,
      id: metric.id,
    })
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Web Vitals:', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: metric.rating,
    })
  }
}

function flushPendingMetrics() {
  if (!hasAnalyticsProvider() || pendingMetrics.length === 0) {
    return
  }

  while (pendingMetrics.length > 0) {
    const metric = pendingMetrics.shift()
    if (metric) {
      sendMetric(metric)
    }
  }
}

function sendToAnalytics(metric: Metric) {
  if (!hasAnalyticsProvider()) {
    pushPendingMetric(metric)
    return
  }

  sendMetric(metric)
}

export function WebVitals() {
  useEffect(() => {
    onCLS(sendToAnalytics)
    onFCP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
    onINP(sendToAnalytics)

    flushPendingMetrics()
    const interval = window.setInterval(flushPendingMetrics, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

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
