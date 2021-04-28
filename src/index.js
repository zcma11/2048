import './css/index.less'
import initStage from './js/stage.js'
import Factory from './js/Factory'

initStage()
const factory = new Factory
factory.mount()
factory.initMap()

document.getElementById('btn').onclick = name
function name () {
  factory.create(256)
}

// ctx.fillRect(30,30,100,50)