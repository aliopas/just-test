// Test setup file
// Load environment variables for tests
import dotenv from 'dotenv';
import path from 'path';

// Load .env.test if exists, otherwise .env
dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
});
dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

