/** Who he is, in the few lines every world tells: a notepad, a README, a front page. */
const bio = {
  pt: {
    lead: 'Engenheiro de produto. Pego a dor de alguém e entrego o produto no ar, com IA escrevendo o código e eu decidindo o que importa.',
    detail:
      'Mais de 5 anos construindo produtos web e mobile que precisam escalar, de apps para mais de mil lojas do Magalu a produtos próprios no ar.',
  },
  en: {
    lead: "Product engineer. I take someone's pain point and ship the product, with AI writing the code and me deciding what matters.",
    detail:
      'Over 5 years building web and mobile products that need to scale, from apps for more than a thousand Magalu stores to my own live products.',
  },
  es: {
    lead: 'Ingeniero de producto. Parto del dolor de alguien y entrego el producto ya en línea, con la IA escribiendo el código y yo decidiendo lo que importa.',
    detail:
      'Más de 5 años construyendo productos web y móviles que necesitan escalar, desde apps para más de mil tiendas de Magalu hasta productos propios en línea.',
  },
}

export function getWorldBio(locale: string) {
  return bio[locale === 'en' || locale === 'es' ? locale : 'pt']
}
