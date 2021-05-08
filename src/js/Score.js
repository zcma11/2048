export default class Score {
  constructor() {
    const board = document.getElementsByClassName('board')
    this.Scoreboard = board[0] // 分数
    this.historyBoard = board[1] // 最高分
    this.totalScore = 0
    this.historyScore = 0
  }

  additionAnimation(val) {
    this.Scoreboard.insertAdjacentHTML(
      'beforeend',
      `<div class="score-addition">+${val}</div>`
    )
  }

  updateScore(val) {
    const score = this.totalScore + val
    this.totalScore = score
    this.Scoreboard.textContent = score
  }

  reset() {
    this.totalScore = 0
    this.Scoreboard.textContent = 0
  }

  updateHistory(score) {
    this.historyScore < score && (this.historyBoard.textContent = score)
  }
}
