export default function initStage () {
  const canvas = document.getElementById('stage')
  const ctx = canvas.getContext('2d')
  
  // 设置字体大小
  ctx.font = "50px serif"
  // 水平居中
  ctx.textAlign = 'center',
  // 垂直居中
  ctx.textBaseline = 'middle'
  // ctx.fillText('1', 60, 60)
  window.ctx = ctx
}