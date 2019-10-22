// Generate a summary file

const assert = require('assert')
const fs = require('fs')
const stringify = require('json-stringify-pretty-compact')
const stringUtils = require('./utils/string-utils')
const genLookup = require('./gen-lookup')
const ordinals = require('./data/ordinals')
const standards = require('./data/standards')
const {sum} = require('lodash')

const getOrdinalValueForChar = char => {
  const value = ordinals[char]
  if (!value) throw Error('oops ' + char)
  return value
}

const getStandardValueForChar = char => {
  const value = standards[char]
  if (!value) throw Error('doh ' + char)
  return value
}

const getValueForLetters = (text, standard) => {
  const getValueForChar = standard ? getStandardValueForChar : getOrdinalValueForChar
  return text.replace(/ /g, '').split('').map(char => getValueForChar(char))
}

const getValueForWords = (text, standard) => {
  return text.split(' ').map(word => {
    return sum(getValueForLetters(word, standard))
  })
}

const getContent = filepath => {
  let content = fs.readFileSync(filepath, 'utf8')
  content = content.replace(/(\r\n|\n|\r)/gm, ' ')
  content = content.replace(RegExp(String.fromCharCode(8207), 'g'), 'X')
  content = content.replace(/\s+/g, ' ')
  return content.trim()
}

const getLines = content => {
  let lines = content.split('X')
  lines.shift()
  return lines
}

const getSummaryLines = (lines, book) => {
  return lines.map((line, i) => {
    const cv = line.match(/[0-9]+:[0-9]+/)[0]
    const parts = cv.split(':')
    const chapter = parseInt(parts[0])
    const verse = parseInt(parts[1])
    const text = line.replace(cv, '').trim()
    return {ref: {book, chapter, verse, verseCount: i + 1}, text}
  })
}

const getVerses = summaryLines => {
  return summaryLines.map(line => {
    line.count = {}
    line.count.words = line.text.split(' ').length
    line.count.letters = line.text.replace(/ /g, '').length
    line.value = {
      ordinal: {},
      standard: {}
    }

    const ordinalLetters = getValueForLetters(line.text, false)
    const ordinalWords = getValueForWords(line.text, false)
    line.value.ordinal.words = ordinalWords
    line.value.ordinal.letters = ordinalLetters
    line.value.ordinal.total = sum(ordinalWords)
    assert.strictEqual(sum(ordinalLetters), sum(ordinalWords))

    const standardLetters = getValueForLetters(line.text, true)
    const standardWords = getValueForWords(line.text, true)
    line.value.standard.words = standardWords
    line.value.standard.letters = standardLetters
    line.value.standard.total = sum(standardWords)
    assert.strictEqual(sum(standardLetters), sum(standardWords))

    return line
  })
}

const getChapters = (allVerses, book) => {
  const chapters = []
  let count = 0
  let verses
  do {
    count++
    verses = allVerses.filter(line => line.ref.chapter === count)
    if (verses.length) {
      chapters.push({
        ref: {
          book,
          chapter: count,
          chapterCount: count
        },
        count: {
          verses: verses.length,
          words: sum(verses.map(verse => verse.count.words)),
          letters: sum(verses.map(verse => verse.count.letters))
        },
        value: {
          ordinal: {total: sum(verses.map(verse => verse.value.ordinal.total))},
          standard: {total: sum(verses.map(verse => verse.value.standard.total))}
        },
        verses
      })
    }
  } while (verses.length)
  return chapters
}

const getBook = (chapters, book) => {
  return {
    ref: {
      book,
      bookCount: 1
    },
    count: {
      chapters: chapters.length,
      verses: sum(chapters.map(chapter => chapter.count.verses)),
      words: sum(chapters.map(chapter => chapter.count.words)),
      letters: sum(chapters.map(chapter => chapter.count.letters))
    },
    value: {
      ordinal: {total: sum(chapters.map(chapter => chapter.value.ordinal.total))},
      standard: {total: sum(chapters.map(chapter => chapter.value.standard.total))}
    },
    chapters: chapters
  }
}

const writeBookToFile = (book, filename) => {
  const fullFilename = filename + '-summary.json'
  const filepath = __dirname + '/data/' + filename + '/' + fullFilename
  fs.writeFileSync(filepath, stringify(book, {indent: 2, maxLength: 500}), 'utf8')
  console.log('wrote to file', fullFilename)
}

const args = process.argv.splice(2)
if (args.length) {
  const num = stringUtils.toInteger(args[0])
  if (num) {
    const lookup = genLookup[num]
    if (lookup) {
      const filename = num.toString().padStart(2, '0') + '-' + lookup
      const bookName = stringUtils.capitalize(lookup)
      const filepath = __dirname + '/data/' + filename + '/' + filename + '.md'
      const content = getContent(filepath)
      const lines = getLines(content)
      const summaryLines = getSummaryLines(lines, bookName)
      const allVerses = getVerses(summaryLines)
      const chapters = getChapters(allVerses, bookName)
      const book = getBook(chapters, bookName)
      writeBookToFile(book, filename)
    }
  }
}
