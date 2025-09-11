'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals'

function sendToAnalytics(metric: Metric) {
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

export function WebVitals() {
  useEffect(() => {
    onCLS(sendToAnalytics)
    onFCP(sendToAnalytics)
    onLCP(sendToAnalytics)
    onTTFB(sendToAnalytics)
    onINP(sendToAnalytics)
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

export function useWebVitals() {
  const measurePerformance = () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming

      return {
        // Time to First Byte
        ttfb: navigation.responseStart - navigation.requestStart,
        // DOM Content Loaded
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        // Load Event
        loadEvent: navigation.loadEventEnd - navigation.loadEventStart,
        // Total Page Load Time
        pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      }
    }
    return null
  }

  return { measurePerformance }
}
