import { reverse } from './util'
import collectLocation from './collectLocation'

export default class Printer {
  constructor() {
    const canvas = document.getElementById('stage')
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.reference = collectLocation() // 坐标的映射: {normal,media}
    this.size = '' // normal || media
    this.speed = 0
    this.colorMap = new Map([
      [2, '#EEE4DA'],
      [4, '#EDE0C8'],
      [8, '#F2B179'],
      [16, '#F59563'],
      [32, '#F67C5F'],
      [64, '#ff6b49'],
      [128, '#EDCF72'],
      [256, '#edcc61'],
      [512, '#edc850'],
      [1024, '#EDC53F'],
      [2048, '#EDC22E']
    ])
  }

  initPrinter() {
    const box = document.getElementById('gameBox')
    const { canvas, ctx, reference } = this
    const width = box.offsetWidth
    canvas.width = width
    canvas.height = width
    // 响应式布局
    this.size = width > 400 ? 'normal' : 'media'
    // 平移速度
    this.speed = reference[this.size][4] / (width > 400 ? 3 : 5)
    // 设置字体大小
    ctx.font = width > 400 ? 'bold 55px serif' : 'bold 30px serif'
    // 水平居中
    ctx.textAlign = 'center'
    // 垂直居中
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 0.5
    // 阴影
    ctx.shadowBlur = 10
    ctx.shadowColor = 'rgba(255,255,255,.3)'
    // 文字颜色
    ctx.fillStyle = '#776e65'
  }

  read(map) {
    let x = 4
    while (x--) {
      let y = 4
      while (y--) {
        const block = map[x][y]

        if (block) {
          const result = this.parse(block)
          this.render(result)
        }
      }
    }
  }

  render({ number: { x, y, val }, background: { offset, size, color } }) {
    const { ctx } = this

    ctx.save()
    ctx.fillStyle = color
    ctx.fillRect(x - offset, y - offset, size, size)
    ctx.restore()
    ctx.fillText(val, x, y)
  }

  clear({ number: { x, y }, background: { offset, size } }) {
    const { ctx } = this
    ctx.clearRect(x - offset, y - offset, size, size)
  }

  clearAll() {
    const { canvas, ctx } = this
    const size = canvas.width

    ctx.clearRect(0, 0, size, size)
  }

  parse({ x: col, y: row, val }) {
    //           0   1    2    3   格子 偏移 边框
    // normal：[65, 185, 305, 425, 120, 55, 10]
    // media: [35, 95, 155, 215, 60, 25, 10]
    const reference = this.reference[this.size]
    const half = reference[5]
    const color = this.colorMap.get(val) || '#bfa'
    const x = reference[col]
    const y = reference[row]

    return {
      number: { x, y, val },
      background: { offset: half, size: half * 2, color }
    }
  }

  print(missionQueue) {
    return new Promise(resolve => {
      // 数据没动
      if (missionQueue.length === 0) {
        return
      }

      const generateMission = missionQueue.pop()
      const generateDetail = this.parse(generateMission)
      // 添加的动画
      const add = this.addAnimation(generateDetail)
      const addBlock = () => {
        this.playAnimation([add]).then(
          () => {
            resolve()
          },
          err => {
            console.warn(err)
          }
        )
      }

      reverse(missionQueue) // 反转

      let count = missionQueue.length

      while (missionQueue.length > 0) {
        let { from, to, val, newVal } = missionQueue.pop()

        // 解析出详细信息
        from = this.parse({ ...from, val })
        to = this.parse({ ...to, val: newVal })

        // 初始化移动动画
        const translation = this.translationAnimation(from, to, this.speed)

        if (!newVal) {
          this.playAnimation([translation]).then(
            () => {
              count--
              if (!count) addBlock() // 最后一个完成的触发生成
            },
            err => {
              console.warn(err)
            }
          )
        } else {
          // 初始化合并动画
          const merge = this.mergeAnimation(to)
          this.playAnimation([merge, translation]).then(
            () => {
              count--
              if (!count) addBlock() // 最后一个完成的触发生成
            },
            err => {
              console.warn(err)
            }
          )
        }
      }
    })
  }

  translationAnimation(from, to, speed) {
    const printer = this
    const { number } = from
    const {
      number: { x: toX, y: toY }
    } = to

    let distance = toX - number.x
    let change = 'x'
    let target = toX

    if (distance === 0) {
      distance = toY - number.y
      change = 'y'
      target = toY
    }

    // 方向不同，坐标由小到大，由大到小
    if (distance > 0) {
      speed = -speed
    }

    return () => {
      const ctx = this.ctx
      return new Promise((resolve, reject) => {
        const cb = () => {
          printer.clear(from)
          number[change] -= speed // 移动坐标
          ctx.save()
          // 移动时的蓝色阴影
          ctx.shadowBlur = 10
          ctx.shadowColor = 'rgba(100, 149, 237,.3)'
          printer.render(from)
          ctx.restore()

          if (number[change] !== target) {
            printer.emit(cb)
          } else {
            resolve()
          }
        }

        try {
          cb()
        } catch {
          reject('translation出错了')
        }
      })
    }
  }

  mergeAnimation(to) {
    const printer = this
    const reference = this.reference[this.size]
    const lineWidth = reference[6] // 网（边框）的宽度
    const offset = reference[5] // 距离数字渲染位置的偏移量

    let inc = 0.5

    return () => {
      return new Promise((resolve, reject) => {
        const cb = () => {
          printer.clear(to)
          to.background.offset = offset + inc
          to.background.size = (offset + inc) * 2
          inc++

          // 不越过别的格子
          if (inc < lineWidth) {
            printer.emit(cb)
          } else {
            printer.clear(to)
            // 恢复原来的大小
            to.background.offset = offset
            to.background.size = offset * 2
            resolve()
          }

          printer.render(to)
        }

        try {
          cb()
        } catch {
          reject('merge出错了')
        }
      })
    }
  }

  addAnimation(block) {
    const reference = this.reference[this.size]
    const offset = reference[5] // 距离数字渲染位置的偏移量
    const { background } = block
    this.clear(block)

    let inc, n // 数字和方块的增长速度
    if (this.size === 'media') {
      // media [35, 95, 155, 215, 60, 25, 10]
      background.offset = 0
      background.size = offset
      inc = 5
      n = 10
    } else {
      // normal [65, 185, 305, 425, 120, 55, 10]
      background.offset = 25
      background.size = offset
      inc = 5
      n = 0
    }

    return () => {
      const ctx = this.ctx
      return new Promise((resolve, reject) => {
        const cb = () => {
          background.offset += inc
          // 方块大小
          background.size = background.offset * 2
          this.clear(block)
          ctx.save()
          // 文字大小
          ctx.font = `bold ${background.offset + n}px serif`
          this.render(block)
          ctx.restore()

          if (background.offset !== offset) {
            this.emit(cb)
          } else {
            resolve()
          }
        }

        try {
          cb()
        } catch {
          reject('add出错了')
        }
      })
    }
  }

  playAnimation(animations) {
    let animation = animations.pop()
    let now = animation() // promise
    while (animations.length > 0) {
      animation = animations.pop()
      // 逐个执行动画
      now = now.then(animation, err => console.warn(err))
    }

    return now // promise
  }

  emit(cb) {
    window.requestAnimationFrame(cb)
  }
}
