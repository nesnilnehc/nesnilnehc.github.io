const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('generated poetry page orders the timeline oldest first and works newest first', () => {
  const html = fs.readFileSync('_site/poetry/index.html', 'utf8');
  const periods = [...html.matchAll(/data-poetry-period-filter="([^"]+)"/g)].map(m => m[1]);
  const expectedPeriods = ['all', '春秋战国', '三国', '唐', '北宋', '20 世纪'];
  assert.deepEqual(periods.filter(p => expectedPeriods.includes(p)), expectedPeriods);
  const works = [...html.matchAll(/<details class="poetry-entry" id="([^"]+)"/g)].map(m => m[1]);
  const expectedWorks = ['learn-the-rules-like-a-pro', 'ji-you-song-feng-ting', 'meihua-ji', 'jiezi-shu', 'ruzi-ge'];
  assert.deepEqual(works.filter(id => expectedWorks.includes(id)), expectedWorks);
  const indexes = [...html.matchAll(/<span class="poetry-entry__index">(\d+)<\/span>/g)].map(m => m[1]);
  assert.deepEqual(indexes, works.map((_, i) => String(i + 1).padStart(2, '0').slice(-2)));
  assert.match(html, /三国[\s\S]*?220—280 年/);
});
