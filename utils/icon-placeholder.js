// utils/icon-placeholder.js
// 临时图标占位符工具

// 生成临时图标路径
function getIconPath(iconName) {
  // 如果图标不存在，返回默认占位符
  return `/images/${iconName}.png`
}

// 检查图标是否存在
function checkIconExists(iconName) {
  return new Promise((resolve) => {
    wx.getImageInfo({
      src: getIconPath(iconName),
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

// 获取安全的图标路径
function getSafeIconPath(iconName, fallbackText = '') {
  return new Promise((resolve) => {
    checkIconExists(iconName).then(exists => {
      if (exists) {
        resolve(getIconPath(iconName))
      } else {
        // 返回文字占位符
        resolve(fallbackText || iconName)
      }
    })
  })
}

module.exports = {
  getIconPath,
  checkIconExists,
  getSafeIconPath
}
