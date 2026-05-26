import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const backendRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const nodeEnv = (process.env.NODE_ENV || 'development').trim();

const envFiles = [
  join(backendRoot, '.env'),
  join(backendRoot, `.env.${nodeEnv}`),
];

envFiles.forEach((envPath, index) => {
  if (existsSync(envPath)) {
    // .env should win over empty shell exports; env-specific file fills gaps only.
    dotenv.config({ path: envPath, override: index === 0 });
  }
});

// Keep NODE_ENV from the shell/npm script when set (e.g. production deploys).
process.env.NODE_ENV = nodeEnv;
