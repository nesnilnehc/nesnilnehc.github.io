const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const fs = require('node:fs');
let browser;
const url = process.env.TEST_URL || 'http://127.0.0.1:4173';
before(async () => { browser = await chromium.launch({headless:true}); });
after(async () => { await browser.close(); });

async function open(kind, viewport = {width:1440,height:1000}) {
  const page = await browser.newPage({viewport});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${url}/${kind === 'movie' ? 'movies' : 'music'}/`);
  const panel = page.locator('#collection-analytics');
  const toggle = page.locator('[data-analytics-toggle]');
  if (kind === 'music') {
    assert(await panel.isVisible(), 'music analytics must be visible on page load');
    assert.equal(await toggle.count(), 0);
  } else {
    assert.equal(await panel.isVisible(), false);
    await toggle.focus();
    await page.keyboard.press('Enter');
    assert(await panel.isVisible());
  }
  const counts = await page.locator('.'+kind+'-entry').evaluateAll((entries,prefix)=>entries.map(e=>Number(e.dataset[prefix+'Count'])),kind);
  return {page, errors, counts};
}

test('music: distribution and three favorites in one card, with selection and navigation', async () => {
  const {page, errors, counts} = await open('music');
  assert.equal(await page.locator('[data-analytics-metrics]').count(), 0);
  assert.equal(await page.locator('[data-analytics-scope]').innerText(), `全部收藏 · ${counts.length} 首`);
  const favorites = counts.filter(count => count >= 2).sort((a, b) => b - a).slice(0, 3);
  assert.deepEqual(await page.locator('.like-ranking__count').allTextContents(), favorites.map(count => `${count} 次`));
  const card = page.locator('.collection-analytics__card');
  const chart = card.locator('[data-analytics-distribution]');
  const ranking = card.locator('[data-analytics-ranking]');
  assert(await chart.isVisible());
  assert(await ranking.isVisible(), 'the ranking is visible inside the card on page load');
  assert(await card.getByRole('heading', {name: '最喜欢的作品'}).isVisible());
  for (const row of await page.locator('.like-ranking__row').all()) {
    const id = (await row.locator('a').getAttribute('href')).slice(1);
    const artists = await page.locator(`[id="${id}"] .music-entry__meta > div`).first().locator('dd').innerText();
    assert.equal((await row.locator('.like-ranking__artist').innerText()).replace(/\s+/g, ' ').trim(), artists.replace(/\s+/g, ' ').trim());
  }
  const baseline = await chart.innerText();
  const two = page.locator('[data-count-choice="2"]');
  await two.focus(); await page.keyboard.press('Space');
  assert.equal(await two.getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('.music-entry:visible').count(),counts.filter(n=>n===2).length);
  assert.equal(await chart.innerText(),baseline);
  await page.locator('[data-music-sort="count"]').click();
  assert.equal(await page.locator('.music-entry:visible').count(),counts.filter(n=>n===2).length);
  assert.equal(await chart.innerText(),baseline);
  await page.locator('.like-ranking__row a').first().click();
  assert.equal(await page.locator('.music-entry:visible').count(),counts.length);
  assert.equal(await page.locator('.music-entry:focus').count(),1);
  await two.click(); await two.click();
  assert.equal(await page.locator('.music-entry:visible').count(),counts.length);
  await two.click();
  await page.getByRole('button',{name:'清除次数筛选'}).click();
  assert.equal(await two.evaluate(e=>e===document.activeElement),true);
  await two.click();
  await page.locator('[data-music-filter="IU"]').click();
  assert(await page.locator('#collection-analytics').isVisible());
  assert(await ranking.isVisible(), 'the ranking remains visible after filtering');
  assert.equal(await page.locator('[data-count-choice][aria-pressed="true"]').count(),0);
  assert.match(await page.locator('[data-analytics-scope]').innerText(),/IU/);
  const visible = await page.locator('.music-entry:visible').count();
  assert(visible > 0 && visible < counts.length);
  const chartTotal = await chart.locator('.like-distribution__value').evaluateAll(labels =>
    labels.reduce((total, label) => total + parseInt(label.textContent, 10), 0)
  );
  assert.equal(chartTotal, visible);
  assert.deepEqual(errors,[]);
  await page.close();
});

test('movies: uniform data is not arbitrarily ranked, filter scope follows real list', async () => {
  const {page, errors, counts} = await open('movie');
  assert.equal(await page.locator('[data-analytics-metrics] dd').first().textContent(),`${counts.reduce((a,b)=>a+b,0)} 次`);
  if (counts.every(n=>n===1)) {
    assert.equal(await page.locator('.like-ranking__row').count(),0);
    assert.match(await page.locator('[data-analytics-ranking]').innerText(),/所有作品均记录为 1 次/);
  }
  await page.locator('[data-movie-type-filter="film"]').click();
  const n=await page.locator('.movie-entry:visible').count();
  assert(n>0 && n<counts.length);
  const total=await page.locator('.movie-entry:visible').evaluateAll(entries=>entries.reduce((sum,e)=>sum+Number(e.dataset.movieCount),0));
  assert.equal(await page.locator('[data-analytics-metrics] dd').first().textContent(),`${total} 次`);
  const choice = page.locator('[data-count-choice]').first();
  await choice.click();
  assert.equal(await choice.getAttribute('aria-pressed'), 'true');
  const toggle = page.locator('[data-analytics-toggle]');
  await toggle.click();
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(await page.locator('#collection-analytics').isVisible(), false);
  assert.equal(await choice.getAttribute('aria-pressed'), 'false');
  assert.equal(await page.locator('.movie-entry:visible').count(), n);
  assert.deepEqual(errors,[]);
  await page.close();
});

test('without JavaScript, collection content remains readable and analytics controls stay hidden', async () => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  for (const [path,selector] of [['music','.music-entry'],['movies','.movie-entry']]) {
    await page.goto(`${url}/${path}/`);
    const size=await page.locator(selector).count();
    assert(size>0);
    assert.equal(await page.locator(selector+':visible').count(),size);
    assert.equal(await page.locator('[data-analytics-toggle]').isVisible(),false);
    assert.equal(await page.locator('#collection-analytics').isVisible(),false);
    assert.equal(await page.locator('[data-analytics-ranking]').isVisible(),false);
  }
  await context.close();
});

test('invalid, zero and empty DOM fixtures never silently become zero likes', async () => {
  const fixture = await browser.newPage();
  await fixture.setContent(`<div class="collection-filters"></div>
    <section data-collection-analytics="movie" hidden>
    ${['scope','warning','metrics','distribution','ranking','distribution-table','ranking-table','selection'].map(x=>`<div data-analytics-${x}></div>`).join('')}</section>
    ${['','-1','0'].map((count,i)=>`<article class="movie-entry" data-movie-count="${count}" data-movie-order="${i}"><h2>Fixture ${i}</h2></article>`).join('')}`);
  await fixture.addScriptTag({path:'assets/js/like-count.js'});
  await fixture.addScriptTag({path:'assets/js/collection-analytics.js'});
  assert.match(await fixture.locator('[data-analytics-warning]').textContent(),/2 条次数缺失或无效/);
  assert.match(await fixture.locator('[data-analytics-metrics]').textContent(),/—/);
  assert.equal(await fixture.locator('[data-count-choice="0"]').count(),1);
  await fixture.evaluate(()=>{
    document.querySelectorAll('.movie-entry')[2].hidden=true;
    document.dispatchEvent(new CustomEvent('collection-filter',{detail:{kind:'movie'}}));
  });
  assert.match(await fixture.locator('[data-analytics-distribution]').textContent(),/暂无有效次数记录/);
  assert.equal(await fixture.locator('[data-analytics-metrics] dd').first().textContent(),'—');
  await fixture.evaluate(()=>{
    document.querySelectorAll('.movie-entry').forEach(e=>{e.hidden=true;});
    document.dispatchEvent(new CustomEvent('collection-filter',{detail:{kind:'movie'}}));
  });
  assert.match(await fixture.locator('[data-analytics-distribution]').textContent(),/当前筛选下暂无作品/);
  await fixture.close();
});

test('desktop and mobile render nonblank charts with no horizontal page overflow', async () => {
  const out=process.env.SCREENSHOT_DIR || '/tmp/like-count-analytics';
  fs.mkdirSync(out,{recursive:true});
  for (const width of [1440,390,320]) {
    for (const kind of ['music','movie']) {
      const height = kind === 'movie' ? 1000 : width > 600 ? 650 : 844;
      const {page, errors, counts}=await open(kind,{width,height});
      if (kind === 'music') {
        const heading = await page.locator('#analytics-heading').boundingBox();
        assert(heading && heading.y >= 0 && heading.y + heading.height <= height, 'the music statistics heading is in the initial viewport');
      }
      await page.locator('#collection-analytics').scrollIntoViewIfNeeded();
      const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
      assert(sizes.scroll<=sizes.width, `${kind} ${width}: horizontal overflow ${JSON.stringify(sizes)}`);
      const bar=await page.locator('.like-distribution__bar').first().boundingBox();
      assert(bar && bar.width>0 && bar.height>0);
      assert.equal(await page.locator('#analytics-heading').evaluate(e=>getComputedStyle(e).marginTop), '0px', 'article heading spacing must not leak into the tool');
      if (kind === 'movie' && width <= 390) {
        const metric = await page.locator('[data-analytics-metrics] > div').nth(1).locator('dd').first().boundingBox();
        assert(metric.height < 40, 'mobile metric value must remain on one line');
      }
      if (kind === 'movie') {
        await page.locator('summary').filter({hasText:'作品数据'}).click();
        assert(await page.locator('[data-analytics-ranking-table] table').isVisible());
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), 'expanded data table must fit');
        await page.locator('summary').filter({hasText:'作品数据'}).click();
      } else {
        const rows = await page.locator('[data-count-choice]').evaluateAll(buttons => buttons.map(button => {
          const bar = button.querySelector('.like-distribution__bar');
          const plot = button.querySelector('.like-distribution__plot');
          const label = button.querySelector('.like-distribution__value');
          return {
            count: Number(button.dataset.countChoice),
            x: button.getBoundingClientRect().x,
            y: button.getBoundingClientRect().y,
            barWidth: bar.getBoundingClientRect().width,
            plotWidth: plot?.getBoundingClientRect().width,
            label: label?.textContent,
          };
        }));
        for (const [index, row] of rows.entries()) {
          const matches = counts.filter(count => count === row.count).length;
          assert.equal(row.label, `${matches} 首`);
          assert(Math.abs(row.barWidth - row.plotWidth * matches / counts.length) < 0.05, 'bar width represents the share of valid songs');
          assert(row.x === rows[0].x && (!index || row.y > rows[index - 1].y), 'distribution buckets stack vertically');
        }
        const card = await page.locator('.collection-analytics__card').boundingBox();
        const filters = await page.getByRole('region', {name: '筛选音乐'}).boundingBox();
        const ranking = await page.locator('#ranking-heading').boundingBox();
        const distribution = await page.locator('#distribution-heading').boundingBox();
        assert(filters.y >= card.y + card.height, 'the card is above the music filters');
        assert(ranking.y >= card.y && ranking.y + ranking.height <= card.y + card.height, 'the ranking is inside the card');
        if (width >= 761) {
          assert.equal(ranking.y, distribution.y, 'the desktop section headings align');
        } else {
          assert(ranking.y > distribution.y && ranking.x === distribution.x, 'the mobile sections share a left edge');
        }
        const countEdges = await page.locator('.like-ranking__count').evaluateAll(labels =>
          labels.map(label => Math.round(label.getBoundingClientRect().right))
        );
        assert.equal(new Set(countEdges).size, 1, 'the favorite counts share a right edge');
      }
      await page.evaluate(() => {
        document.activeElement.blur();
        window.scrollTo({top:document.querySelector('#collection-analytics').getBoundingClientRect().top+scrollY,behavior:'instant'});
      });
      await page.locator('#collection-analytics').screenshot({path:`${out}/${kind}-${width}.png`});
      assert.deepEqual(errors,[]);
      await page.close();
    }
  }
});


// Covers: docs/backlog/2026-10-23-like-count-analytics.md, acceptance criterion 6;
// docs/design/like-count-analytics.md, invalid counts must not silently become zero.
test('music and movie count sorting distinguish invalid counts from a valid zero', async () => {
  for (const kind of ['music', 'movie']) {
    const {page, errors} = await open(kind);
    await page.locator('.'+kind+'-entry').evaluateAll((entries, prefix) => {
      entries[0].dataset[prefix+'Count'] = '';
      entries[1].dataset[prefix+'Count'] = 'NaN';
      entries[2].dataset[prefix+'Count'] = '0';
    }, kind);
    await page.locator('[data-'+kind+'-sort="count"]').click();
    const groups = await page.locator('.'+kind+'-shelf .collection-group-heading').allTextContents();
    assert(groups.includes('喜欢次数未记录'));
    assert(groups.includes('喜欢 0 次'));
    assert(!groups.some(text => /NaN/.test(text)));
    const last = await page.locator('.'+kind+'-entry').evaluateAll((entries, prefix) => entries.slice(-2).map(e => e.dataset[prefix+'Count']), kind);
    assert.deepEqual(last.sort(), ['', 'NaN'].sort());
    assert.deepEqual(errors, []);
    await page.close();
  }
});
