// prisma-setup.js
import { execSync } from 'child_process';

execSync(`DATABASE_URL="${process.env.DATABASE_URL}" npx prisma generate`, {
  stdio: 'inherit',
});
