import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { eq } from 'drizzle-orm'
import * as schema from './schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const db = drizzle(pool, { schema })

const images: Record<string, string[]> = {
  Luna: ['/seed-animals/luna-1.jpg', '/seed-animals/luna-2.jpg'],
  Bello: ['/seed-animals/bello-1.jpg', '/seed-animals/bello-2.jpg'],
  Mia: ['/seed-animals/mia-1.jpg', '/seed-animals/mia-2.jpg'],
  Felix: ['/seed-animals/felix-1.jpg'],
  Hoppel: ['/seed-animals/hoppel-1.jpg'],
  Rocky: ['/seed-animals/rocky-1.jpg', '/seed-animals/rocky-2.jpg'],
  Kiwi: ['/seed-animals/kiwi-1.jpg', '/seed-animals/kiwi-2.jpg'],
  Keks: ['/seed-animals/keks-1.jpg'],
  Stachel: ['/seed-animals/stachel-1.jpg', '/seed-animals/stachel-2.jpg'],
}

async function main() {
  for (const [name, urls] of Object.entries(images)) {
    const result = await db
      .update(schema.animal)
      .set({ images: urls })
      .where(eq(schema.animal.name, name))
      .returning({ id: schema.animal.id })
    console.log(name, result.length ? 'updated' : 'NOT FOUND')
  }
  await pool.end()
}

main().catch((e) => { console.error(e); process.exit(1) })
