export default function collectLocation() {
  let auchorPoints
  const allStyle = document.styleSheets
  Object.keys(allStyle).forEach(key => {
    auchorPoints = findLineStyle(allStyle[key].cssRules)
    if (auchorPoints) return
  })

  if (!auchorPoints) throw Error('解析坐标失败')
  return auchorPoints
}

function findLineStyle(cssRules) {
  const lineReg = /\.line-[1-6]\s\{\sleft:\s(.*?)px;\stop:\s(.*?)px;\swidth:\s(.*?)px;\sheight:\s(.*?)px;/
  const anchorArr = []

  for (const key in cssRules) {
    const cssText = cssRules[key].cssText
    const result = lineReg.exec(cssText)

    // 取前三个line的left top width height
    result && anchorArr.push(result)

    if (anchorArr.length === 3) break
  }

  // 检查数据不正确
  if (anchorArr.length === 0) {
    return false
  }

  return parseLocation(anchorArr)
}

function parseLocation(anchorArr) {
  // 含有left top width height数组 的数组
  const anchor = anchorArr[0]
  // 第一个数组的left 和 格子宽度一样
  const cellWidth = anchor[1]
  // 文字居中后移的偏移量
  const half = cellWidth / 2
  // canvas的left top偏移的距离
  const lineWidth = +anchor[3]
  // 坐标的映射 对称
  const anchorPoints = [half + lineWidth]

  for (let i = 0; i < 3; i++) {
    const [, a] = anchorArr[i]
    const anchorPoint = +a + lineWidth * 2

    anchorPoints.push(anchorPoint + half)
  }

  anchorPoints.push(+cellWidth + lineWidth, half)
  return anchorPoints
}
