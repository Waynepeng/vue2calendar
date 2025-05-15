// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })
// module.exports = {
//   publicPath: process.env.NODE_ENV === 'production'
//     ? '/calendar/'  // 例如：'/my-vue2-project/'
//     : '/'
// }

const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // 部署路径配置
  publicPath: process.env.NODE_ENV === 'production'
    ? '/'  // 如果项目部署在根目录，就用 '/'
    : '/',
  
  // 静态资源输出配置
  assetsDir: '',  // 将静态资源输出到根目录
  
  // 自定义 Webpack 配置
  chainWebpack: config => {
    // 修改 JS 和 CSS 的输出路径
    config.output.filename('[name].[contenthash].js');
    config.output.chunkFilename('[name].[contenthash].js');
    
    config.plugin('extract-css').tap(() => [{
      filename: '[name].[contenthash].css',
      chunkFilename: '[name].[contenthash].css'
    }]);
  }
})