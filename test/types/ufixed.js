import test from 'ava';
import ufixed from '../../src/types/ufixed';

test('Type: ufixed', t => {
  t.true(ufixed.isType('ufixed8x11'));
  t.true(ufixed.isType('ufixed248x35'));
  t.true(ufixed.isType('ufixed'));
  t.false(ufixed.isType('asdaufixed'), 'Should start with ufixed');
  t.false(ufixed.isType('fixed'), 'Should start with ufixed');
  t.false(ufixed.isType('ufixed256x'), 'N should be provided');
  t.false(ufixed.isType('ufixedx80'), 'M should be provided');
  t.false(ufixed.isType('ufixedAxB'), 'M and N should be numerical');
  t.false(ufixed.isType('ufixed256x89'), 'Maximum length of N should be 80');
  t.false(ufixed.isType('ufixed256x-1'), 'Minimum length of N should be 0');
  t.false(ufixed.isType('ufixed266x33'), 'Maximum length of M should be 256');
  t.false(ufixed.isType('ufixed7x33'), 'Minimum length of M should be 8');
  t.false(ufixed.isType('ufixed129x33'), 'M should be divisible by 8');
});
