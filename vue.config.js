const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})



module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/calendar/'  // 例如：'/my-vue2-project/'
    : '/'
}