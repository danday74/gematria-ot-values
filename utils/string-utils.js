const capitalize = str => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const toInteger = str => {
  try {
    return parseInt(str)
  } catch (e) {
    return null
  }
}

module.exports = {
  capitalize,
  toInteger
}
