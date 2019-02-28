import test from 'ava';
import fixed from '../../src/types/fixed';

test('Type: fixed', t => {
  t.true(fixed.isType('fixed8x11'));
  t.true(fixed.isType('fixed248x35'));
  t.true(fixed.isType('fixed'));
  t.false(fixed.isType('asdafixed'), 'Should start with fixed');
  t.false(fixed.isType('fixedAxB'), 'M and N should be numerical');
  t.false(fixed.isType('fixed256x'), 'N should be provided');
  t.false(fixed.isType('fixedx80'), 'N should be provided');
  t.false(fixed.isType('fixed256x89'), 'Maximum length of N should be 80');
  t.false(fixed.isType('fixed256x-1'), 'Minimum length of N should be 0');
  t.false(fixed.isType('fixed266x33'), 'Maximum length of M should be 256');
  t.false(fixed.isType('fixed7x33'), 'Minimum length of M should be 8');
  t.false(fixed.isType('fixed129x33'), 'M should be divisible by 8');
});
