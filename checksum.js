const stringUtils = require('./utils/string-utils')
const genLookup = require('./gen-lookup')
const colors = require('colors/safe')
const fs = require('fs')
const stringify = require('json-stringify-pretty-compact')

const getError = (actual, expected, category) => {
  const diff = Math.abs(actual - expected)
  return colors.yellow(`${category} - actual ${actual} expected ${expected} (diff ${diff})`)
}

// Genesis 4:13 last word = error

const args = process.argv.splice(2)
if (args.length) {
  const num = stringUtils.toInteger(args[0])
  if (num) {
    const lookup = genLookup[num]
    if (lookup) {
      const filename = num.toString().padStart(2, '0') + '-' + lookup
      const filepath = __dirname + '/data/' + filename + '/' + filename
      const checksum = require(filepath + '-checksum.json')
      const summary = require(filepath + '-summary.json')
      let passedCount = 0
      let failedCount = 0
      checksum.forEach((sum, i) => {
        const errors = []

        const actualLetters = summary.chapters[i].count.letters
        const expectedLetters = sum.letters
        if (actualLetters !== expectedLetters) {
          const error = getError(actualLetters, expectedLetters, 'Letters')
          errors.push(error)
        }

        const actualWords = summary.chapters[i].count.words
        const expectedWords = sum.words
        if (actualWords !== expectedWords) {
          const error = getError(actualWords, expectedWords, 'Words')
          errors.push(error)
        }

        const actualStandard = summary.chapters[i].value.standard.total
        const expectedStandard = sum.standard
        if (actualStandard !== expectedStandard) {
          const error = getError(actualStandard, expectedStandard, 'Standard')
          errors.push(error)
        }

        if (!errors.length) {
          passedCount++
          summary.chapters[i].checksum = true
          console.log(colors.green(`${sum.ref.book} ${sum.ref.chapter}`))
        } else {
          failedCount++
          summary.chapters[i].checksum = false
          console.log(colors.red(`${sum.ref.book} ${sum.ref.chapter}`))
          errors.forEach(error => {
            console.log(error)
          })
        }
      })

      console.log(`PASSED ${passedCount} FAILED ${failedCount}`)
      fs.writeFileSync(filepath + '-summary.json', stringify(summary, {indent: 2, maxLength: 500}), 'utf8')
    }
  }
}
