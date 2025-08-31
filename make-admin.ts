import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

const username = process.argv[2];

if (!username) {
  console.error('Please provide a username.');
  process.exit(1);
}

async function makeAdmin() {
  try {
    const result = await db.update(users).set({ role: 'admin' }).where(eq(users.username, username)).returning();
    if (result.length === 0) {
      console.log(`User with username "${username}" not found.`);
    } else {
      console.log(`User "${username}" has been granted admin privileges.`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Error making user admin:', error);
    process.exit(1);
  }
}

makeAdmin();
