export function save(key, value) {
  if (typeof key === 'string') {
    localStorage.setItem(key, JSON.stringify(value))
  } else {
    for (let k in key) {
      if (Object.hasOwn(key, k)) {
        localStorage.setItem(k, JSON.stringify(key[k]))
      }
    }
  }
}

export function load(key, defaultValue) {
  let value = null
  if (typeof key === 'string') {
    value = localStorage.getItem(key)
  }
  try {
    value = value === null && defaultValue !== undefined ? defaultValue : JSON.parse(value)
  } catch {
    value = defaultValue !== undefined ? defaultValue : null
  }
  return value
}
