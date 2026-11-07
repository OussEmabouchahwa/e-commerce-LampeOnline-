import { PrismaClient } from '@prisma/client'
import argon2 from 'argon2'
import { randomUUID } from 'crypto'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

const ADMIN_EMAIL = process.env['ADMIN_EMAIL'] ?? 'admin@lampeonline.tn'
const ADMIN_PASSWORD = process.env['ADMIN_PASSWORD'] ?? 'Admin@123456'

const categories = [
  { slug: 'suspension', name: 'Suspension' },
  { slug: 'lampadaire', name: 'Lampadaire' },
  { slug: 'table', name: 'Lampe de table' },
  { slug: 'bureau', name: 'Lampe de bureau' },
  { slug: 'applique', name: 'Applique murale' },
  { slug: 'exterieur', name: 'Éclairage extérieur' },
]

const products = [
  {
    slug: 'eclipse-suspension',
    name: 'Éclipse Suspension',
    description:
      "Suspension minimaliste en métal brossé avec abat-jour hémisphérique. Idéale au-dessus d'une table à manger pour une lumière chaleureuse et directe.",
    priceMillimes: 189000,
    stock: 12,
    categorySlug: 'suspension',
    model3d: { shade: 'dome', shadeColor: '#e8dcc8', stemColor: '#888888', baseColor: '#444444', colorTemp: 3000 },
  },
  {
    slug: 'nordik-suspension',
    name: 'Nordik Suspension',
    description:
      "Design scandinave épuré. Structure en chêne naturel et abat-jour en lin beige. Chaleur et authenticité pour votre intérieur.",
    priceMillimes: 245000,
    stock: 7,
    categorySlug: 'suspension',
    model3d: { shade: 'cone', shadeColor: '#f5efe0', stemColor: '#c8a97e', baseColor: '#8b6914', colorTemp: 2700 },
  },
  {
    slug: 'luna-suspension',
    name: 'Luna Boule',
    description:
      "Sphère en verre soufflé translucide. La lumière se diffuse doucement pour créer une atmosphère feutrée et enveloppante.",
    priceMillimes: 320000,
    stock: 4,
    categorySlug: 'suspension',
    model3d: { shade: 'sphere', shadeColor: '#f0f0f0', stemColor: '#cccccc', baseColor: '#aaaaaa', colorTemp: 3500 },
  },
  {
    slug: 'tower-lampadaire',
    name: 'Tower Lampadaire',
    description:
      "Lampadaire sculptural en acier noir mat, 180 cm. Tête orientable à 270°. Idéal pour éclairer un coin lecture avec précision.",
    priceMillimes: 450000,
    stock: 5,
    categorySlug: 'lampadaire',
    model3d: { shade: 'cone', shadeColor: '#1a1a1a', stemColor: '#333333', baseColor: '#222222', colorTemp: 4000 },
  },
  {
    slug: 'bamboo-lampadaire',
    name: 'Bambou Naturel',
    description:
      "Lampadaire en bambou tressé à la main. Abat-jour en papier de riz. Ambiance zen et nature pour votre salon.",
    priceMillimes: 185000,
    stock: 9,
    categorySlug: 'lampadaire',
    model3d: { shade: 'cylinder', shadeColor: '#d4a84b', stemColor: '#8b6914', baseColor: '#5c4a1e', colorTemp: 2800 },
  },
  {
    slug: 'ara-table',
    name: 'Ara Lampe de table',
    description:
      "Céramique émaillée faite à la main en Tunisie, col en laiton doré. Chaque pièce est unique. Abat-jour en coton blanc.",
    priceMillimes: 135000,
    stock: 15,
    categorySlug: 'table',
    model3d: { shade: 'cylinder', shadeColor: '#ffffff', stemColor: '#d4af37', baseColor: '#a07d1a', colorTemp: 3000 },
  },
  {
    slug: 'marbre-table',
    name: 'Marbre & Laiton',
    description:
      "Base en marbre de Carrare, col en laiton brossé. Un classique indémodable qui sublime toute table de chevet.",
    priceMillimes: 290000,
    stock: 3,
    categorySlug: 'table',
    model3d: { shade: 'dome', shadeColor: '#f8f8f8', stemColor: '#c5a028', baseColor: '#e8e8e8', colorTemp: 2700 },
  },
  {
    slug: 'cactus-table',
    name: 'Cactus Verde',
    description:
      "Lampe de table en forme de cactus sculpté, résine teintée vert sauge. Originale et tendance, parfaite pour apporter du caractère.",
    priceMillimes: 89000,
    stock: 20,
    categorySlug: 'table',
    model3d: { shade: 'sphere', shadeColor: '#f5f0e8', stemColor: '#6b8f71', baseColor: '#4a6741', colorTemp: 4000 },
  },
  {
    slug: 'architect-bureau',
    name: 'Architecte Pro',
    description:
      "Lampe de bureau à bras articulé en aluminium anodisé. Réglage de l'intensité et de la température de couleur 2700K–6500K.",
    priceMillimes: 199000,
    stock: 11,
    categorySlug: 'bureau',
    model3d: { shade: 'cone', shadeColor: '#c0c0c0', stemColor: '#888888', baseColor: '#555555', colorTemp: 5000 },
  },
  {
    slug: 'clip-bureau',
    name: 'Clip Pince',
    description:
      "Lampe à pince compacte pour s'accrocher partout : bureau, étagère, tête de lit. LED intégrée 400 lm, col flexible 360°.",
    priceMillimes: 55000,
    stock: 35,
    categorySlug: 'bureau',
    model3d: { shade: 'cylinder', shadeColor: '#2d2d2d', stemColor: '#444444', baseColor: '#333333', colorTemp: 5500 },
  },
  {
    slug: 'retro-bureau',
    name: 'Rétro Edison',
    description:
      "Lampe de bureau rétro style industriel, culot E27. Compatible ampoule Edison filament (non fournie). Base en fonte.",
    priceMillimes: 125000,
    stock: 8,
    categorySlug: 'bureau',
    model3d: { shade: 'dome', shadeColor: '#2c1810', stemColor: '#8b4513', baseColor: '#3d2b1f', colorTemp: 2200 },
  },
  {
    slug: 'lune-applique',
    name: 'Lune Applique',
    description:
      "Applique murale en forme de demi-lune, béton ciré gris anthracite. Lumière indirecte vers le haut, effet cocooning.",
    priceMillimes: 145000,
    stock: 6,
    categorySlug: 'applique',
    model3d: { shade: 'dome', shadeColor: '#6b6b6b', stemColor: '#888888', baseColor: '#555555', colorTemp: 3000 },
  },
  {
    slug: 'rattan-applique',
    name: 'Rotin Tressé',
    description:
      "Applique en rotin tressé à la main. Diffuse une lumière filtrée et chaleureuse aux motifs géométriques sur vos murs.",
    priceMillimes: 98000,
    stock: 14,
    categorySlug: 'applique',
    model3d: { shade: 'sphere', shadeColor: '#c8a97e', stemColor: '#a07d50', baseColor: '#6b5431', colorTemp: 2700 },
  },
  {
    slug: 'tube-applique',
    name: 'Tube Laiton',
    description:
      "Applique linéaire en laiton poli, 40 cm. Lumière vers le haut et vers le bas. Parfaite de chaque côté d'un miroir.",
    priceMillimes: 175000,
    stock: 10,
    categorySlug: 'applique',
    model3d: { shade: 'cylinder', shadeColor: '#d4af37', stemColor: '#c5a028', baseColor: '#a07d1a', colorTemp: 3500 },
  },
  {
    slug: 'solar-borne',
    name: 'Borne Solaire',
    description:
      "Borne d'éclairage extérieure solaire, IP65, hauteur 60 cm. Charge le jour, s'allume automatiquement la nuit. Blanc chaud.",
    priceMillimes: 220000,
    stock: 18,
    categorySlug: 'exterieur',
    model3d: { shade: 'cylinder', shadeColor: '#f0f0f0', stemColor: '#777777', baseColor: '#555555', colorTemp: 3000 },
  },
  {
    slug: 'guirlande-exterieur',
    name: 'Guirlande Festoon',
    description:
      "10 mètres de guirlande festoon avec 15 ampoules LED G45 incluses. IP44, câble noir. Idéale pour terrasses et jardins.",
    priceMillimes: 85000,
    stock: 25,
    categorySlug: 'exterieur',
    model3d: { shade: 'sphere', shadeColor: '#fffde7', stemColor: '#333333', baseColor: '#222222', colorTemp: 2200 },
  },
  {
    slug: 'lanterne-jardin',
    name: 'Lanterne de jardin',
    description:
      "Lanterne sur piquet en aluminium thermolaqué noir, IP44. Verre transparent borosilicate. H: 80 cm. E27.",
    priceMillimes: 155000,
    stock: 2,
    categorySlug: 'exterieur',
    model3d: { shade: 'dome', shadeColor: '#1a1a1a', stemColor: '#222222', baseColor: '#111111', colorTemp: 2700 },
  },
  {
    slug: 'spots-led-bureau',
    name: 'Spots LED Trio',
    description:
      "Rampe 3 spots LED orientables, 15W total, IRC 95. Pince ou base plate. Parfaite pour éclairer un plan de travail.",
    priceMillimes: 75000,
    stock: 22,
    categorySlug: 'bureau',
    model3d: { shade: 'cone', shadeColor: '#f0f0f0', stemColor: '#cccccc', baseColor: '#888888', colorTemp: 5000 },
  },
  {
    slug: 'velvet-table',
    name: 'Velvet Bordeaux',
    description:
      "Pied en céramique texturée bordeaux, abat-jour en velours ivoire. Élégance et luxe abordable pour votre intérieur.",
    priceMillimes: 160000,
    stock: 0,
    categorySlug: 'table',
    model3d: { shade: 'cylinder', shadeColor: '#f5f0e8', stemColor: '#8b2252', baseColor: '#6b1a3f', colorTemp: 2700 },
  },
  {
    slug: 'cloud-suspension',
    name: 'Cloud Nuage',
    description:
      "Suspension en feutre blanc façonné en nuage. Lumière douce et diffuse, parfaite pour une chambre d'enfant ou un salon créatif.",
    priceMillimes: 210000,
    stock: 1,
    categorySlug: 'suspension',
    model3d: { shade: 'sphere', shadeColor: '#f8f8f8', stemColor: '#dddddd', baseColor: '#bbbbbb', colorTemp: 4000 },
  },
]

async function main() {
  console.log('Seeding database...')

  // Admin user
  const adminHash = await argon2.hash(ADMIN_PASSWORD)
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      name: 'Admin LampeOnline',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('Admin user created')

  // Demo clients
  const client1Hash = await argon2.hash('Client@123456')
  const client1 = await prisma.user.upsert({
    where: { email: 'client1@example.com' },
    update: {},
    create: {
      email: 'client1@example.com',
      passwordHash: client1Hash,
      name: 'Ahmed Ben Ali',
      phone: '+21698765432',
      role: 'CLIENT',
      status: 'ACTIVE',
    },
  })
  const client2 = await prisma.user.upsert({
    where: { email: 'client2@example.com' },
    update: {},
    create: {
      email: 'client2@example.com',
      passwordHash: client1Hash,
      name: 'Sarra Mansouri',
      phone: '+21655443322',
      role: 'CLIENT',
      status: 'ACTIVE',
    },
  })
  await prisma.user.upsert({
    where: { email: 'client3@example.com' },
    update: {},
    create: {
      email: 'client3@example.com',
      passwordHash: client1Hash,
      name: 'Youssef Trabelsi',
      phone: '+21622334455',
      role: 'CLIENT',
      status: 'BLOCKED',
    },
  })
  console.log('Demo clients created')

  // Categories
  const categoryMap: Record<string, string> = {}
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    })
    categoryMap[cat.slug] = created.id
  }
  console.log('Categories created')

  // Products
  const productMap: Record<string, string> = {}
  for (const p of products) {
    const { categorySlug, model3d, ...rest } = p
    const catId = categoryMap[categorySlug]
    if (!catId) continue
    const created = await prisma.product.upsert({
      where: { slug: rest.slug },
      update: {},
      create: {
        ...rest,
        categoryId: catId,
        images: JSON.stringify([
          `https://picsum.photos/seed/${rest.slug}/800/600`,
          `https://picsum.photos/seed/${rest.slug}2/800/600`,
        ]),
        model3d: JSON.stringify(model3d),
      },
    })
    productMap[rest.slug] = created.id
  }
  console.log('Products created')

  // Orders
  const shippingAddress = JSON.stringify({
    fullName: 'Ahmed Ben Ali',
    phone: '+21698765432',
    address: '12 Rue de la Liberté',
    city: 'Tunis',
    postalCode: '1001',
  })

  const orderStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
  const pIds = Object.values(productMap)

  for (let i = 0; i < 5; i++) {
    const status = orderStatuses[i]
    if (!status) continue
    const p1Id = pIds[i * 2]
    const p2Id = pIds[i * 2 + 1]
    if (!p1Id || !p2Id) continue

    const p1 = products[i * 2]
    const p2 = products[i * 2 + 1]
    if (!p1 || !p2) continue

    const total = p1.priceMillimes + p2.priceMillimes

    const order = await prisma.order.create({
      data: {
        userId: i < 3 ? client1.id : client2.id,
        status,
        totalMillimes: total,
        paymentMethod: i % 2 === 0 ? 'MOCK_CARD' : 'CASH_ON_DELIVERY',
        paymentStatus: status === 'PENDING' ? 'PENDING' : status === 'CANCELLED' ? 'FAILED' : 'SUCCESS',
        shippingAddress,
        idempotencyKey: randomUUID(),
        items: {
          create: [
            { productId: p1Id, nameSnapshot: p1.name, priceSnapshot: p1.priceMillimes, qty: 1 },
            { productId: p2Id, nameSnapshot: p2.name, priceSnapshot: p2.priceMillimes, qty: 1 },
          ],
        },
        payments: {
          create: {
            provider: i % 2 === 0 ? 'mock' : 'cash_on_delivery',
            status: status === 'PENDING' ? 'PENDING' : status === 'CANCELLED' ? 'FAILED' : 'SUCCESS',
            reference: `REF-${randomUUID().split('-')[0]?.toUpperCase()}`,
          },
        },
      },
    })
    console.log(`Order ${order.id} (${status}) created`)
  }

  // Wishlist items for client1
  const wishProductIds = pIds.slice(0, 4)
  for (const pid of wishProductIds) {
    if (!pid) continue
    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: client1.id, productId: pid } },
      update: {},
      create: { userId: client1.id, productId: pid },
    })
  }
  console.log('Wishlist items created')

  // Page views (spread over 30 days)
  const paths = ['/', '/products', '/products/eclipse-suspension', '/products/ara-table', '/products/tower-lampadaire']
  const now = new Date()
  for (let i = 0; i < 100; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const visitorId = `visitor-${Math.floor(i / 3)}`
    const p = paths[i % paths.length]
    if (!p) continue
    await prisma.pageView.create({
      data: {
        visitorId,
        userId: i % 5 === 0 ? client1.id : i % 7 === 0 ? client2.id : null,
        path: p,
        referrer: i % 4 === 0 ? 'https://google.com' : null,
        sessionKey: `${visitorId}-${daysAgo}`,
        createdAt,
      },
    })
  }
  console.log('Page views created')

  // Funnel events
  const funnelPaths: Array<{ event: string; productId?: string }> = [
    { event: 'product_view', productId: pIds[0] },
    { event: 'add_to_cart', productId: pIds[0] },
    { event: 'checkout_start' },
    { event: 'purchase' },
    { event: 'product_view', productId: pIds[1] },
    { event: 'add_to_cart', productId: pIds[1] },
    { event: 'product_view', productId: pIds[2] },
  ]

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30)
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    const visitorId = `visitor-${Math.floor(i / 2)}`
    const fe = funnelPaths[i % funnelPaths.length]
    if (!fe) continue
    await prisma.funnelEvent.create({
      data: {
        visitorId,
        userId: i % 6 === 0 ? client1.id : null,
        event: fe.event,
        productId: fe.productId ?? null,
        createdAt,
      },
    })
  }
  console.log('Funnel events created')

  console.log('\nSeed complete!')
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  console.log('Demo clients: client1@example.com / client2@example.com (password: Client@123456)')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
