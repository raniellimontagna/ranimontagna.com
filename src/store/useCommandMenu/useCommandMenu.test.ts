import { useCommandMenu } from './useCommandMenu'

describe('useCommandMenu store', () => {
  beforeEach(() => {
    useCommandMenu.setState({ isOpen: false })
  })

  describe('initial state', () => {
    it('starts with isOpen as false', () => {
      const { isOpen } = useCommandMenu.getState()

      expect(isOpen).toBe(false)
    })
  })

  describe('setOpen', () => {
    it('sets isOpen to true', () => {
      const { setOpen } = useCommandMenu.getState()

      setOpen(true)

      expect(useCommandMenu.getState().isOpen).toBe(true)
    })

    it('sets isOpen to false', () => {
      useCommandMenu.setState({ isOpen: true })
      const { setOpen } = useCommandMenu.getState()

      setOpen(false)

      expect(useCommandMenu.getState().isOpen).toBe(false)
    })
  })

  describe('toggle', () => {
    it('toggles from false to true', () => {
      const { toggle } = useCommandMenu.getState()

      toggle()

      expect(useCommandMenu.getState().isOpen).toBe(true)
    })

    it('toggles from true to false', () => {
      useCommandMenu.setState({ isOpen: true })
      const { toggle } = useCommandMenu.getState()

      toggle()

      expect(useCommandMenu.getState().isOpen).toBe(false)
    })

    it('toggles multiple times correctly', () => {
      const { toggle } = useCommandMenu.getState()

      toggle()
      expect(useCommandMenu.getState().isOpen).toBe(true)

      toggle()
      expect(useCommandMenu.getState().isOpen).toBe(false)

      toggle()
      expect(useCommandMenu.getState().isOpen).toBe(true)
    })
  })
})
