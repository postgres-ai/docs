const path = require('path')

module.exports = function () {
  return {
    name: 'plugin-route-change',

    getClientModules() {
      return [path.resolve(__dirname, './analytics')]
    },
  }
}
