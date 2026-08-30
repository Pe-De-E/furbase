import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

async function main() {
  // Managed Postgres hosts (Render, Heroku, ...) require SSL on external
  // connections but use certs Node's default CA store won't trust — plain
  // sslmode=require in the URL still gets rejected. Only relevant for
  // hosted DBs; local dev never runs this script.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  const db = drizzle(pool)
  await migrate(db, { migrationsFolder: './migrations' })
  console.log('Migrations applied')
  await pool.end()
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
