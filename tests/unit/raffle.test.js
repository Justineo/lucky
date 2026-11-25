import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import extract from '../../src/extract'
import { load, save } from '../../src/lib/storage'
import { pad, shuffle } from '../../src/lib/utils'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('existing raffle data contracts', () => {
  it('parses the existing roster and optional round formats', () => {
    expect(extract('Alice|Blue\r\n\r\nBob\n---\nFinal|2\n')).toEqual({
      candidates: [
        { name: 'Alice', desc: 'Blue' },
        { name: 'Bob', desc: undefined },
      ],
      rounds: [{ title: 'Final', count: 2 }],
    })
  })

  it('keeps padded labels and samples without mutating the source roster', () => {
    expect([1, 42, 999].map((n) => pad(n, 3))).toEqual(['001', '042', '999'])
    const source = ['001', '002', '003']
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    expect(shuffle(source, 2)).toEqual(['003', '001', '002'])
    expect(source).toEqual(['001', '002', '003'])
  })

  it('uses the same JSON keys and handles unavailable or malformed values', () => {
    const values = new Map([
      ['mode', '"number"'],
      ['custom', 'invalid-json'],
    ])
    vi.stubGlobal('localStorage', {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    })
    expect(load('mode')).toBe('number')
    expect(load('custom', '')).toBe('')
    save({ cooldown: 250, current: [[{ name: '001' }]] })
    expect(values.get('cooldown')).toBe('250')
    expect(load('current')).toEqual([[{ name: '001' }]])
  })
})
