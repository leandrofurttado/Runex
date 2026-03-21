/**
 * Executa a migração do Supabase.
 * Requer: SUPABASE_DB_PASSWORD no .env (senha do postgres)
 * Ou: SUPABASE_DB_URL completa no .env
 *
 * A senha está em: Supabase Dashboard > Settings > Database > Connection string
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PROJECT_REF = 'wsmxszwuphopjpcryxcr';
const DB_URL = process.env.SUPABASE_DB_URL ||
  `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

async function run() {
  if (!process.env.SUPABASE_DB_PASSWORD && !process.env.SUPABASE_DB_URL) {
    console.error('\n❌ Erro: Adicione SUPABASE_DB_PASSWORD no .env');
    console.error('   Obtenha em: https://supabase.com/dashboard/project/' + PROJECT_REF + '/settings/database');
    console.error('   Ou use SUPABASE_DB_URL com a connection string completa.\n');
    process.exit(1);
  }

  const pg = await import('pg');
  const client = new pg.default.Client({ connectionString: DB_URL });

  try {
    await client.connect();
    const sqlPath = path.join(__dirname, '../supabase/migrations/20240320000000_init_profiles.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sql);
    console.log('\n✅ Migração executada com sucesso!\n');
  } catch (err) {
    console.error('\n❌ Erro na migração:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
