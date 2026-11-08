import type { BrandIconName } from '@/shared/ui-2026'

/** Logo and name only: the section never says what each one is "for". */
export const AI_MODELS: readonly { name: string; icon: BrandIconName }[] = [
  { name: 'Claude', icon: 'claude' },
  { name: 'Codex', icon: 'openai' },
  { name: 'Gemini', icon: 'gemini' },
  { name: 'DeepSeek', icon: 'deepseek' },
  { name: 'OpenRouter', icon: 'openrouter' },
  { name: 'MCP', icon: 'modelcontextprotocol' },
]

export const AI_STEP_IDS = ['talk', 'spec', 'plan', 'test', 'agent', 'review'] as const
export const AI_TERM_IDS = ['sdd', 'tdd', 'mcp', 'agentsmd', 'evals', 'review'] as const
export const AI_PROOF_IDS = ['products', 'agents', 'providers', 'tests'] as const
