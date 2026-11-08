export type ChapterId = 'pain' | 'solution' | 'product' | 'code'
export type Transition = 'card' | 'wipe-up' | 'circle' | 'split'

export type ChapterCopy = { kicker: string; title: string; body: string }

export type CycleCopy = {
  heading: string
  chapters: Record<ChapterId, ChapterCopy>
  thread: { caption: string; messages: { from: string; text: string; mine?: boolean }[] }
  spec: { title: string; items: string[] }
  product: { desktopAlt: string; phoneAlt: string }
  casesLink: string
}

export const CYCLE_CHAPTERS: readonly {
  id: ChapterId
  transition: Transition
  background: string
}[] = [
  { id: 'pain', transition: 'card', background: '/redesign/scenes/pain-codex.webp' },
  { id: 'solution', transition: 'wipe-up', background: '/redesign/scenes/solution-codex.webp' },
  { id: 'product', transition: 'circle', background: '/redesign/scenes/product-codex.webp' },
  { id: 'code', transition: 'split', background: '/redesign/scenes/code-codex.webp' },
]

export type TerminalLine = { kind: 'prompt' | 'note' | 'add' | 'fail' | 'ok'; text: string }

/**
 * The real loop, as an agent session prints it: ask, plan, a failing test,
 * the change, green tests, human review, ship. No invented numbers.
 */
export const TERMINAL_LINES: readonly TerminalLine[] = [
  { kind: 'prompt', text: '~/klick ❯ agent: back up solves automatically' },
  { kind: 'note', text: '  read    src/lib/storage/indexeddb.ts' },
  { kind: 'note', text: '  plan    daily snapshot, restore on sign-in' },
  { kind: 'fail', text: '  test    ✗ restores solves after reinstall' },
  { kind: 'add', text: '+ export async function snapshot(solves: Solve[]) {' },
  { kind: 'add', text: '+   const blob = await compress(serialize(solves))' },
  { kind: 'add', text: '+   await storage.put(backupKey(userId, today()), blob)' },
  { kind: 'add', text: '+ }' },
  { kind: 'ok', text: '  test    ✓ restores solves after reinstall' },
  { kind: 'note', text: '  review  ranielli: handle a session with no connection' },
  { kind: 'ok', text: '✓ ready for the PR' },
]

export function terminalLinesFor(progress: number, total: number): number {
  return Math.round(Math.min(1, Math.max(0, progress)) * total)
}
