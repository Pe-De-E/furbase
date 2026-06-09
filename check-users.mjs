import pg from 'pg'
const p = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5433/tierheim' })
const r = await p.query('SELECT name, email, image FROM "user" LIMIT 5')
console.log(JSON.stringify(r.rows, null, 2))
await p.end()
