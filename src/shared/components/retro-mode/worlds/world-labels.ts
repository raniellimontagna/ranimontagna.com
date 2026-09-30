const labels = {
  pt: {
    home: 'Início',
    about: 'Sobre mim',
    projects: 'Projetos',
    blog: 'Blog',
    contact: 'Contato',
    exit: 'Voltar ao futuro',
  },
  en: {
    home: 'Home',
    about: 'About me',
    projects: 'Projects',
    blog: 'Blog',
    contact: 'Contact',
    exit: 'Back to the future',
  },
  es: {
    home: 'Inicio',
    about: 'Sobre mí',
    projects: 'Proyectos',
    blog: 'Blog',
    contact: 'Contacto',
    exit: 'Volver al futuro',
  },
}

export function getWorldLabels(locale: string) {
  return labels[locale === 'en' || locale === 'es' ? locale : 'pt']
}
