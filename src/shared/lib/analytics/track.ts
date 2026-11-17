type UmamiWindow = Window & {
  umami?: { track: (event: string, data?: Record<string, string | number>) => void }
}

/** A custom Umami event. Silent when the script is missing (local, previews, blockers). */
export function track(event: string, data?: Record<string, string | number>): void {
  try {
    ;(window as UmamiWindow).umami?.track(event, data)
  } catch {
    // Analytics never breaks the page.
  }
}
