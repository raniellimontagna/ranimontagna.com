/**
 * Brand marks served from /public/brand-icons (simple-icons v15, CC0, and
 * @lobehub/icons-static-svg 1.70.0, MIT). Monochrome, painted with
 * currentColor through a CSS mask so they follow the theme.
 */
export const BRAND_ICON_NAMES = [
  'react',
  'nextdotjs',
  'nodedotjs',
  'typescript',
  'electron',
  'fastify',
  'postgresql',
  'pulumi',
  'aws',
  'cloudflare',
  'svelte',
  'claude',
  'openai',
  'gemini',
  'deepseek',
  'openrouter',
  'modelcontextprotocol',
] as const

export type BrandIconName = (typeof BRAND_ICON_NAMES)[number]

// AWS services share the AWS mark: the official architecture icons are
// colored tiles that turn into solid squares as a monochrome mask.
const TECH_ICONS: Readonly<Record<string, BrandIconName>> = {
  react: 'react',
  'react native': 'react',
  'next.js': 'nextdotjs',
  node: 'nodedotjs',
  'node.js': 'nodedotjs',
  typescript: 'typescript',
  electron: 'electron',
  fastify: 'fastify',
  postgresql: 'postgresql',
  pulumi: 'pulumi',
  aws: 'aws',
  'ecs fargate': 'aws',
  'aurora (rds)': 'aws',
  eventbridge: 'aws',
  sqs: 'aws',
  'api gateway': 'aws',
  cloudflare: 'cloudflare',
  svelte: 'svelte',
  claude: 'claude',
  codex: 'openai',
  gemini: 'gemini',
  deepseek: 'deepseek',
  openrouter: 'openrouter',
  mcp: 'modelcontextprotocol',
}

/** The brand mark for a technology label, or null when it has no official logo. */
export function techIcon(label: string): BrandIconName | null {
  return TECH_ICONS[label.trim().toLowerCase()] ?? null
}
