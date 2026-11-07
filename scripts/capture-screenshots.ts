import { chromium } from '@playwright/test'
import path from 'path'

const OUT_DIR = path.resolve(__dirname, '../docs/screenshots')

async function run() {
  console.log('Starting screenshot captures...')
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1.5,
  })
  const page = await context.newPage()

  // 1. Home page
  console.log('Capturing Home Page...')
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(OUT_DIR, '01-home.png') })

  // 2. Catalog page
  console.log('Capturing Catalog Page...')
  await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(OUT_DIR, '02-catalog.png') })

  // 3. Product detail with 3D Viewer
  console.log('Capturing Product Page & 3D Viewer...')
  await page.goto('http://localhost:5173/products/eclipse-suspension', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  // Click Vue 3D button
  const btn3d = page.getByRole('button', { name: /vue 3d/i })
  if (await btn3d.isVisible()) {
    await btn3d.click()
    await page.waitForTimeout(1200)
  }
  await page.screenshot({ path: path.join(OUT_DIR, '03-product-3d.png') })

  // 4. Cart Drawer
  console.log('Capturing Cart Drawer...')
  // Click add to cart button
  const addToCartBtn = page.getByRole('button', { name: /add to cart/i })
  if (await addToCartBtn.isVisible()) {
    await addToCartBtn.click()
    await page.waitForTimeout(500)
  }
  // Open cart drawer
  const cartIcon = page.getByLabel(/panier/i)
  if (await cartIcon.isVisible()) {
    await cartIcon.click()
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(OUT_DIR, '04-cart-drawer.png') })
    // Close cart drawer by clicking Escape or backdrop
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
  }

  // 5. Login as Client
  console.log('Logging in as Client...')
  await page.goto('http://localhost:5173/auth/login', { waitUntil: 'networkidle' })
  await page.fill('input[type="email"]', 'client1@example.com')
  await page.fill('input[type="password"]', 'Client@123456')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(1000)

  // 6. Checkout Page
  console.log('Capturing Checkout Page...')
  await page.goto('http://localhost:5173/checkout', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await page.screenshot({ path: path.join(OUT_DIR, '05-checkout.png') })

  // 7. Client Account - Wishlist
  console.log('Capturing Client Account - Wishlist...')
  await page.goto('http://localhost:5173/account?tab=wishlist', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await page.screenshot({ path: path.join(OUT_DIR, '06-account-wishlist.png') })

  // 8. Client Account - Orders
  console.log('Capturing Client Account - Orders...')
  await page.goto('http://localhost:5173/account?tab=orders', { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await page.screenshot({ path: path.join(OUT_DIR, '07-account-orders.png') })

  // 9. Login as Admin
  console.log('Logging in as Admin...')
  await page.goto('http://localhost:5173/auth/login', { waitUntil: 'networkidle' })
  await page.fill('input[type="email"]', 'admin@lampeonline.tn')
  await page.fill('input[type="password"]', 'Admin@123456')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(1000)

  // 10. Admin Dashboard
  console.log('Capturing Admin Dashboard...')
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await page.screenshot({ path: path.join(OUT_DIR, '08-admin-dashboard.png') })

  // 11. Admin Products & Photo management
  console.log('Capturing Admin Products Drawer...')
  const prodTab = page.getByRole('button', { name: /luminaires/i })
  if (await prodTab.isVisible()) {
    await prodTab.click()
    await page.waitForTimeout(800)
    // Open product edit drawer
    const editBtn = page.locator('button[title*="Modifier"]').first()
    if (await editBtn.isVisible()) {
      await editBtn.click()
      await page.waitForTimeout(800)
      await page.screenshot({ path: path.join(OUT_DIR, '09-admin-products-drawer.png') })
      await page.keyboard.press('Escape')
      await page.waitForTimeout(400)
    }
  }

  // 12. Admin Categories CRUD
  console.log('Capturing Admin Categories...')
  const catTab = page.getByRole('button', { name: /catégories/i })
  if (await catTab.isVisible()) {
    await catTab.click()
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(OUT_DIR, '10-admin-categories.png') })
  }

  await browser.close()
  console.log('All screenshots captured successfully!')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
