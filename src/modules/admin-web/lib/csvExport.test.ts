import { describe, it, expect } from 'vitest'
import { escapeCsvCell, rowsToCsv } from './csvExport'

describe('escapeCsvCell', () => {
  it('returns plain text unchanged when no special chars', () => {
    expect(escapeCsvCell('abc')).toBe('abc')
  })

  it('wraps and doubles quotes when comma present', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"')
  })

  it('doubles internal quotes', () => {
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""')
  })

  it('escapes newlines', () => {
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"')
  })
})

describe('rowsToCsv', () => {
  it('joins rows with CRLF and cells with comma', () => {
    expect(rowsToCsv([['a', 'b'], ['1', '2']])).toBe('a,b\r\n1,2')
  })
})
