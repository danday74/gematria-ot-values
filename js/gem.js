const chapterAndVerse = require('chapter-and-verse')
const books = require('../data/books')
const {flatten, range} = require('lodash')

const codes = {
  'sl': {system: 'standard', type: 'letters'},
  'ls': {system: 'standard', type: 'letters'},

  'sw': {system: 'standard', type: 'words'},
  'ws': {system: 'standard', type: 'words'},

  'sv': {system: 'standard', type: 'total'}, // verse
  'vs': {system: 'standard', type: 'total'}, // verse

  'ol': {system: 'ordinal', type: 'letters'},
  'lo': {system: 'ordinal', type: 'letters'},

  'ow': {system: 'ordinal', type: 'words'},
  'wo': {system: 'ordinal', type: 'words'},

  'ov': {system: 'ordinal', type: 'total'}, // verse
  'vo': {system: 'ordinal', type: 'total'}, // verse

  'wc': {system: null, type: 'words'}, // word count
  'lc': {system: null, type: 'letters'} // letter count
}

const gem = (ref, code, force = false) => {
  const gems = []
  code = codes[code]
  if (!code) return null
  const cv = chapterAndVerse(ref)
  if (!cv.success) return null
  const book = books[cv.book.name]
  if (!book) return null
  const chapter = book.chapters[cv.chapter - 1]
  if (!force && !chapter.checksum) return null
  const from = cv.from || 1
  const to = cv.to || cv.book.versesPerChapter[cv.chapter - 1]
  const indices = range(from, to + 1)
  indices.forEach(i => {
    const value = code.system ? chapter.verses[i - 1].value[code.system][code.type] : chapter.verses[i - 1].count[code.type]
    gems.push(value)
  })
  return flatten(gems)
}

module.exports = gem
