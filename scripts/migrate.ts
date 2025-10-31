import fs from 'node:fs'
import path from 'node:path'

async function run() {
  const migrationsDir = path.resolve(process.cwd(), 'supabase/sql')
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  if (files.length === 0) {
    console.log('No SQL files found in supabase/sql')
    return
  }

  const databaseUrl = process.env.SUPABASE_DB_URL
  const dryRun = !databaseUrl

  if (dryRun) {
    console.log('SUPABASE_DB_URL not set. Printing SQL concatenation for manual execution.\n')
  } else {
    console.log(`Applying migrations to ${databaseUrl}\n`)
  }

  const statements = files.map((file) => {
    const filePath = path.join(migrationsDir, file)
    const sql = fs.readFileSync(filePath, 'utf8')
    return { file, sql }
  })

  if (dryRun) {
    for (const statement of statements) {
      console.log(`-- ${statement.file} -------------------------`)
      console.log(statement.sql.trim())
      console.log()
    }
    console.log('Set SUPABASE_DB_URL to apply automatically.')
    return
  }

  const { Client } = await import('pg')
  const client = new Client({ connectionString: databaseUrl })
  await client.connect()

  try {
    for (const statement of statements) {
      console.log(`Applying ${statement.file}...`)
      await client.query(statement.sql)
    }
    console.log('\nMigrations applied successfully.')
  } finally {
    await client.end()
  }
}

run().catch((error) => {
  console.error('Migration failed:', error)
  process.exit(1)
})
