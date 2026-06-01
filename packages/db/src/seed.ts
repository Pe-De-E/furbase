import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool, { schema })

async function main() {
  console.log('🌱 Seeding...')

  // Settings
  await db.insert(schema.settings).values({
    name: 'Tierheim Musterstadt',
    address: 'Musterstraße 1, 12345 Musterstadt',
    phone: '+49 123 456789',
    email: 'info@tierheim-musterstadt.de',
    website: 'https://tierheim-musterstadt.de',
    description: 'Wir vermitteln Tiere in liebevolle Hände seit 1990.',
  })

  // Tags
  const tags = await db.insert(schema.tag).values([
    { name: 'kastriert',          category: 'health' },
    { name: 'geimpft',            category: 'health' },
    { name: 'gechipt',            category: 'health' },
    { name: 'chronisch krank',    category: 'health' },
    { name: 'kinderfreundlich',   category: 'behavior' },
    { name: 'hundefreundlich',    category: 'behavior' },
    { name: 'katzenfreundlich',   category: 'behavior' },
    { name: 'stubenrein',         category: 'behavior' },
    { name: 'einzelhaltung',      category: 'needs' },
    { name: 'erfahrener Halter',  category: 'needs' },
    { name: 'Leinentraining',     category: 'needs' },
  ]).returning()

  const tagByName = Object.fromEntries(tags.map(t => [t.name, t.id]))

  // Users
  const [admin, testUser] = await db.insert(schema.user).values([
    {
      name: 'Admin',
      email: 'admin@tierheim-musterstadt.de',
      role: 'admin',
    },
    {
      name: 'Max Mustermann',
      email: 'max@example.com',
      role: 'user',
    },
  ]).returning()

  // Tiere
  const tiere = await db.insert(schema.tier).values([
    {
      name: 'Luna',
      species: 'hund',
      breed: 'Labrador Mix',
      age: 36,
      gender: 'weiblich',
      size: 'gross',
      weight: '28.50',
      color: 'Schwarz',
      description: 'Luna ist eine verschmuste Labrador-Mischlingshündin, die nach einem liebevollen Zuhause sucht. Sie ist sehr verspielt und liebt lange Spaziergänge.',
      images: [
        'https://picsum.photos/seed/luna1/600/400',
        'https://picsum.photos/seed/luna2/600/400',
      ],
      status: 'verfuegbar',
      arrivalDate: '2024-11-15',
      isNeutered: true,
      isVaccinated: true,
      isChipped: true,
      goodWithKids: true,
      goodWithDogs: true,
      goodWithCats: false,
      activityLevel: 'hoch',
      needsGarden: true,
      needsExperiencedOwner: false,
      needsTraining: false,
    },
    {
      name: 'Bello',
      species: 'hund',
      breed: 'Deutscher Schäferhund',
      age: 60,
      gender: 'maennlich',
      size: 'gross',
      weight: '35.00',
      color: 'Braun-Schwarz',
      description: 'Bello ist ein treuer Schäferhund, der ein erfahrenes Herrchen braucht. Er ist sehr intelligent und lernwillig.',
      images: [
        'https://picsum.photos/seed/bello1/600/400',
        'https://picsum.photos/seed/bello2/600/400',
      ],
      status: 'verfuegbar',
      arrivalDate: '2025-01-10',
      isNeutered: true,
      isVaccinated: true,
      isChipped: true,
      goodWithKids: false,
      goodWithDogs: false,
      goodWithCats: false,
      activityLevel: 'hoch',
      needsGarden: true,
      needsExperiencedOwner: true,
      needsTraining: true,
    },
    {
      name: 'Mia',
      species: 'katze',
      breed: 'Europäisch Kurzhaar',
      age: 24,
      gender: 'weiblich',
      size: 'klein',
      weight: '4.20',
      color: 'Getigert',
      description: 'Mia ist eine ruhige Katze, die am liebsten auf dem Sofa kuschelt. Sie kommt gut mit anderen Katzen aus.',
      images: [
        'https://picsum.photos/seed/mia1/600/400',
        'https://picsum.photos/seed/mia2/600/400',
      ],
      status: 'verfuegbar',
      arrivalDate: '2025-02-20',
      isNeutered: true,
      isVaccinated: true,
      isChipped: true,
      goodWithKids: true,
      goodWithDogs: false,
      goodWithCats: true,
      activityLevel: 'niedrig',
      needsGarden: false,
      needsExperiencedOwner: false,
      needsTraining: false,
    },
    {
      name: 'Felix',
      species: 'katze',
      breed: 'Maine Coon Mix',
      age: 48,
      gender: 'maennlich',
      size: 'mittel',
      weight: '6.80',
      color: 'Rotbraun',
      description: 'Felix ist ein imposanter Maine-Coon-Mix mit viel Persönlichkeit. Er liebt es, beobachtet zu werden.',
      images: [
        'https://picsum.photos/seed/felix1/600/400',
      ],
      status: 'reserviert',
      arrivalDate: '2024-12-01',
      isNeutered: true,
      isVaccinated: true,
      isChipped: false,
      goodWithKids: true,
      goodWithDogs: false,
      goodWithCats: true,
      activityLevel: 'mittel',
      needsGarden: false,
      needsExperiencedOwner: false,
      needsTraining: false,
    },
    {
      name: 'Hoppel',
      species: 'hase',
      breed: 'Zwergkaninchen',
      age: 12,
      gender: 'maennlich',
      size: 'klein',
      weight: '1.50',
      color: 'Weiß-Grau',
      description: 'Hoppel sucht einen ruhigen Haushalt. Er ist am liebsten in Gesellschaft eines anderen Kaninchens.',
      images: [
        'https://picsum.photos/seed/hoppel1/600/400',
      ],
      status: 'verfuegbar',
      arrivalDate: '2025-03-05',
      isNeutered: true,
      isVaccinated: false,
      isChipped: false,
      goodWithKids: false,
      goodWithDogs: false,
      goodWithCats: false,
      activityLevel: 'niedrig',
      needsGarden: false,
      needsExperiencedOwner: false,
      needsTraining: false,
    },
    {
      name: 'Rocky',
      species: 'hund',
      breed: 'Boxer',
      age: 18,
      gender: 'maennlich',
      size: 'gross',
      weight: '30.00',
      color: 'Gestromt',
      description: 'Rocky ist ein junger, energiegeladener Boxer der viel Bewegung und Beschäftigung braucht.',
      images: [
        'https://picsum.photos/seed/rocky1/600/400',
        'https://picsum.photos/seed/rocky2/600/400',
        'https://picsum.photos/seed/rocky3/600/400',
      ],
      status: 'verfuegbar',
      arrivalDate: '2025-04-01',
      isNeutered: false,
      isVaccinated: true,
      isChipped: true,
      goodWithKids: true,
      goodWithDogs: true,
      goodWithCats: false,
      activityLevel: 'hoch',
      needsGarden: true,
      needsExperiencedOwner: false,
      needsTraining: true,
    },
  ]).returning()

  const tierByName = Object.fromEntries(tiere.map(t => [t.name, t.id]))

  // Tier-Tags
  await db.insert(schema.tierTag).values([
    { tierId: tierByName['Luna'],   tagId: tagByName['kastriert'] },
    { tierId: tierByName['Luna'],   tagId: tagByName['geimpft'] },
    { tierId: tierByName['Luna'],   tagId: tagByName['gechipt'] },
    { tierId: tierByName['Luna'],   tagId: tagByName['kinderfreundlich'] },
    { tierId: tierByName['Bello'],  tagId: tagByName['kastriert'] },
    { tierId: tierByName['Bello'],  tagId: tagByName['geimpft'] },
    { tierId: tierByName['Bello'],  tagId: tagByName['gechipt'] },
    { tierId: tierByName['Bello'],  tagId: tagByName['erfahrener Halter'] },
    { tierId: tierByName['Bello'],  tagId: tagByName['Leinentraining'] },
    { tierId: tierByName['Mia'],    tagId: tagByName['kastriert'] },
    { tierId: tierByName['Mia'],    tagId: tagByName['geimpft'] },
    { tierId: tierByName['Mia'],    tagId: tagByName['gechipt'] },
    { tierId: tierByName['Mia'],    tagId: tagByName['stubenrein'] },
    { tierId: tierByName['Felix'],  tagId: tagByName['kastriert'] },
    { tierId: tierByName['Felix'],  tagId: tagByName['geimpft'] },
    { tierId: tierByName['Felix'],  tagId: tagByName['einzelhaltung'] },
    { tierId: tierByName['Hoppel'], tagId: tagByName['kastriert'] },
    { tierId: tierByName['Rocky'],  tagId: tagByName['geimpft'] },
    { tierId: tierByName['Rocky'],  tagId: tagByName['gechipt'] },
    { tierId: tierByName['Rocky'],  tagId: tagByName['kinderfreundlich'] },
    { tierId: tierByName['Rocky'],  tagId: tagByName['Leinentraining'] },
  ])

  // Favoriten für den Test-User
  await db.insert(schema.favorit).values([
    { userId: testUser.id, tierId: tierByName['Luna'] },
    { userId: testUser.id, tierId: tierByName['Mia'] },
  ])

  console.log('✅ Seed abgeschlossen')
  console.log(`   ${tiere.length} Tiere`)
  console.log(`   ${tags.length} Tags`)
  console.log('   2 User (admin + testuser)')
  await pool.end()
}

main().catch((e) => { console.error(e); process.exit(1) })
