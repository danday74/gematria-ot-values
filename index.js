const gem = require('./js/gem')

const main = (ref, code, force = false) => {
  return gem(ref, code, force)
}

module.exports = main
