import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverEnvPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');

/**
 * Reload environment variables from server/.env and root .env into process.env
 */
export const reloadEnv = () => {
  const currentEnv = process.env.NODE_ENV;
  if (fs.existsSync(serverEnvPath)) {
    dotenv.config({ path: serverEnvPath, override: true });
  }
  if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath, override: true });
  }
  // Preserve explicit production runtime environment
  if (currentEnv === 'production') {
    process.env.NODE_ENV = 'production';
  }
  return process.env;
};

// Initial synchronous load
reloadEnv();

// Watch server/.env for live hot-reloading on disk saves
if (fs.existsSync(serverEnvPath)) {
  try {
    fs.watchFile(serverEnvPath, { interval: 1000 }, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        reloadEnv();
        console.log(`🔄 [Aaroh Config] server/.env updated on disk (${new Date().toLocaleTimeString()}). Environment variables reloaded.`);
      }
    });
  } catch (err) {
    // Non-blocking watcher error fallback
  }
}

export default process.env;

