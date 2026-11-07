import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactElement,
  TableHTMLAttributes,
} from 'react'
import { ArticleImage } from './article-image'
import { CodeBlock } from './code-block'
import { MermaidDiagram } from './mermaid-diagram'

type Labels = { zoom: string; close: string }

export function createArticleComponents(labels: Labels) {
  return {
    h2: (props: HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} />,
    h3: (props: HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} />,
    pre: (props: HTMLAttributes<HTMLPreElement>) => {
      const child = props.children as ReactElement<{ className?: string; children?: string }>
      if (child?.props?.className?.includes('language-mermaid')) {
        return <MermaidDiagram chart={String(child.props.children ?? '').trim()} />
      }
      return <CodeBlock {...props} />
    },
    a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const external = props.href?.startsWith('http')
      return (
        <a {...props} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} />
      )
    },
    img: (props: ImgHTMLAttributes<HTMLImageElement>) => (
      <ArticleImage
        src={props.src?.toString()}
        alt={props.alt}
        zoomLabel={labels.zoom}
        closeLabel={labels.close}
      />
    ),
    table: (props: TableHTMLAttributes<HTMLTableElement>) => (
      <div className="article-table">
        <table {...props} />
      </div>
    ),
  }
}

/** Default labels for tests and callers without translations. */
export const articleComponents = createArticleComponents({ zoom: 'Zoom', close: 'Close' })
