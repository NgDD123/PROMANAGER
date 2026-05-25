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

for (const envPath of envFiles) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

// Keep NODE_ENV from the shell/npm script when set (e.g. production deploys).
process.env.NODE_ENV = nodeEnv;
