import matter from 'gray-matter'

const rejectJavaScript = (): never => {
  throw new Error('Front matter em JavaScript não é aceito; use YAML')
}

/**
 * gray-matter avalia com `eval` um front matter aberto por `---js` ou
 * `---javascript`. Os posts vêm do repositório de conteúdo, então só YAML
 * (e JSON, que não executa nada) passa.
 */
export function parseFrontMatter(content: string) {
  return matter(content, { engines: { javascript: rejectJavaScript, js: rejectJavaScript } })
}
