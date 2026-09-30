export const RETRO_MODES = ['1998', 'xp', 'dos', 'gameboy', 'newspaper', 'ide', 'mac'] as const
export type RetroMode = (typeof RETRO_MODES)[number]

export function parseRetroMode(value: string | null): RetroMode | null {
  if (value === 'true') return '1998'
  return RETRO_MODES.includes(value as RetroMode) ? (value as RetroMode) : null
}
