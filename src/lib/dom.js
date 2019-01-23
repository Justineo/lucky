export function focus (el, isCollapse) {
  if (!el) {
    return
  }
  let range = document.createRange()
  let selection = window.getSelection()
  if (typeof el.select === 'function' && el.value !== undefined) { // form inputs
    el.select()
    if (isCollapse) {
      selection.collapseToEnd()
    }
  } else if (el.contentEditable === 'true') { // contenteditable elements
    range.selectNodeContents(el)
    if (isCollapse) {
      range.collapse()
    }
    selection.removeAllRanges()
    selection.addRange(range)
    el.focus()
  } else {
    el.focus()
  }
}

export function fitByFontSize (el, min = 12, step = 2) {
  while (el.scrollHeight > el.offsetHeight) {
    if (!adjustFontSize(el, min, -step)) {
      break
    }
  }
}

function adjustFontSize (el, min, amount) {
  let size = Math.max(parseInt(window.getComputedStyle(el).fontSize, 10) + amount, min)
  if (size !== min) {
    el.style.fontSize = `${size}px`
    return true
  }
  return false
}
