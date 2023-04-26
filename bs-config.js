const { domain } = require('./config/env')
module.exports = {
    proxy: {
      target: domain,
      ws: true
    },
    port: 5050,
    files: ['public/**/*', 'views/**/*'],
    open: false,
    watchOptions: {
      ignoreInitial: true,
      ignored: ["node_modules"]
    }
  };