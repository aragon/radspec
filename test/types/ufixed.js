const test = require('ava')
const fixed = require('../../src/types/ufixed')

test('Type: ufixed', (t) => {
  t.true(fixed.isType('ufixed'), 'Ufixed should default to 256x80')
  t.true(fixed.isType('ufixed8x11'))
  t.true(fixed.isType('ufixed248x35'))
  t.false(fixed.isType('ufixed256x89'), 'Maximum length of N should be 80')
  t.false(fixed.isType('ufixed266x33'), 'Maximum length of M should be 80')
  t.false(fixed.isType('ufixed129x33'), 'M should be divisible by 8')
})
