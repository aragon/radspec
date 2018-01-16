const test = require('ava')
const bytes = require('../../src/types/bytes')

test('Type: bytes', (t) => {
  t.true(bytes.isType('byte'), 'Byte should be an alias for bytes1')
  t.true(bytes.isType('bytes32'))
  t.false(bytes.isType('bytes64'), 'Maximum length of bytes should be 32')
})
