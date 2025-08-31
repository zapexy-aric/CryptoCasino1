import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from './server/db';

async function main() {
  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('Migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

main();
