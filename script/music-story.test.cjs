const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

test('the requested song renders its story and links to its sources', () => {
  const html = readFileSync('_site/music/index.html', 'utf8');
  const entries = [...html.matchAll(/<article class="music-entry"[\s\S]*?<\/article>/g)].map(match => match[0]);
  const entry = entries.find(item => item.includes('id="liu-ruoying-wo-ceng-ai-guo-yi-ge-nan-hai"'));
  assert.ok(entry, 'the requested song is present');
  assert.match(entry, /<details class="music-entry__story">\s*<summary>歌曲故事<\/summary>/);
  assert.match(entry, /Kinderspiele/);
  assert.match(entry, /faculty\.ndhu\.edu\.tw\/~chenli\/prose2\.htm/);
  assert.match(entry, /music-tw\.line\.me\/album\/1027568/);
});
