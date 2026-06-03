import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool, { schema })

async function main() {
  console.log('🌱 Seeding...')

  await db.insert(schema.species).values([
    { value: 'dog',          label: 'Dogs',         sortOrder: 1 },
    { value: 'cat',          label: 'Cats',         sortOrder: 2 },
    { value: 'rabbit',       label: 'Rabbits',      sortOrder: 3 },
    { value: 'bird',         label: 'Birds',        sortOrder: 4 },
    { value: 'small_animal', label: 'Small Animals',sortOrder: 5 },
    { value: 'other',        label: 'Other',        sortOrder: 6 },
  ])

  await db.insert(schema.settings).values({
    name: 'Tierherberge Pfaffenhofen a. d. Ilm',
    address: 'Musterstraße 1, 85276 Pfaffenhofen a. d. Ilm',
    phone: '+49 8441 123456',
    email: 'info@tierherberge-pfaffenhofen.de',
    website: 'https://tierherberge-pfaffenhofen.de',
    description: 'Wir vermitteln Tiere in liebevolle Hände seit 1990.',
  })

  const tags = await db.insert(schema.tag).values([
    { name: 'neutered',           category: 'health' },
    { name: 'vaccinated',         category: 'health' },
    { name: 'chipped',            category: 'health' },
    { name: 'chronically ill',    category: 'health' },
    { name: 'good with kids',     category: 'behavior' },
    { name: 'good with dogs',     category: 'behavior' },
    { name: 'good with cats',     category: 'behavior' },
    { name: 'house trained',      category: 'behavior' },
    { name: 'only pet',           category: 'needs' },
    { name: 'experienced owner',  category: 'needs' },
    { name: 'leash training',     category: 'needs' },
  ]).returning()

  const tagByName = Object.fromEntries(tags.map(t => [t.name, t.id]))

  const [admin, testUser] = await db.insert(schema.user).values([
    {
      name: 'Admin',
      email: 'admin@tierherberge-pfaffenhofen.de',
      role: 'admin',
    },
    {
      name: 'Max Mustermann',
      email: 'max@example.com',
      role: 'user',
    },
  ]).returning()

  const animals = await db.insert(schema.animal).values([
    {
      name: 'Luna',
      species: 'dog',
      breed: 'Labrador Mix',
      age: 36,
      gender: 'female',
      size: 'large',
      weight: '28.50',
      color: 'Black',
      description: 'Luna is an affectionate Labrador mix looking for a loving home. She is very playful and loves long walks.',
      images: [
        'https://picsum.photos/seed/luna1/600/400',
        'https://picsum.photos/seed/luna2/600/400',
      ],
      status: 'available',
      arrivalDate: '2024-11-15',
      isNeutered: true,
      isVaccinated: true,
      isChipped: true,
      goodWithKids: true,
      goodWithDogs: true,
      goodWithCats: false,
      activityLevel: 'high',
      needsGarden: true,
      needsExperiencedOwner: false,
      needsTraining: false,
    },
    {
      name: 'Bello',
      species: 'dog',
      breed: 'German Shepherd',
      age: 60,
      gender: 'male',
      size: 'large',
      weight: '35.00',
      color: 'Brown-Black',
      description: 'Bello is a loyal German Shepherd who needs an experienced owner. He is very intelligent and eager to learn.',
      images: [
        'https://picsum.photos/seed/bello1/600/400',
        'https://picsum.photos/seed/bello2/600/400',
      ],
      status: 'available',
      arrivalDate: '2025-01-10',
      isNeutered: true,
      isVaccinated: true,
      isChipped: true,
      goodWithKids: false,
      goodWithDogs: false,
      goodWithCats: false,
      activityLevel: 'high',
      needsGarden: true,
      needsExperiencedOwner: true,
      needsTraining: true,
    },
    {
      name: 'Mia',
      species: 'cat',
      breed: 'European Shorthair',
      age: 24,
      gender: 'female',
      size: 'small',
      weight: '4.20',
      color: 'Tabby',
      description: 'Mia is a calm cat who loves to cuddle on the sofa. She gets along well with other cats.',
      images: [
        'https://picsum.photos/seed/mia1/600/400',
        'https://picsum.photos/seed/mia2/600/400',
      ],
      status: 'available',
      arrivalDate: '2025-02-20',
      isNeutered: true,
      isVaccinated: true,
      isChipped: true,
      goodWithKids: true,
      goodWithDogs: false,
      goodWithCats: true,
      activityLevel: 'low',
      needsGarden: false,
      needsExperiencedOwner: false,
      needsTraining: false,
    },
    {
      name: 'Felix',
      species: 'cat',
      breed: 'Maine Coon Mix',
      age: 48,
      gender: 'male',
      size: 'medium',
      weight: '6.80',
      color: 'Auburn',
      description: 'Felix is an impressive Maine Coon mix with lots of personality. He loves being the center of attention.',
      images: [
        'https://picsum.photos/seed/felix1/600/400',
      ],
      status: 'reserved',
      arrivalDate: '2024-12-01',
      isNeutered: true,
      isVaccinated: true,
      isChipped: false,
      goodWithKids: true,
      goodWithDogs: false,
      goodWithCats: true,
      activityLevel: 'medium',
      needsGarden: false,
      needsExperiencedOwner: false,
      needsTraining: false,
    },
    {
      name: 'Hoppel',
      species: 'rabbit',
      breed: 'Dwarf Rabbit',
      age: 12,
      gender: 'male',
      size: 'small',
      weight: '1.50',
      color: 'White-Grey',
      description: 'Hoppel is looking for a quiet household. He is happiest with another rabbit for company.',
      images: [
        'https://picsum.photos/seed/hoppel1/600/400',
      ],
      status: 'available',
      arrivalDate: '2025-03-05',
      isNeutered: true,
      isVaccinated: false,
      isChipped: false,
      goodWithKids: false,
      goodWithDogs: false,
      goodWithCats: false,
      activityLevel: 'low',
      needsGarden: false,
      needsExperiencedOwner: false,
      needsTraining: false,
    },
    {
      name: 'Rocky',
      species: 'dog',
      breed: 'Boxer',
      age: 18,
      gender: 'male',
      size: 'large',
      weight: '30.00',
      color: 'Brindle',
      description: 'Rocky is a young energetic Boxer who needs lots of exercise and mental stimulation.',
      images: [
        'https://picsum.photos/seed/rocky1/600/400',
        'https://picsum.photos/seed/rocky2/600/400',
        'https://picsum.photos/seed/rocky3/600/400',
      ],
      status: 'available',
      arrivalDate: '2025-04-01',
      isNeutered: false,
      isVaccinated: true,
      isChipped: true,
      goodWithKids: true,
      goodWithDogs: true,
      goodWithCats: false,
      activityLevel: 'high',
      needsGarden: true,
      needsExperiencedOwner: false,
      needsTraining: true,
    },
  ]).returning()

  const animalByName = Object.fromEntries(animals.map(a => [a.name, a.id]))

  await db.insert(schema.animalTag).values([
    { animalId: animalByName['Luna'],   tagId: tagByName['neutered'] },
    { animalId: animalByName['Luna'],   tagId: tagByName['vaccinated'] },
    { animalId: animalByName['Luna'],   tagId: tagByName['chipped'] },
    { animalId: animalByName['Luna'],   tagId: tagByName['good with kids'] },
    { animalId: animalByName['Bello'],  tagId: tagByName['neutered'] },
    { animalId: animalByName['Bello'],  tagId: tagByName['vaccinated'] },
    { animalId: animalByName['Bello'],  tagId: tagByName['chipped'] },
    { animalId: animalByName['Bello'],  tagId: tagByName['experienced owner'] },
    { animalId: animalByName['Bello'],  tagId: tagByName['leash training'] },
    { animalId: animalByName['Mia'],    tagId: tagByName['neutered'] },
    { animalId: animalByName['Mia'],    tagId: tagByName['vaccinated'] },
    { animalId: animalByName['Mia'],    tagId: tagByName['chipped'] },
    { animalId: animalByName['Mia'],    tagId: tagByName['house trained'] },
    { animalId: animalByName['Felix'],  tagId: tagByName['neutered'] },
    { animalId: animalByName['Felix'],  tagId: tagByName['vaccinated'] },
    { animalId: animalByName['Felix'],  tagId: tagByName['only pet'] },
    { animalId: animalByName['Hoppel'], tagId: tagByName['neutered'] },
    { animalId: animalByName['Rocky'],  tagId: tagByName['vaccinated'] },
    { animalId: animalByName['Rocky'],  tagId: tagByName['chipped'] },
    { animalId: animalByName['Rocky'],  tagId: tagByName['good with kids'] },
    { animalId: animalByName['Rocky'],  tagId: tagByName['leash training'] },
  ])

  await db.insert(schema.favorite).values([
    { userId: testUser.id, animalId: animalByName['Luna'] },
    { userId: testUser.id, animalId: animalByName['Mia'] },
  ])

  console.log('✅ Seed done')
  console.log(`   ${animals.length} animals`)
  console.log(`   ${tags.length} tags`)
  console.log('   2 users (admin + test)')
  await pool.end()
}

main().catch((e) => { console.error(e); process.exit(1) })
