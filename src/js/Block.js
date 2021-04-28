export default initBlock()

function initBlock() {
  let id = 0
  return class Block {
    constructor(row, col, val, color, ctx, references, blockMap, isWalk) {
      // 根据references和
      this.x = references[row]
      this.y = references[col]
      this.val = val
      this.color = color
      this.ctx = ctx
      this.references = references // [70, 200, 330, 460, 130, 60]
      this.blockMap = blockMap
      this.isWalk = isWalk // 合并完：3, 走完：2， 未开始：0，开始：1，堵住：0.5
      this.id = id++
      this.method = []
      this.from = { row, col }
      this.beFollowed = null
      this.follow = null
      this.merging = false
    }

    clear(x, y, half) {
      half = half ? half : this.references[5]
      x = x ? x : Math.floor(this.x) // 处理0.5问题
      y = y ? y : Math.floor(this.y) // 处理0.5问题
      const { ctx } = this
      ctx.clearRect(x - half, y - half, half * 2 + 1, half * 2 + 1) // 处理0.5问题
    }

    render(x, y, half) {
      half = half ? half : this.references[5]
      x = x ? x : this.x
      y = y ? y : this.y
      const { ctx, val, color } = this
      ctx.fillStyle = color
      // background
      ctx.fillRect(x - half, y - half, half * 2, half * 2)
      ctx.fillStyle = '#000'
      // number
      ctx.fillText(val, x, y)
    }

    move(direction, step) {
      // 读缓存 减少dir的生成
      const method = this.method || []
      if (method[0] === direction) return method[1]

      const self = this
      const dir = {
        up: initWalk.bind(self, 'y', step, '1'),
        down: initWalk.bind(self, 'y', -step, '0'),
        left: initWalk.bind(self, 'x', step, '1'),
        right: initWalk.bind(self, 'x', -step, '0')
      }

      this.isWalk = 1
      // 缓存
      const finalFn = dir[direction]()
      this.method = [direction, finalFn]
      return finalFn

      // references = [70, 200, 330, 460, 130, 60]
      // status 0： 比较负数，后， 1： 比较正数，前
      // 判断同一行，方向前面
      function initWalk(dir, step, status) {
        const spacing = this.references[4] // 130

        let rule, trial, dynamicType, staticType

        if (status === '1') {
          rule = spacing
          trial = 1
        } else {
          rule = -spacing
          trial = -1
        }

        if (dir === 'x') {
          dynamicType = 'row'
          staticType = 'col'
        } else {
          dynamicType = 'col'
          staticType = 'row'
        }

        let i = this.from[dynamicType]
        const k = this.from[staticType]

        // 水平：row-- ++ 垂直：col-- ++
        // 确认前面的方块
        let block
        let temporary = i - trial // 前面方块的坐标
        const blockMap = this.blockMap

        while (temporary >= 0 && temporary <= 3) {
          i = temporary
          block = dynamicType === 'row' ? blockMap[i][k] : blockMap[k][i]

          if (block) {
            // 添加相互绑定
            block.beFollowed = this
            this.follow = block
            break
          }

          temporary = i - trial // 前面方块的坐标
        }

        const self = this
        const border = status === '1' ? self.references[0] : self.references[3]

        return function () {
          const block = self.follow
          const behind = self.beFollowed
          const isMerge = self.merging

          // debugger
          // 到边上了的情况
          const a = self.from
          if (self[dir] === border) {
            const report = self.createReport(isMerge)
            self.stop()
            return report
          }

          //前面没东西
          if (!block) {
            self[dir] -= step
            return false
          }

          const spacing = self[dir] - block[dir]
          // 距离等130就是撞到了 进入合并停止判断
          // 紧挨着的情况
          if (spacing === rule) {
            // 原地等待
            // 由于异步合并动画，清空重写map时间冲突
            if (block.isWalk < 1 || block.merging) {
              // 0和0.5 都得等
              self.isWalk = 0.5
              return false
            }
            
            // 防止多次合并  2222 --> 0044
            // 动画执行快慢的问题，新数字上merging是false
            // 刷新前merging生效，刷新后iswalk生效
            if (block.isWalk === 3) {
              const report = self.createReport(isMerge)
              self.stop()
              return report
            }

            // 前面的停了，撞上要判断合并
            const selfVal = self.val
            const otherVal = block.val
            // 不合并就停下
            if (selfVal !== otherVal) {
              const report = self.createReport(isMerge)
              self.stop()
              return report
            }

            // 可能要合并，但前面还没启动，等待前面启动了看看是不是真的合并
            // if (!block.isWalk) {
            //   // 因为遍历移动的顺序造成异步启动，可能在后面的反而先跑，
            //   // 所以对前面是否要停下来的判断会推迟一轮，
            //   // 同时让他和前面的方块错开一轮
            //   // 先3后1：-1-3 --> -1-3 --> 1--3 --> 1-3-
            //   // 前面的还没动，原地等待
            //   self[dir] += step
            //   return false
            // }
            // 前面的启动了，而且不是合并中
            // if (block.isWalk === 2 && !block.merging) {
              const computedVal = selfVal + otherVal

              // merge
              // console.log('merge', selfVal + otherVal, 'self.kill', 'block.merge')
              // 继续跑到block重叠
              // 合并中的状态，让后面的稍稍
              //避免后面来的太快，连环合并，然后合并动画异步的问题。
              self.merging = true
              self[dir] = block[dir]
              // self.val = computedVal
              // 报信息
              const report = self.createReport(self.merging, computedVal)
              // 返回一个对象
              self.stop()
              return report
            // }
          }

          // 前面有东西，但能移动
          self.isWalk >= 0.5 && (self[dir] -= step)
        }
      }
    }

    updateStartPoint() {
      let {
        x,
        y,
        references,
        from: { row, col }
      } = this
      this.blockMap[row][col] = null
      x = references.indexOf(x)
      y = references.indexOf(y)
      this.blockMap[x][y] = this
      return (this.from = { row: x, col: y })
    }

    stop() {
      this.isWalk = 2
      this.method = null
      // console.log(this.follow)
      if (this.follow) {
        // 通知前面
        this.follow.beFollowed = null
        this.follow = null
      }
    }

    createReport(isMerge, val) {
      return {
        self: this,
        selfFrom: this.from,
        finalLocation: this.updateStartPoint(),
        isMerge,
        val
      }
    }
  }
}
