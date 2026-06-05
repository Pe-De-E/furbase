import { describe, it, expect } from 'vitest'
import { avatarColor } from '../user-avatar'

describe('avatarColor', () => {
  it('returns a hex color string', () => {
    expect(avatarColor('P')).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('returns the same color for the same input', () => {
    expect(avatarColor('P')).toBe(avatarColor('P'))
  })

  it('falls back gracefully for null', () => {
    expect(() => avatarColor(null)).not.toThrow()
    expect(avatarColor(null)).toMatch(/^#[0-9A-Fa-f]{6}$/)
  })

  it('falls back gracefully for undefined', () => {
    expect(() => avatarColor(undefined)).not.toThrow()
  })

  it('uses the first character only', () => {
    expect(avatarColor('Philipp')).toBe(avatarColor('P'))
  })

  it('different first letters can produce different colors', () => {
    const colors = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(avatarColor)
    const unique = new Set(colors)
    expect(unique.size).toBeGreaterThan(1)
  })
})
