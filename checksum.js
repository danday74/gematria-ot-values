const stringUtils = require('./utils/string-utils')
const genLookup = require('./gen-lookup')
const colors = require('colors/safe')
const assert = require('assert')
const fs = require('fs')
const stringify = require('json-stringify-pretty-compact')
const chapterAndVerse = require('chapter-and-verse')

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
      let brokenCount = 0

      const cv = chapterAndVerse(lookup)
      const chapterCount = cv.book.versesPerChapter.length
      assert.strictEqual(chapterCount, checksum.length)
      assert.strictEqual(chapterCount, summary.chapters.length)

      checksum.forEach((sum, i) => {
        const errors = []
        let versesFailure = false

        const chapter = summary.chapters[i]
        const ref = chapter.ref.book + ' ' + chapter.ref.chapter

        const actualLetters = chapter.count.letters
        const expectedLetters = sum.letters
        if (actualLetters !== expectedLetters) {
          const error = getError(actualLetters, expectedLetters, 'Letters')
          errors.push(error)
        }

        const actualWords = chapter.count.words
        const expectedWords = sum.words
        if (actualWords !== expectedWords) {
          const error = getError(actualWords, expectedWords, 'Words')
          errors.push(error)
        }

        const actualVerses = chapter.verses.length
        const expectedVerses = cv.book.versesPerChapter[i]
        if (actualVerses !== expectedVerses) {
          versesFailure = true
          const error = getError(actualVerses, expectedVerses, 'Verses')
          errors.push(error)
        }

        const actualStandard = chapter.value.standard.total
        const expectedStandard = sum.standard
        if (actualStandard !== expectedStandard) {
          const error = getError(actualStandard, expectedStandard, 'Standard')
          errors.push(error)
        }

        if (!errors.length) {
          passedCount++
          chapter.checksum = 'passed'
          console.log(colors.green(ref))
        } else {
          if (versesFailure) {
            brokenCount++
            chapter.checksum = 'broken'
          } else {
            failedCount++
            chapter.checksum = 'failed'
          }
          console.log(colors.red(ref))
          errors.forEach(error => {
            console.log(error)
          })
        }
      })

      console.log(`PASSED ${passedCount} FAILED ${failedCount} BROKEN ${brokenCount}`)
      fs.writeFileSync(filepath + '-summary.json', stringify(summary, {indent: 2, maxLength: 500}), 'utf8')
    }
  }
}
