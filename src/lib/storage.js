export function save (key, value) {
  if (typeof key === 'string') {
    localStorage.setItem(key, JSON.stringify(value))
  } else {
    for (let k in key) {
      if (key.hasOwnProperty(k)) {
        localStorage.setItem(k, JSON.stringify(key[k]))
      }
    }
  }
}

export function load (key, defaultValue) {
  let value = null
  if (typeof key === 'string') {
    value = localStorage.getItem(key)
  }
  try {
    value = value === null && defaultValue !== undefined ? defaultValue : JSON.parse(value)
  } catch (e) {
    value = defaultValue !== undefined ? defaultValue : null
  }
  return value
}
