import Block from './Block'
import { throttle } from './util'
import collectLocation from './collectLocation'

export default class Factory {
  constructor() {
    this.blockMap = []
    this.references = collectLocation()
    this.working = 0
    this.length = 0
    this.ctx = ctx
    this.iswork = true
    this.colorMap = new Map([
      [2, '#EEE4DA'],
      [4, '#EDE0C8'],
      [8, '#F2B179'],
      [16, '#F59563'],
      [32, '#F67C5F'],
      [64, '#F65E3B'],
      [128, '#EDCF72'],
      [256, '#edcc61'],
      [512, '#edc850'],
      [1024, '#EDC53F'],
      [2048, '#EDC22E']
    ])
  }

  initMap() {
    const map = []

    for (let i = 0; i < 4; i++) {
      map.push(new Array(4))
    }

    this.blockMap = map
    this.create(2)
    this.create(2)
  }

  mount() {
    const factory = this
    window.addEventListener(
      'keydown',
      throttle(e => {
        console.log(factory.working)
        if (factory.working !== 0) return

        e.preventDefault()
        switch (e.key) {
          case 'ArrowUp':
            this.loadProcess('up')
            break
          case 'ArrowRight':
            this.loadProcess('right')
            break
          case 'ArrowDown':
            this.loadProcess('down')
            break
          case 'ArrowLeft':
            this.loadProcess('left')
            break
        }
      }, 200)
    )
  }

  // random(0,3)
  create(val, x, y, status = 0) {
    const test = typeof x !== 'number'
    if (test) {
      const availableLocation = this.maintain()
      x = availableLocation.row
      y = availableLocation.col
    }

    val = val ? val : Math.random() < 0.9 ? 2 : 4

    const color = this.colorMap.get(val)
    // row, col, val, ctx, references, allBlocks
    const block = new Block(
      x,
      y,
      val,
      color,
      ctx,
      this.references,
      this.blockMap,
      status
    )
    console.log(status)
    test ? this.addAnimation(block) : block.render()
    this.blockMap[x][y] = block
    return block
  }

  addAnimation(block) {
    const factory = this
    const { x, y } = block
    let half = 15
    let increase = 15

    this.working++
    play()
    function play() {
      factory.emit(() => {
        half += increase
        block.render(x, y, half)

        half < 60 ? play() : factory.working--
      })
    }
  }

  maintain() {
    const locations = []
    const map = this.blockMap

    let i = 4
    while (i--) {
      let k = 4
      while (k--) {
        const block = map[i][k]

        if (!block) {
          locations.push({ row: i, col: k })
        } else {
          block.isWalk = 0
          block.val === 2048 && this.win()
        }
      }
    }

    const limit = locations.length
    if (limit > 0) {
      i = Math.floor(Math.random() * limit)
      return locations[i]
    } else {
      this.lose()
    }
  }

  win() {}

  lose() {}

  loadProcess(direction) {
    const map = this.blockMap
    this.length = 0
    // if (!this.isWork) return
    // this.isWork = true
    // 实现了block的移动，接下来处理factory函数，
    // 用setimeout递归实现block自动刷新，空出返回值，返回要合并对象
    let i = 4
    while (i--) {
      let k = 4
      while (k--) {
        const block = map[i][k]

        if (block) {
          this.length++
          this.automation(block, direction)
        }
      }
    }
  }

  automation(block, direction) {
    const factory = this

    this.working++

    run()
    function run() {
      factory.emit(() => {
        block.clear()
        // 返回合并信息
        const report = block.move(direction, 32.5)()
        block.render()
        block.isWalk !== 2 && run()
        // 安排合并
        if (report) {
          report.isMerge
            ? factory.mergeAnimation(block, report)
            : factory.dealReport(report)
        }
      })
    }
  }

  mergeAnimation(block, report) {
    const factory = this
    let increase = 1
    let {
      x,
      y,
      references: [, , , , , half]
    } = block

    play()
    function play() {
      factory.emit(() => {
        half += increase
        block.render(x, y, half)
        increase += 0.5

        if (increase < 3.5) {
          play()
        } else {
          block.clear(x, y, half)
          factory.dealReport(report)
        }
      })
    }
  }

  dealReport(report) {
    const {
      selfFrom: { row: selfRow, col: selfCol },
      finalLocation: { row, col },
      val,
      isMerge,
      self: block
    } = report
    const map = this.blockMap
    this.working--
    if (selfRow === row && selfCol === col) {
      // 没动过
      this.length--
      return
    }

    if (this.length === 0) return

    // 清空
    map[selfRow][selfCol] = null

    // 如果前面的先启动了，然后停下来合并，
    if (isMerge) {
      const behind = block.beFollowed
      const status = behind ? 3 : 0
      // 生成新数字，放在合适位置
      const afterMergeBlock = this.create(val, row, col, status)
      // 根据情况更新更新追踪
      behind && (behind.follow = afterMergeBlock)
    } else {
      map[row][col] = block
    }

    // 寻找插入时机
    this.working === 0 && this.create()
  }

  emit(cb) {
    window.requestAnimationFrame(cb)
  }

  // 需要维护所有的block，每次移动完之后需要修改iswork，需要创建一个新的
  refresh() {
    // 通过坐标获得self和block
    // 删除坐标
    // 如果不是合并，刷新坐标， 可以移动说明前面是空的，同时移动是前面的先停下来，所有可以直接覆盖。
    // 做一个安全机制？
    // 如果合并，合并动画，self放大，
  }

  // 清空，移动，是否有返回，渲染，没有下一次就刷新坐标
  // 新坐标发到create上面
  // 返回selfId，blockId，block起始坐标，self起始坐标，在二维数组中删除
  // 合并动画后，刷新block的坐标，这样就同时清掉了两个
  // 建立跟踪被跟踪系统，当前面的没有合并，停下后解除自己的跟踪对象和通知跟踪对象删除被跟踪信息
  // 如果前面合并了，新生成的block通过被跟踪对象找到跟踪者通知他连接向自己。

  /* 修改成true，删掉不用的，确认可增加的位置
  对象： 移动时找到前面的，合并（移动完根据返回的信息删除对应的，在合并的位置放置新的）。
        返回的消息包括被撞到的block的id，然后继续走，block推入新对象，遍历新对象，执行合并动画，
        当合并动画执行完，删除两个block，然后绘制新图片在block的位置。

        移动合并更新完了，遍历刷新isWalk，边上的不刷新
  遍历3遍，中间有动画遍历

  二维数组： 移动时根据下标找到前面的，不用遍历，
            合并时返回被撞到的block的id，然后继续走，block推入新对象，遍历新对象，执行合并动画，
            合并动画执行完，删除两个block，怎么删，有之前的下标就能删，this.from保存新坐标，每次获取返回然后计算新的覆盖掉
            然后绘制新的在block的位置，this.from:o（n）。

            移动合并更新完了，遍历刷新isWalk，边上的不刷新
  遍历2遍，中间有小遍历this.from，动画遍历

  [
    [b1,b2,b3,b4],
    [b5,b6,b7,b8]
  ]
  null
  this.check ==> [0,3]
  arr[0,3] = this
  修改状态

  找、修改状态、删 */
  /*
   * 用div，里面渲染数字
   *
   *
   *
   * 移动--合并--block放大10--两个都消失
   * 一个数组收集所有的block
   * 处理merge信息,返回一个object？
   * 合并特效
   * 一个数组存储要删除的block
   * 放入前遍历剩下的block，重置方法和isWalk
   * 生成数字 新数字推入数组
   * 调用渲染
   */
}
