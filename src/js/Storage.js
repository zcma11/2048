export default class Storage {
  getData() {
    return JSON.parse(window.localStorage.getItem('2048-data'))
  }

  setData(data) {
    window.localStorage.setItem('2048-data', JSON.stringify(data))
  }

  getMaxScore() {
    return window.localStorage.getItem('2048-bestScore') || 0
  }

  setMaxScore(score) {
    window.localStorage.setItem('2048-bestScore', score)
  }

  clearData() {
    window.localStorage.removeItem('2048-data')
  }
}