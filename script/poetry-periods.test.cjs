const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('poetry author count excludes anonymous works but retains their byline', () => {
  const html = fs.readFileSync('_site/poetry/index.html', 'utf8');
  const bylines = [...html.matchAll(/<span class="credit-name">([^<]+)<\/span>/g)].map(m => m[1]);
  assert.ok(bylines.includes('佚名'));
  const expectedCount = new Set(bylines.filter(name => name !== '佚名')).size;
  const count = html.match(/<span class="collection-summary__value">(\d+)<\/span>\s*<span class="collection-summary__label">位作者<\/span>/);
  assert.ok(count);
  assert.equal(Number(count[1]), expectedCount);
});

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

test('author bylines include lifespan labels and sources without a timeline', () => {
  const html = fs.readFileSync('_site/poetry/index.html', 'utf8');
  assert.doesNotMatch(html, /author-timeline/);
  assert.match(html, /credit-name">李商隐<\/span>[\s\S]*?（约 812—858 年）/);
  assert.match(html, /约 812—858 年/);
  assert.doesNotMatch(html, /生卒年待考/);
  assert.match(html, /u60fa76c74742f.pdf/);
  const anonymousNun = html.match(/id="meihua-ji"[\s\S]*?<\/summary>/)[0];
  assert.doesNotMatch(anonymousNun, /poetry-entry__lifespan/);
  assert.doesNotMatch(html, /虚线/);
});
