// Each palette pairs a cool hue with a warmer counterpoint on a porcelain base.
const PALETTES = {
  INTJ: ['#d9d3f0', '#cbdfe9', '#514477'],
  INTP: ['#d0def4', '#e4d8ee', '#385785'],
  ENTJ: ['#e8d1e5', '#ebd9c8', '#754164'],
  ENTP: ['#ccdfec', '#e8d5ec', '#3c597a'],
  INFJ: ['#cce4df', '#e6d9ef', '#34655f'],
  INFP: ['#e2d6ef', '#f2dccc', '#73517f'],
  ENFJ: ['#cde3e4', '#f0dfc8', '#35646c'],
  ENFP: ['#f3d9c6', '#e7d6ed', '#8a4f38'],
  ISTJ: ['#d4dfe9', '#dde5d5', '#41566f'],
  ISFJ: ['#d6e5dc', '#efdfd4', '#486456'],
  ESTJ: ['#d0e1df', '#e9dfc9', '#365f5c'],
  ESFJ: ['#efdadc', '#e8e0cd', '#81535e'],
  ISTP: ['#d1e2e5', '#dce0ee', '#3c606a'],
  ISFP: ['#ead8e2', '#e6e3cc', '#795367'],
  ESTP: ['#efdac5', '#d7e4de', '#835638'],
  ESFP: ['#f1d3cc', '#e7d7ed', '#8a4a50'],
}
export function getShareTheme(type) {
  const [cool, warm, accent] = Object.hasOwn(PALETTES, type ?? '') ? PALETTES[type] : PALETTES.INFJ
  return {
    bgStyle: {
      background: `linear-gradient(135deg, ${warm} 0%, #f7f8fc 45%, ${cool} 100%)`,
    },
    accent,
  }
}
