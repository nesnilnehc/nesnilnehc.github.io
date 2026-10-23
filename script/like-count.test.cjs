const { test } = require('node:test');
const assert = require('node:assert/strict');
const { analyze, parseCount, selectCount } = require('../assets/js/like-count.js');

test('counts are strict nonnegative safe integers, not coercible missing values', () => {
  for (const value of [undefined, null, '', ' ', '-1', '1.5', 'NaN', 'Infinity', '1e2', '0x10', '9007199254740992']) {
    assert.equal(parseCount(value), null, String(value));
  }
  assert.equal(parseCount('0'), 0);
  assert.equal(parseCount('12'), 12);
});

test('snapshot distribution and distinct denominators match music data', () => {
  const items = [81, 10, 4, 1, 1].flatMap((size, index) =>
    Array.from({ length: size }, (_, id) => ({ id: `${index}-${id}`, count: index + 1 })));
  const result = analyze(items);
  assert.equal(result.total, 122);
  assert.equal(result.valid, 97);
  assert.equal(result.repeated, 16);
  assert.equal(result.repeatedShare, 16 / 97);
  assert.equal(result.contribution, 41 / 122);
  assert.deepEqual(result.distribution.map(x => [x.count, x.size]), [[1,81],[2,10],[3,4],[4,1],[5,1]]);
  assert.equal(result.top.length, 16, 'include every tie at the tenth position');
});

test('top ties preserve source order and never use release dates', () => {
  const items = [{ id: 'a', count: 3, date: '2000' }, { id: 'b', count: 3, date: '2026' },
    ...Array.from({length: 12}, (_, i) => ({id: String(i), count: 2})), {id:'low',count:1}];
  assert.deepEqual(analyze(items).top.map(x => x.id), items.slice(0, -1).map(x => x.id));
  assert.equal(analyze(Array.from({length:12}, (_,i)=>({count:20-i}))).top.length, 10);
});

test('empty, zero, uniform and invalid inputs remain distinguishable', () => {
  assert.equal(analyze([]).repeatedShare, null);
  assert.equal(analyze([{count:0}]).contribution, null);
  assert.equal(analyze([{count:0}]).total, 0);
  assert.equal(analyze([{count:1},{count:1}]).uniform, true);
  assert.equal(analyze([{count:1},{count:1}]).top.length, 0);
  const result = analyze([{count:2},{count:null},{count:-1},{count:1.5}]);
  assert.equal(result.invalid, 3);
  assert.equal(result.valid, 1);
  assert.equal(result.repeatedShare, 1);
  assert.equal(result.distribution[0].share, 1);
});

test('temporary count selection does not mutate the statistical baseline', () => {
  const items = [{count:1},{count:2},{count:null}];
  const before = analyze(items);
  assert.equal(selectCount(items, 2).length, 1);
  assert.equal(selectCount(items, null).length, 3);
  assert.deepEqual(analyze(items), before);
});
