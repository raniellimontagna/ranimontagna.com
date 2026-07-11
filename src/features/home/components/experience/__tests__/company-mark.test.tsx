import { render, screen } from '@/tests/test-utils'
import { CompanyMark } from '../company-mark'

vi.mock('next/image', () => ({
  default: ({
    alt,
    fill: _fill,
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean
    priority?: boolean
    // biome-ignore lint/performance/noImgElement: test double for next/image
  }) => <img alt={alt} {...props} />,
}))

describe('CompanyMark', () => {
  it('renders company logos as full-bleed square images', () => {
    const { container } = render(
      <CompanyMark alt="Luizalabs logo" company="Luizalabs" logo="/companies/luizalabs.webp" />,
    )

    expect(container.firstElementChild).toHaveClass('h-18', 'w-18', 'lg:h-20', 'lg:w-20')
    expect(container.firstElementChild).toHaveAttribute('data-company-mark-treatment', 'cover')
    expect(container.firstElementChild).not.toHaveClass('p-2.5')
    expect(container.querySelector('[data-company-mark-image-frame="true"]')).toHaveClass('inset-0')
    expect(screen.getByAltText('Luizalabs logo')).toHaveClass('h-full', 'w-full', 'object-cover')
  })

  it('contains transparent company marks on a brand plate', () => {
    const { container } = render(
      <CompanyMark alt="SB Sistemas logo" company="SBSistemas" logo="/companies/sbsistemas.svg" />,
    )

    expect(container.firstElementChild).toHaveAttribute('data-company-mark-treatment', 'contained')
    expect(container.firstElementChild).toHaveClass('bg-[#f3faef]', 'dark:bg-[#f3faef]')
    expect(container.firstElementChild).toHaveClass('border-[#c8dfb7]')
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass('bg-gradient-to-br')
    expect(container.querySelector('[data-company-mark-image-frame="true"]')).toHaveClass(
      'inset-3',
      'z-10',
    )
    expect(screen.getByAltText('SB Sistemas logo')).toHaveClass('object-contain')
  })
})
