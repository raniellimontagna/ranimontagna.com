import { useCommandMenu } from './useCommandMenu'

describe('useCommandMenu', () => {
  beforeEach(() => {
    useCommandMenu.setState({ isOpen: false })
  })

  it('should start with isOpen as false', () => {
    const state = useCommandMenu.getState()

    expect(state.isOpen).toBe(false)
  })

  it('should set isOpen to true', () => {
    const { setOpen } = useCommandMenu.getState()

    setOpen(true)

    expect(useCommandMenu.getState().isOpen).toBe(true)
  })

  it('should set isOpen to false', () => {
    useCommandMenu.setState({ isOpen: true })
    const { setOpen } = useCommandMenu.getState()

    setOpen(false)

    expect(useCommandMenu.getState().isOpen).toBe(false)
  })

  it('should toggle isOpen from false to true', () => {
    const { toggle } = useCommandMenu.getState()

    toggle()

    expect(useCommandMenu.getState().isOpen).toBe(true)
  })

  it('should toggle isOpen from true to false', () => {
    useCommandMenu.setState({ isOpen: true })
    const { toggle } = useCommandMenu.getState()

    toggle()

    expect(useCommandMenu.getState().isOpen).toBe(false)
  })
})
