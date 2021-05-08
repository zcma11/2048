export default class Block {
  constructor(x, y, val) {
    this.x = x
    this.y = y
    this.val = val
    this.merged = false
  }

  inBorder({ x, y }) {
    return x <= 3 && x >= 0 && y <= 3 && y >= 0
  }

  available({ x, y }) {
    return !this.map[x][y]
  }

  getBlock({ x, y }) {
    if (this.inBorder({ x, y })) {
      return this.map[x][y]
    } else {
      return null
    }
  }

  findEndPosition(guide) {
    // 确定最后的位置
    let front = { x: this.x, y: this.y }
    let end = null

    do {
      end = { x: front.x, y: front.y }
      front = { x: front.x + guide.x, y: front.y + guide.y }
    } while (this.inBorder(front) && this.available(front))

    return { end, front }
  }

  move(guide) {
    const { end, front } = this.findEndPosition(guide)
    const frontBlock = this.getBlock(front)
    const from = { x: this.x, y: this.y }
    const val = this.val
    let newVal
    // merge
    if (frontBlock && frontBlock.val === val && !frontBlock.merged) {
      this.merged = true
      end.x = frontBlock.x
      end.y = frontBlock.y
      newVal = this.val === 4096 ? 2 : this.val * 2
    }
    
    // 不用动
    if (this.x === end.x && this.y === end.y) return false

    this.remove()
    this.update(end, newVal)

    return {
      from,
      to: end,
      val,
      newVal
    }
  }

  remove() {
    this.map[this.x][this.y] = null
  }

  update({ x, y }, newVal) {
    if (newVal) this.val = newVal
    this.x = x
    this.y = y
    this.map[x][y] = this
  }
}
