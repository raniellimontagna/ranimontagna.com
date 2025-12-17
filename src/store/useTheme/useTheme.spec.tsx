import { act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useTheme } from './useTheme'

const initialState = useTheme.getState()

describe('useTheme Zustand store', () => {
  beforeEach(() => {
    act(() => {
      useTheme.setState(initialState)
    })
    localStorage.clear()
    document.documentElement.className = ''
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  it('should have the correct initial state', () => {
    const state = useTheme.getState()
    expect(state.theme).toBe('dark')
    expect(state.mounted).toBe(false)
  })

  it('should set the theme and apply it to the DOM', () => {
    expect(useTheme.getState().theme).toBe('dark')

    act(() => {
      useTheme.getState().setTheme('light')
    })

    expect(useTheme.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    act(() => {
      useTheme.getState().setTheme('dark')
    })

    expect(useTheme.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('should toggle the theme and apply changes to the DOM', () => {
    expect(useTheme.getState().theme).toBe('dark')

    act(() => {
      useTheme.getState().toggleTheme()
    })

    expect(useTheme.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)

    act(() => {
      useTheme.getState().toggleTheme()
    })

    expect(useTheme.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  describe('initTheme', () => {
    it('should initialize with "dark" theme and set mounted to true when localStorage is empty', () => {
      act(() => {
        useTheme.getState().initTheme()
      })

      const state = useTheme.getState()
      expect(state.mounted).toBe(true)
      expect(state.theme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should fallback to "dark" theme if localStorage data is corrupted', () => {
      localStorage.setItem('theme-storage', 'invalid-json')

      act(() => {
        useTheme.getState().initTheme()
      })

      const state = useTheme.getState()
      expect(state.mounted).toBe(true)
      expect(state.theme).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('should not run again if the store is already mounted', () => {
      act(() => {
        useTheme.getState().initTheme()
      })
      act(() => {
        useTheme.getState().setTheme('light')
      })
      expect(useTheme.getState().theme).toBe('light')

      act(() => {
        useTheme.getState().initTheme()
      })

      expect(useTheme.getState().theme).toBe('light')
    })
  })
})
