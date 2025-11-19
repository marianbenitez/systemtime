require('dotenv').config();

console.log('Current directory:', process.cwd());
console.log('DATABASE_URL defined:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL.substring(0, 15) + '...');
}
console.log('DIRECT_URL defined:', !!process.env.DIRECT_URL);
