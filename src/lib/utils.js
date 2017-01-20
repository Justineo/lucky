export function pad (number, digits) {
  let numDigits = Math.floor(Math.log10(number)) + 1
  if (numDigits >= digits) {
    return '' + number
  }
  return Array(digits - numDigits).fill(0).join('') + number
}

export function swap (items, i, j) {
  let k = items[i]
  items[i] = items[j]
  items[j] = k
}

export function shuffle (items, count = items.length) {
  count = Math.min(items.length, count)
  let shuffled = [...items]
  let len = shuffled.length
  for (let i = 0; i < count; i++) {
    let j = Math.floor(Math.random() * (len - i)) + i
    swap(shuffled, i, j)
  }
  return shuffled
}
