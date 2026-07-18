const projectIntentPattern =
  /\b(?:projetos?|freelanc(?:e|er)|consultoria|propostas?|parcerias?|orcamento|contratar|projects?|freelanc(?:e|er)|consulting|proposals?|partnerships?|quote|hire|proyectos?|consultoria|propuestas?|colaboraciones?|presupuesto|contratar)\b/

const categoricalUnavailabilityPatterns = [
  /\bnao (?:estou|sou) disponivel\b/,
  /\b(?:estou|sou) indisponivel\b/,
  /\bnao posso (?:aceitar|assumir|pegar|fazer) (?:outros? )?projetos?\b/,
  /\bagenda (?:e|esta) dedicada\b/,
  /\bnot available\b/,
  /\b(?:cannot|can't) (?:accept|take on|take) (?:other )?projects?\b/,
  /\bschedule is dedicated\b/,
  /\bno estoy disponible\b/,
  /\b(?:estoy|soy) indisponible\b/,
  /\bno puedo (?:aceptar|asumir|tomar|hacer) (?:otros? )?proyectos?\b/,
  /\bagenda (?:esta|es) dedicada\b/,
] as const

export function answerHasAvailabilityConflict(answer: string, visitorMessage: string): boolean {
  if (!projectIntentPattern.test(visitorMessage)) return false
  return categoricalUnavailabilityPatterns.some((pattern) => pattern.test(answer))
}
