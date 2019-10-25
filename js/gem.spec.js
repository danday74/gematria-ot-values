const chai = require('chai')
const expect = chai.expect
const gem = require('./gem')

let actual, expected

describe('gem', () => {

  it('errors', () => {
    // Invalid ref - Gen 3:25 does not exist
    actual = gem('Gen 3:24-25', 'ol')
    expect(actual).to.equal(null)

    // Invalid code
    actual = gem('Gen 1:1-2', 'sk')
    expect(actual).to.equal(null)

    // No gematria values
    actual = gem('Dan 4:1-3', 'ol')
    expect(actual).to.equal(null)
  })

  it('word count', () => {
    actual = gem('Gen 1:1-2', 'wc')
    expected = [7, 14]
    expect(actual).to.eql(expected)
  })

  it('letter count', () => {
    actual = gem('Gen 1:1-2', 'lc')
    expected = [28, 52]
    expect(actual).to.eql(expected)
  })

  describe('words', () => {
    it('standard', () => {
      actual = gem('Gen 1:1', 'sw')
      expected = [913, 203, 86, 401, 395, 407, 296]
      expect(actual).to.eql(expected)
      actual = gem('Gen 1:1', 'ws')
      expect(actual).to.eql(expected)
    })

    it('ordinal', () => {
      actual = gem('Gen 2:11-12', 'ow')
      expected = [34, 18, 68, 12, 24, 23, 23, 39, 46, 42, 34, 19, 20, 44, 17, 17, 34, 31, 23, 44]
      expect(actual).to.eql(expected)
      actual = gem('Gen 2:11-12', 'wo')
      expect(actual).to.eql(expected)
    })
  })

  describe('letters', () => {
    it('standard', () => {
      actual = gem('Gen 3:23-24', 'sl')
      expected = [6, 10, 300, 30, 8, 5, 6, 10, 5, 6, 5, 1, 30, 5, 10, 40, 40, 3, 50, 70, 4, 50, 30, 70, 2, 4, 1, 400, 5, 1, 4, 40, 5, 1, 300, 200, 30, 100, 8, 40, 300, 40, 6, 10, 3, 200, 300, 1, 400, 5, 1, 4, 40, 6, 10, 300, 20, 50, 40, 100, 4, 40, 30, 3, 50, 70, 4, 50, 1, 400, 5, 20, 200, 2, 10, 40, 6, 1, 400, 30, 5, 9, 5, 8, 200, 2, 5, 40, 400, 5, 80, 20, 400, 30, 300, 40, 200, 1, 400, 4, 200, 20, 70, 90, 5, 8, 10, 10, 40]
      expect(actual).to.eql(expected)
      actual = gem('Gen 3:23-24', 'ls')
      expect(actual).to.eql(expected)
    })

    it('ordinal', () => {
      actual = gem('Gen 3:23-24', 'ol')
      expected = [6, 10, 21, 12, 8, 5, 6, 10, 5, 6, 5, 1, 12, 5, 10, 13, 13, 3, 14, 16, 4, 14, 12, 16, 2, 4, 1, 22, 5, 1, 4, 13, 5, 1, 21, 20, 12, 19, 8, 13, 21, 13, 6, 10, 3, 20, 21, 1, 22, 5, 1, 4, 13, 6, 10, 21, 11, 14, 13, 19, 4, 13, 12, 3, 14, 16, 4, 14, 1, 22, 5, 11, 20, 2, 10, 13, 6, 1, 22, 12, 5, 9, 5, 8, 20, 2, 5, 13, 22, 5, 17, 11, 22, 12, 21, 13, 20, 1, 22, 4, 20, 11, 16, 18, 5, 8, 10, 10, 13]
      expect(actual).to.eql(expected)
      actual = gem('Gen 3:23-24', 'lo')
      expect(actual).to.eql(expected)
    })
  })

  describe('verse totals', () => {
    it('standard', () => {
      actual = gem('Gen 1:1-2', 'sv')
      expected = [2701, 3546]
      expect(actual).to.eql(expected)
      actual = gem('Gen 1:1-2', 'vs')
      expect(actual).to.eql(expected)
    })

    it('ordinal', () => {
      actual = gem('Gen 1', 'ov')
      expected = [298, 576, 201, 381, 485, 445, 761, 446, 530, 490, 809, 735, 244, 774, 406, 834, 378, 444, 228, 720, 965, 522, 232, 597, 678, 849, 458, 885, 983, 796, 500]
      expect(actual).to.eql(expected)
      actual = gem('Gen 1', 'vo')
      expect(actual).to.eql(expected)
    })
  })

  describe('force (allow bad checksums)', () => {

    // Gen 46 has a failed checksum

    it('failed not forced', () => {
      actual = gem('Gen 46:1', 'wc')
      expect(actual).to.eql(null)
    })

    it('failed forced', () => {
      actual = gem('Gen 46:1', 'wc', true)
      expected = [13]
      expect(actual).to.eql(expected)
    })

    // Gen 32 has a broken checksum

    it('broken not forced', () => {
      actual = gem('Gen 32:1', 'wc')
      expect(actual).to.eql(null)
    })

    it('broken forced', () => {
      actual = gem('Gen 32:1', 'wc', true)
      expect(actual).to.eql(null)
    })
  })
})
