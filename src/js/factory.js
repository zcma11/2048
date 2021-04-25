import Block from './js/block'

export default class CreateNumber {
  
  constructor () {
    this.blockMap = initMap()
    this.merge = []
    // this.
  }
  // random(0,3)
  create () {
    const x = Math.floor(Math.random() * 4)
    const y = Math.floor(Math.random() * 4)
  }

  assembly () {
    setTimeout(() => {
      // 实现了block的移动，接下来处理factory函数，
      // 用setimeout递归实现block自动刷新，空出返回值，返回要合并对象
    }, 0)
  }

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

class Recorder {
  
}

function initMap() {
  const map = []
  
  for (let i = 0; i < 4; i++) {
    map.push(new Array(4))
  }
  return map
}