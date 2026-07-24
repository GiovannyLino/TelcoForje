import { describe, expect, it } from 'vitest'
import { intervalosSobrepoem } from './lib'

const d = (h: number) => new Date(2026, 6, 24, h, 0, 0)

describe('sobreposição de reservas', () => {
  it('detecta sobreposição parcial', () => {
    expect(intervalosSobrepoem(d(9), d(15), d(13), d(17))).toBe(true)
  })
  it('não sobrepõe quando encostam (fim exclusivo)', () => {
    expect(intervalosSobrepoem(d(9), d(12), d(12), d(15))).toBe(false)
  })
  it('não sobrepõe quando separados', () => {
    expect(intervalosSobrepoem(d(9), d(11), d(13), d(15))).toBe(false)
  })
  it('detecta contido', () => {
    expect(intervalosSobrepoem(d(9), d(18), d(12), d(14))).toBe(true)
  })
})
