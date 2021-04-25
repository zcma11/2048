export default initBlock()

function initBlock () {
  let id = 0
  return class Block {
    constructor(row, col, val, ctx, map, allBlocks) {
      // 根据map和
      this.x = map[row]
      this.y = map[col]
      this.val = val
      this.ctx = ctx
      this.map = map
      this.allBlocks = allBlocks
      this.isWalk = true
      this.id = id++
      this.method = []
      this.from = { row, col }
    }

    render () {
      // console.log(this.ctx)
      const { ctx, val, x, y, map: [, , , , , half] } = this
      ctx.fillStyle = '#efe4dc'
      ctx.fillRect(x - half, y - half, half * 2, half * 2)
      ctx.fillStyle = '#000'
      ctx.fillText(val, x, y)
    }

    move (direction, step) {
      // 读缓存 减少dir的生成
      const method = this.method
      if (method[0] === direction) return method[1]

      const self = this
      const dir = {
        up: initWalk(self, 'y', step, '1'),
        down: initWalk(self, 'y', -step, '0'),
        left: initWalk(self, 'x', step, '1'),
        right: initWalk(self, 'x', -step, '0')
      }

      this.isWalk = true
      // 缓存
      this.method = [direction, dir[direction]]
      return dir[direction]

      // map = [60, 190, 320, 450, 130, 60]
      // status 0： 比较负数，后， 1： 比较正数，前
      // 判断同一行，方向前面
      function initWalk (self, dir, step, status) {
        const spacing = self.map[4] // 130
        const stateMap = {
          1: [spacing, new Function('a', 'b', 'return a >= b')],
          0: [-spacing, new Function('a', 'b', 'return a <= b')],
          x: 'y',
          y: 'x'
        }
        // 0 - self和前面的距离-130或-140  < -130
        // 1 + self和前面的距离130或140    > 130

        const [rule, compare] = stateMap[status]
        const queue = stateMap[dir]

        // 确认前面的方块
        const allBlocks = self.allBlocks
        const block = Object.keys(allBlocks)
          .filter(id => { // 可能有一个
            const block = allBlocks[id]
            if (block === self) return false

            const spacing = self[dir] - block[dir]
            // 同一行 && 在前面的所有方块
            return self[queue] === block[queue] && compare(spacing, rule)
          })
          .reduce((result, currentId) => { // 前面什么都没有，前面有一个，前面有多个
            if (!result) return allBlocks[currentId]

            const currentBlock = allBlocks[currentId]
            const curOffest = currentBlock[dir]
            const rs = result[dir]
            // 找最近的
            return compare(rs, curOffest) ? result : currentBlock
          }, null)

        return function () {
          if (!self.isWalk) return false
          // debugger
          // 到边上了的情况
          if (self[dir] === self.map[0]) {
            // stop
            return self.isWalk = false
          }

          if (!block) {
            self[dir] -= step
            return self.isWalk
          }

          // 前面有东西
          const spacing = self[dir] - block[dir]
          // 距离等130就是撞到了 进入合并停止判断
          // 紧挨着的情况
          if (spacing === rule) {
            // 是否暂时相撞 不是就停下来
            if (!block.isWalk) {
              // 前面的停了，撞上要判断合并
              const selfVal = self.val
              const otherVal = block.val
              // 不合并就停下
              if (selfVal !== otherVal) {
                return self.isWalk = false
              }

              // merge
              console.log('merge', selfVal + otherVal, 'self.kill', 'block.merge')
              // 删自己
              // 报坐标
              // 返回一个对象
              return false
            }

            // 因为遍历移动的顺序造成异步启动，可能在后面的反而先跑，
            // 所以对前面是否要停下来的判断会推迟一轮，
            // 同时让他和前面的方块错开一轮
            // 先3后1：-1-3 --> -1-3 --> 1--3 --> 1-3-
            // 前面的还没动，原地等待
            self[dir] += step
          }

          // 移动
          const state = self.isWalk
          state && (self[dir] -= step)
          return state
        }
      }
    }

    getStartPoint () {
      return this.from
    }

    updateStartPoint () {
      let { x, y, map } = this
      x = map.indexOf(x)
      y = map.indexOf(y)
      this.from = { row: x, col: y }
    }
  }
}