import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render } from '@/tests/test-utils'
import { BrandIcon } from '../brand-icon'
import { BRAND_ICON_NAMES, techIcon } from '../brand-icons'
import { TechChip } from '../tech-chip'

describe('brand icons', () => {
  it('every brand icon name has a file in public/brand-icons', () => {
    for (const name of BRAND_ICON_NAMES) {
      const file = join(process.cwd(), 'public/brand-icons', `${name}.svg`)
      expect(existsSync(file), name).toBe(true)
      expect(readFileSync(file, 'utf8'), name).toMatch(/viewBox=/)
    }
  })

  it('techIcon maps service names to aws and unknown labels to null', () => {
    expect(techIcon('Aurora (RDS)')).toBe('aws')
    expect(techIcon('ECS Fargate')).toBe('aws')
    expect(techIcon('React Native')).toBe('react')
    expect(techIcon('Node')).toBe('nodedotjs')
    expect(techIcon('Node.js')).toBe('nodedotjs')
    expect(techIcon('Codex')).toBe('openai')
    expect(techIcon('MCP')).toBe('modelcontextprotocol')
    expect(techIcon('CI/CD')).toBeNull()
    expect(techIcon('Design System')).toBeNull()
    expect(techIcon('IA')).toBeNull()
  })

  it('has the Luizalabs stack marks: Go, Google Cloud, RabbitMQ, SonarQube and Grafana', () => {
    expect(techIcon('Go')).toBe('go')
    expect(techIcon('GCP')).toBe('googlecloud')
    expect(techIcon('RabbitMQ')).toBe('rabbitmq')
    expect(techIcon('SonarQube')).toBe('sonarqubeserver')
    expect(techIcon('Grafana')).toBe('grafana')
  })

  it('BrandIcon is decorative and masks the icon file', () => {
    const { container } = render(<BrandIcon name="claude" className="h-4 w-4" />)
    const icon = container.firstElementChild as HTMLElement
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon.getAttribute('style')).toContain('/brand-icons/claude.svg')
    expect(icon).toHaveClass('h-4', 'w-4')
  })

  it('TechChip shows text only when there is no icon', () => {
    const { container, rerender } = render(<TechChip label="IA" />)
    expect(container).toHaveTextContent('IA')
    expect(container.querySelector('[data-brand-icon]')).toBeNull()

    rerender(<TechChip label="React" />)
    expect(container).toHaveTextContent('React')
    expect(container.querySelector('[data-brand-icon]')).not.toBeNull()
  })
})
