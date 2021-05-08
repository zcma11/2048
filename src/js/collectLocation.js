export default function collectLocation() {
  let auchorPoints, rules
  const allStyle = document.styleSheets[0]

  rules = findLineStyle(allStyle.cssRules)
  auchorPoints = parseRules(rules)

  if (!auchorPoints) throw Error('解析坐标失败')
  return auchorPoints
}

function findLineStyle(cssRules) {
  const lineReg = /\.line-[1-3]\s\{\sleft:\s(.*?)px;\stop:\s(.*?)px;\swidth:\s(.*?)px;\sheight:\s(.*?)px;/
  let rules = { normal: [] }

  Object.keys(cssRules).forEach(key => {
    const cssRule = cssRules[key]
    if (cssRule.media) {
      // 递归找media里面的样式
      let result = findLineStyle(cssRule.cssRules)
      result && (rules.media = result)
    } else {
      const cssText = cssRule.cssText
      const result = lineReg.exec(cssText)

      // 取前三个line的left top width height
      result && rules.normal.push(result)
    }
  })

  return rules.normal.length !== 0 ? rules : null
}

function parseRules(rules) {
  const anchors = rules.normal // []
  const mediaAnchors = rules.media // {}
  let media

  if (mediaAnchors) {
    media = parseRules(mediaAnchors)
  }

  // 多个含有left top width height数组 的集合
  const anchor = anchors[0]
  // 第一个数组的left 和 格子宽度一样
  const cellWidth = anchor[1]
  // 方块起点到文字起点的偏移量
  const half = cellWidth / 2
  // 网格线的宽度
  const lineWidth = +anchor[3]
  // 文字坐标的映射
  const normal = [half + lineWidth]

  // 计算第2到第4个格子的起始坐标
  for (let i = 0; i < 3; i++) {
    const [, left] = anchors[i]
    const anchorPoint = +left + lineWidth * 2

    normal.push(anchorPoint + half)
  }

  // 方块文字起点之间的距离，文字与背景坐标差， 网格线宽度
  normal.push(+cellWidth + lineWidth, half, lineWidth)
  return media ? { media, normal } : normal
}
