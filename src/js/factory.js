import Block from './Block'

export default class Factory {
  constructor() {
    this.blockMap = []
    this.missionQueue = []
    this.haveNoVacancy = false
  }

  initMap() {
    const map = []

    for (let i = 0; i < 4; i++) {
      map.push(new Array(4))
    }

    this.blockMap = map
    Block.prototype.map = map
  }

  callMove(dir) {
    const { missionQueue } = this
    const guide = this.checkDirection(dir)
    const { col, row } = this.initTraversals(guide)

    col.forEach(x => {
      row.forEach(y => {
        const block = this.blockMap[x][y]
        if (block) {
          const result = block.move(guide)
          result && missionQueue.push(result)
        }
      })
    })
  }

  checkDirection(dir) {
    // 下标移动的方向和步数
    const manual = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 }
    }

    return manual[dir]
  }

  initTraversals(guide) {
    let col = [0, 1, 2, 3]
    let row = [0, 1, 2, 3]

    if (guide.x === 1) col = col.reverse()
    if (guide.y === 1) row = row.reverse()

    return { col, row }
  }

  random(arr) {
    const length = arr.length
    const i = Math.floor(Math.random() * length)

    return arr[i]
  }

  randomBlock() {
    const available = this.availableLocation()
    const { x, y } = this.random(available)
    const val = Math.random() < 0.9 ? 2 : 4

    this.create(val, x, y)
    return { x, y, val }
  }

  availableLocation() {
    const availableLocations = []
    let x = 4
    while (x--) {
      let y = 4
      while (y--) {
        !this.blockMap[x][y] && availableLocations.push({ x, y })
      }
    }
    // 缓存下一轮可用位置的结果
    this.haveNoVacancy = availableLocations.length === 1
    return availableLocations
  }

  create(val, x, y) {
    const block = new Block(x, y, val)

    block.map[x][y] = block
  }

  checkMissionQueue() {
    const { blockMap } = this
    let win
    
    this.missionQueue.forEach(({ newVal, to: { x, y } },i) => {
      if (newVal) {
        // 恢复merged状态
        blockMap[x][y].merged = false
        newVal === 2048 && win !== 0 && (win = 1) // win()
        newVal === 2 && (win = 0) // recyclable()
      }
    })

    return win
  }

  availableMerge() {
    const left = this.checkDirection('left')
    const up = this.checkDirection('up')
    const { blockMap } = this

    // 从右下角开始 往左往上找数字一样的
    let x = 4
    while (--x > 0) {
      let y = 4
      while (--y > 0) {
        const block = blockMap[x][y]
        if (block) {
          const leftOne = blockMap[x + left.x][y + left.y]
          const upOne = blockMap[x + up.x][y + up.y]

          if (
            (leftOne && leftOne.val === block.val) ||
            (upOne && upOne.val === block.val)
          ) {
            return true
          }
        }
      }
    }

    return false
  }

  // json转变丢失原型，替换
  fixProperty(map) {
    const { blockMap } = this
    let x = 4
    while (x--) {
      let y = 4
      while (y--) {
        const block = map[x][y]
        block && (blockMap[x][y] = new Block(x, y, block.val))
      }
    }
  }
}
