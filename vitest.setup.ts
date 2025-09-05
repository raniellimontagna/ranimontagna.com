import React from 'react'
import { vi } from 'vitest'

vi.mock('next/image', () => {
  return {
    __esModule: true,
    default: (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
      React.createElement('img', { ...props }),
  }
})
