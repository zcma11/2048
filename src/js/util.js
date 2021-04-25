export function arrWarn (message,sth) {
  if (Array.isArray(sth)) {
    if (arr.length === 0) {
      throw Error(message)
    }
  }

  // if (typeof sth === 'object') {
  //   sth.
  // }
  
}