const test = require('ava')
const fixed = require('../../src/types/fixed')

test('Type: fixed', (t) => {
  t.true(fixed.isType('fixed'), 'Fixed should default to 256x80')
  t.true(fixed.isType('fixed8x11'))
  t.true(fixed.isType('fixed248x35'))
  t.false(fixed.isType('fixed256x89'), 'Maximum length of N should be 80')
  t.false(fixed.isType('fixed266x33'), 'Maximum length of M should be 80')
  t.false(fixed.isType('fixed129x33'), 'M should be divisible by 8')
})
