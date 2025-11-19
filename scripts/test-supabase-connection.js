// Script para probar conexión con Supabase
// Ejecutar con: node scripts/test-supabase-connection.js

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Test de Conexión Supabase\n');
console.log('Este script te ayudará a construir tus connection strings.\n');

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('Método 1: Si conoces el Project Reference ID');
  console.log('(Lo encuentras en la URL del dashboard o en Settings > API > Project URL)\n');

  const projectRef = await ask('Ingresa tu Project Reference (ej: abc123xyz456): ');

  if (!projectRef || projectRef.trim() === '') {
    console.log('\n❌ Necesitas el Project Reference ID.');
    console.log('   Ve a: https://supabase.com/dashboard');
    console.log('   Mira la URL de tu proyecto: /project/[AQUI-ESTA-EL-REF]');
    rl.close();
    return;
  }

  console.log('\n¿Recuerdas la contraseña de la base de datos?');
  console.log('(La que configuraste al crear el proyecto)\n');

  const password = await ask('Ingresa tu Database Password: ');

  if (!password || password.trim() === '') {
    console.log('\n❌ Necesitas la contraseña.');
    console.log('   Si la olvidaste, puedes resetearla en:');
    console.log('   Settings > Database > Reset Database Password');
    rl.close();
    return;
  }

  console.log('\n✅ Connection Strings generadas:\n');
  console.log('═'.repeat(80));
  console.log('\nCopia estas líneas a tu archivo .env:\n');

  const databaseUrl = `postgresql://postgres.${projectRef}:${password}@db.${projectRef}.supabase.co:6543/postgres?pgbouncer=true`;
  const directUrl = `postgresql://postgres.${projectRef}:${password}@db.${projectRef}.supabase.co:5432/postgres`;

  console.log(`DATABASE_URL="${databaseUrl}"`);
  console.log(`DIRECT_URL="${directUrl}"`);

  console.log('\n═'.repeat(80));
  console.log('\n✨ Próximos pasos:\n');
  console.log('1. Copia las líneas de arriba al archivo .env');
  console.log('2. Ejecuta: npx prisma generate');
  console.log('3. Ejecuta: npx prisma migrate dev');
  console.log('4. Ejecuta: npx tsx prisma/seed.ts');
  console.log('5. Ejecuta: npm run dev\n');

  rl.close();
}

main().catch(err => {
  console.error('Error:', err);
  rl.close();
});
