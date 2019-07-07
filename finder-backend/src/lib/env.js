const path = require('path')

module.exports = {
  config() {
    if (process.env.NODE_ENV === 'production') {
      require('dotenv').config()
    } else {
      require('dotenv').config({
        path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`)
      })
    }
  }
}
