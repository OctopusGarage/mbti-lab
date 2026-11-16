import { describe, it, expect } from 'vitest'
import { getShareTheme } from '../src/utils/shareTheme.js'
const types = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
const luminance = hex => hex.slice(1).match(/../g).map(v => parseInt(v,16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4).reduce((sum,v,i) => sum+v*[.2126,.7152,.0722][i],0)
describe('personality card palettes', () => {
 it('gives all sixteen types distinct layered palettes and readable accents', () => {
  const themes = types.map(getShareTheme)
  expect(new Set(themes.map(t => t.bgStyle.background)).size).toBe(16)
  for (const theme of themes) {
   const colors = theme.bgStyle.background.match(/#[0-9a-f]{6}/g)
   for(const color of colors) expect((luminance(color)+.05)/(luminance(theme.accent)+.05)).toBeGreaterThan(4.5)
  }
 })
 it('provides a safe fallback for unknown and inherited keys', () => {
  for(const type of [null,undefined,'','XXXX','constructor','__proto__']) expect(getShareTheme(type)).toEqual(getShareTheme('INFJ'))
 })
})
