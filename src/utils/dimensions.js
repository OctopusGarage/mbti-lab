export const DIMENSIONS = [
  { key: 'EI', letters: ['E', 'I'] },
  { key: 'NS', letters: ['N', 'S'] },
  { key: 'FT', letters: ['F', 'T'] },
  { key: 'JP', letters: ['J', 'P'] },
]

// The inclusive 45–55 range is an editorial display convention, not an
// uncertainty estimate. Scoring, tie selection and independent rounding stay
// in useTest; this adapter never changes the stored result.
export function interpretDimensions(percents) {
  if (
    !percents ||
    !DIMENSIONS.every(({ key, letters }) =>
      letters.every(
        (letter) =>
          Number.isFinite(percents[key]?.[letter]) &&
          percents[key][letter] >= 0 &&
          percents[key][letter] <= 100,
      ),
    )
  )
    return []
  return DIMENSIONS.map(({ key, letters }) => {
    const score = percents[key][letters[0]]
    return { key, pair: letters.join('/'), close: score >= 45 && score <= 55 }
  })
}
