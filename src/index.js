import './css/index.less'
import initStage from './js/stage.js'
import collectLocation from './js/collectLocation'
// import createNumber from './js/createNumber'
import Block from './js/Block'

initStage()
const map = collectLocation()
// new Rcorder()
const all = {}
// const block1 = new Block(3, 1, 2, ctx, map, all)
// const block2 = new Block(2, 0, 4, ctx, map, all)
const block3 = new Block(1, 3, 8, ctx, map, all)
// const block4 = new Block(3, 2, 64, ctx, map, all)
// const block5 = new Block(1, 1, 64, ctx, map, all)
const block6 = new Block(2, 3, 8, ctx, map, all)

// all['0'] = block1
// all['1'] = block2
all['2'] = block3
// all['3'] = block4
// all['4'] = block5
all['5'] = block6

// console.log(map, block1, all)
// all[0].render()
// all[1].render()
all[2].render()
// all[3].render()
// all[4].render()
all[5].render()
// block1.move('left')
//   block2.move('left')
// Object.keys(all).forEach(id => {
//   all[id].isWalk = true
// })
document.getElementById('btn').onclick = name
function name () {
  const timer = setInterval(() => {
    // console.log('walk')
    // 移动
    // const a = all[0].move('left', 10)()
    // const b = all[1].move('left', 10)()
    const c = all[2].move('left', 10)()
    // const d = all[3].move('left', 10)()
    // const e = all[4].move('left', 10)()
    const f = all[5].move('left', 10)()
    // console.log(a)
    // 清屏
    ctx.clearRect(0, 0, 510, 510)
    // 重绘
    // all[0].render()
    // all[1].render()
    all[2].render()
    // all[3].render()
    // all[4].render()
    all[5].render()
    // !a && !b && !c && !d && !e && !f && clearInterval(timer)
    !c&& !f && clearInterval(timer)
  }, 18)
}

// ctx.fillRect(30,30,100,50)