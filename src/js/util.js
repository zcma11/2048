export function arrWarn(message, sth) {
  if (Array.isArray(sth)) {
    if (arr.length === 0) {
      throw Error(message)
    }
  }
}

export function random(limit) {
  return Math.floor(Math.random() * limit) // 0 - limit-1
}

export function throttle(cb, limit) {
  let start = Date.now()

  return function (e) {
    const end = Date.now()
    console.log(end - start)
    if (end - start > limit) {
      cb(e)
      start = end
    }
  }
}
