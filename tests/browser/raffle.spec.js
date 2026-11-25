import { expect, test } from '@playwright/test'

test('draws without repeat, records winners, and resets the number raffle', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.addInitScript(() => localStorage.setItem('cooldown', '20'))
  await page.goto('/')
  await page.getByPlaceholder('一共有几人？').fill('3')
  await page.getByRole('button', { name: '确定' }).click()
  await page.getByRole('button', { name: '记录' }).click()
  await expect(page.locator('#log .empty')).toHaveText('还没有进行过抽奖')
  await page.locator('#log').click()
  const count = page.getByPlaceholder('本轮抽几人？')
  const winners = page.locator('#winners .name')
  for (const n of ['2', '1']) {
    await count.fill(n)
    await page.getByRole('button', { name: '开始' }).click()
    await expect(winners).toHaveCount(Number(n))
    await expect(winners.first()).toBeVisible()
    await page.getByRole('button', { name: '停止' }).click()
  }
  await expect(page.locator('.remaining')).toHaveText('0')
  await page.getByRole('button', { name: '记录' }).click()
  await expect(page.locator('#log li')).toHaveCount(2)
  const history = await page.evaluate(() => JSON.parse(localStorage.getItem('current')))
  expect(
    history
      .flat()
      .map(({ name }) => name)
      .sort(),
  ).toEqual(['001', '002', '003'])
  await page.locator('#log').click()
  await page.getByRole('button', { name: '重置' }).click()
  await expect(page.getByPlaceholder('一共有几人？')).toBeEnabled()
  await expect(page.locator('.remaining')).toHaveText('∞')
  expect(errors).toEqual([])
})

test('loads old settings and draws names from a text file', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('mode', '"import"')
    localStorage.setItem('welcome', '"开抽"')
    localStorage.setItem('custom', '"#stage { color: rgb(1, 2, 3) }"')
    localStorage.setItem('cooldown', '20')
    localStorage.setItem('current', '[[{"name":"旧记录"}]]')
  })
  await page.goto('/')
  await expect(page.locator('#welcome')).toHaveText('开抽')
  await expect(page.locator('#stage')).toHaveCSS('color', 'rgb(1, 2, 3)')
  await expect(page.getByPlaceholder('一共有几人？')).toHaveCount(0)
  await page.locator('input[type=file]').setInputFiles({
    name: 'roster.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('小红|蓝队\n小明|红队\n'),
  })
  await expect(page.locator('.remaining')).toHaveText('2')
  await page.getByPlaceholder('本轮抽几人？').fill('2')
  await page.getByRole('button', { name: '开始' }).click()
  await expect(page.locator('#winners .name')).toHaveCount(2)
  await page.getByRole('button', { name: '停止' }).click()
  await expect(page.locator('#winners')).toContainText('蓝队')
  await expect(page.locator('#winners')).toContainText('红队')
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('previous')))).toEqual([
    [{ name: '旧记录' }],
  ])
})

test('keeps a welcome edit as text through reload', async ({ page }) => {
  await page.goto('/')
  const welcome = page.locator('#welcome')
  await welcome.dblclick()
  await welcome.fill('<b>开始</b>')
  await welcome.press('Enter')
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('welcome')))
    .toBe('"<b>开始</b>"')
  await page.reload()
  await expect(welcome).toHaveText('<b>开始</b>')
  await expect(welcome.locator('b')).toHaveCount(0)
})
