const path = require("path");

module.exports = {
  css: {
    extract: false,
  },
  configureWebpack: {
    optimization: {
      splitChunks: false
    },
  },
  publicPath: '/', // Because we have custom domain name
  outputDir: path.resolve(__dirname, "docs"),
  transpileDependencies: [
    'vuetify'
  ]
}
