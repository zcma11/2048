import Factory from './Factory'
import Printer from './Printer'
import Score from './Score'
import Storage from './Storage'
import { debounce } from './util'

export default class Controler {
  constructor() {
    this.factory = new Factory()
    this.printer = new Printer()
    this.score = new Score()
    this.storage = new Storage()
    this.stop = false
  }

  init() {
    const { factory, printer, storage, score } = this
    // 读存储
    const data = storage.getData()
    const bestScore = storage.getMaxScore()

    // 初始化数据
    !this.stop && printer.initPrinter() // restart不走这
    factory.initMap()
    this.stop = false

    if (data) {
      score.updateScore(data.score)
      printer.read(data.map)
      factory.fixProperty(data.map) // 解决原型丢失
    } else {
      factory.randomBlock()
      factory.randomBlock()
      printer.read(factory.blockMap)
      storage.setData({ score: 0, map: factory.blockMap })
    }

    if (bestScore > 0) score.updateHistory(bestScore)
  }

  listen() {
    const stage = document.getElementById('stage')

    // touch
    let touchStartX,touchStartY
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].pageX
      touchStartY = e.changedTouches[0].pageY
    })

    stage.addEventListener('touchmove', (e) => {
      e.preventDefault()
    })

    stage.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].pageX
      const touchEndY = e.changedTouches[0].pageY
      const slidingDistanceX = touchEndX - touchStartX
      const slidingDistanceY = touchEndY - touchStartY
      const absX = Math.abs(slidingDistanceX)
      const absY = Math.abs(slidingDistanceY)

      if (absX > absY) {
        // left right
        absX > 20 && (slidingDistanceX > 0 ? this.combo('right') : this.combo('left'))
      } else {
        absY > 20 && (slidingDistanceY > 0 ? this.combo('down') : this.combo('up'))
      }
    })

    // keydown
    window.addEventListener('keydown', event => {
      event.preventDefault()
      if (this.stop) return

      switch (event.key) {
        case 'ArrowUp':
          this.combo('up')
          break
        case 'ArrowRight':
          this.combo('right')
          break
        case 'ArrowDown':
          this.combo('down')
          break
        case 'ArrowLeft':
          this.combo('left')
          break
      }
    })

    // 按钮监听
    const restart = document.getElementById('restart')
    const noticeButton = document.getElementById('notice').children[1]

    restart.addEventListener('click', (e) => {
      e.preventDefault()
      this.restart()
    })
    noticeButton.addEventListener('click', e => {
      e.target.textContent !== '知道了'
        ? this.restart()
        : (this.closeNotice(), (this.stop = false))
    })

    // resize
    window.addEventListener('resize', debounce(() => {
      this.resize()
    }, 60))
  }

  restart() {
    this.printer.clearAll()
    this.score.reset()
    this.closeNotice()
    this.storage.clearData()
    this.init()
  }

  combo(dir) {
    const { factory, printer, score } = this
    const { missionQueue } = factory

    // 完成移动计算
    factory.callMove(dir)

    if (missionQueue.length > 0) {
      const result = factory.checkMissionQueue()
      result === 1  && this.win() // 2048
      result === 0  && this.recyclable() // 8192
      missionQueue.push(factory.randomBlock()) // 新数字
    } else if (factory.haveNoVacancy && !factory.availableMerge()) {
      this.lose()
      return
    }

    // 计算得分
    const point = this.computed(factory.missionQueue)

    if (point > 0) {
      score.updateScore(point)
      score.additionAnimation(point)
    }

    // 存储
    this.storage.setData({ score: score.totalScore, map: factory.blockMap })
    // 绘制动画
    printer.print(factory.missionQueue, this.score.hook).then(result => {
      printer.clearAll()
      printer.read(factory.blockMap)
    })
  }

  computed(missionQueue) {
    return missionQueue.reduce((result, each) => {
      const point = each.newVal
      return point ? result + point : result
    }, 0)
  }

  resize() {
    const { printer } = this

    printer.initPrinter()
    printer.read(this.factory.blockMap)
  }

  win() {
    this.showNotice('Perfect !', '知道了')
  }

  lose() {
    const { score, storage } = this
    const { totalScore } = score

    storage.setMaxScore(totalScore)
    storage.clearData()
    this.showNotice('Game Over !', '再来一次')
  }

  recyclable() {
    this.showNotice('4096 => 2', '知道了')
    this.score.updateScore(8192)
  }

  showNotice(message, option) {
    this.stop = true

    const notice = document.getElementById('notice')
    const [p, button] = notice.children

    p.textContent = message
    button.textContent = option
    notice.className = 'show'
  }

  closeNotice() {
    const notice = document.getElementById('notice')

    notice.className = 'hide'
  }
}
