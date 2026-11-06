const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const url = process.env.TEST_URL || 'http://127.0.0.1:4173';
let browser;
before(async () => { browser = await chromium.launch(); });
after(async () => { await browser.close(); });

async function open(t, width, options = {}) {
  const page = await browser.newPage({ viewport: { width, height: 760 }, ...options });
  t.after(() => page.close());
  page.setDefaultTimeout(4000);
  await page.goto(url);
  return page;
}

async function canTap(link) {
  return link.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return element.contains(document.elementFromPoint(
      rect.left + rect.width / 2, rect.top + rect.height / 2
    ));
  });
}

test('mobile navigation opens every link and can close again without JavaScript', async t => {
  for (const width of [320, 390, 768]) {
    const page = await open(t, width, {
      isMobile: true, hasTouch: true, javaScriptEnabled: false, reducedMotion: 'reduce',
    });
    const header = page.locator('.site-header');
    const toggle = header.locator('label[for="nav-trigger"]');
    const menu = header.getByRole('navigation', { name: '主导航' });
    const about = menu.locator('a[href="/about/"]');
    const movies = menu.locator('a[href="/movies/"]');
    await toggle.tap();
    assert(await canTap(about), `${width}px: the last menu link must be tappable without scrolling`);

    const buttonBox = await toggle.boundingBox();
    const headerBox = await header.boundingBox();
    const searchBox = await header.getByRole('link', { name: '搜索' }).boundingBox();
    assert(buttonBox.height >= 44 && buttonBox.width >= 44);
    assert(buttonBox.y >= headerBox.y && buttonBox.y + buttonBox.height <= headerBox.y + headerBox.height);
    assert(searchBox.x + searchBox.width <= buttonBox.x);

    await toggle.tap();
    assert(await about.isHidden(), `${width}px: closing the menu should hide the links`);
    await toggle.tap();
    await Promise.all([page.waitForURL('**/movies/'), movies.tap()]);
  }
});

test('short viewports can scroll to the last link and the menu is keyboard accessible', async t => {
  const page = await open(t, 320, { viewport: { width: 320, height: 360 } });
  const toggle = page.getByRole('checkbox', { name: '切换主导航' });
  const menu = page.getByRole('navigation', { name: '主导航' });
  await page.getByRole('link', { name: '骑墙派牛虻的实践与偏好' }).focus();
  await page.keyboard.press('Tab');
  assert(await toggle.evaluate(element => element === document.activeElement));
  assert(await menu.getByRole('link', { name: '首页', exact: true }).isHidden());
  await page.keyboard.press('Space');
  assert(await toggle.isChecked());
  await page.keyboard.press('Tab');
  assert(await menu.getByRole('link', { name: '首页', exact: true })
    .evaluate(element => element === document.activeElement));

  const panel = page.locator('#site-navigation-links');
  assert(await panel.evaluate(element => {
    const scrollable = element.scrollHeight > element.clientHeight;
    return scrollable && getComputedStyle(element).overflowY === 'auto'
      && element.getBoundingClientRect().bottom <= innerHeight;
  }));
  const about = menu.getByRole('link', { name: '关于', exact: true });
  await panel.evaluate(element => { element.scrollTop = element.scrollHeight; });
  assert(await canTap(about));
  await about.click();
  assert.equal(new URL(page.url()).pathname, '/about/');
});

test('home action labels fit on narrow screens and desktop links remain visible', async t => {
  const mobile = await open(t, 320);
  for (const link of await mobile.locator('.home-intro__actions a').all()) {
    assert(await link.evaluate(element => {
      const text = document.createRange();
      text.selectNodeContents(element);
      return text.getClientRects().length === 1;
    }), 'Each home action label should fit on one line');
  }

  const desktop = await open(t, 1024);
  const header = desktop.locator('.site-header');
  assert(await header.locator('label[for="nav-trigger"]').isHidden());
  const about = header.getByRole('link', { name: '关于', exact: true });
  assert(await canTap(about));
  await about.click();
  assert.equal(new URL(desktop.url()).pathname, '/about/');
});
