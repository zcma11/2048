export function reverse(arr) {
  if (arr.length <= 1) return

  const len = arr.length - 1
  const middle = -~len / 2

  for (let i = 0; i < middle; i++) {
    ;[arr[i], arr[len - i]] = [arr[len - i], arr[i]]
  }
}

export function debounce(cb, limit) {
  let last = Date.now()
  let timer
  return () => {
    const now = Date.now()

    if (now - last < limit) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      cb()
    }, limit)

    last = now
  }
}
