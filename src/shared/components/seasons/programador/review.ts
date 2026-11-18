/** The code review's progress, kept per season edition: how many PRs are approved. */

export const PR_COUNT = 5

const reviewKey = (edition: number) => `season-review:programador-${edition}`

export function loadApproved(edition: number): number {
  try {
    const value = Number(localStorage.getItem(reviewKey(edition)) ?? 0)
    return Number.isInteger(value) ? Math.min(PR_COUNT, Math.max(0, value)) : 0
  } catch {
    return 0
  }
}

export function saveApproved(edition: number, approved: number): void {
  try {
    localStorage.setItem(reviewKey(edition), String(approved))
  } catch {
    // The review still works for this visit.
  }
}
