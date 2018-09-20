const formatDate = require('./formatDate')
const echo = require('./echo')

module.exports = {
  helpers: {
    formatDate,
    echo,
  },

  exists (helper) {
    return !!this.helpers[helper]
  },

  execute (helper, inputs) {
    return this.helpers[helper](...inputs)
  }
}