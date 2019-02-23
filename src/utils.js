const path = require('path')

const officialTagList = [
  'view', 'scroll-view', 'swiper', 'movable-view', 'cover-view', 'cover-view',
  'icon', 'text', 'rich-text', 'progress',
  'button', 'checkbox', 'form', 'input', 'label', 'picker', 'picker', 'picker-view', 'radio', 'slider', 'switch', 'textarea',
  'navigator', 'function-page-navigator',
  'audio', 'image', 'video', 'camera', 'live-player', 'live-pusher',
  'map',
  'canvas',
  'open-data', 'web-view', 'ad'
]

const compilerName = 'miniprogram-compiler' // 为了在 webpack 构建打包时不被分析出此依赖
let env = 'nodejs'
let fs = null
let compiler = null
let runJs = null // 执行 js

/**
 * 获取当前环境
 */
function getEnv() {
  return env
}

/**
 * 设置 nodejs 环境
 */
function setNodeJsEnv() {
  env = 'nodejs'
  fs = require('fs')
  compiler = require(compilerName)
  runJs = filePath => {
    // eslint-disable-next-line import/no-dynamic-require
    require(filePath)
    delete require.cache[require.resolve(filePath)]
  }
}

/**
 * 设置浏览器环境
 */
function setBrowserEnv() {
  env = 'browser'
  fs = {
    readFileSync(filePath) {
      const fileMap = window.__FILE_MAP__ || {}
      return fileMap[filePath] || null
    }
  }
  window.require = runJs = filePath => {
    const content = fs.readFileSync(filePath + '.js')
    if (content) {
      // eslint-disable-next-line no-new-func
      const func = new Function('require', 'module', content)
      const mod = {exports: {}} // modules

      func.call(null, relativePath => {
        const realPath = path.join(path.dirname(filePath), relativePath)
        return window.require(realPath)
      }, mod)

      return mod.exports
    }

    return null
  }
}

try {
  if (typeof global === 'object' && typeof process === 'object') {
    // nodejs
    setNodeJsEnv()
  } else {
    // 浏览器
    setBrowserEnv()
  }
} catch (err) {
  // 浏览器
  setBrowserEnv()
}

/**
 * 读取文件
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch (err) {
    return null
  }
}

/**
 * 读取 json
 */
function readJson(filePath) {
  try {
    const content = readFile(filePath)
    return JSON.parse(content)
  } catch (err) {
    return null
  }
}

/**
 * 转换 rpx 单位为 px 单位
 */
function transformRpx(style) {
  return style.replace(/(\d+)rpx/ig, '$1px')
}

/**
 * 获取 wxml、wxss 编译器
 */
function getCompiler() {
  return compiler
}

/**
 * 获取内置组件标签列表
 */
function getOfficialTagList() {
  return officialTagList
}

module.exports = {
  getEnv,
  setNodeJsEnv,
  setBrowserEnv,
  runJs,
  readFile,
  readJson,
  transformRpx,
  getCompiler,
  getOfficialTagList,
}
