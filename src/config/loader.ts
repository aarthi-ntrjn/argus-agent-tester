import { readFile } from 'fs/promises';
import { AppConfig, AppConfigSchema } from './types.js';

export async function loadConfig(configPath: string): Promise<AppConfig> {
  const raw = await readFile(configPath, 'utf-8');
  const parsed = JSON.parse(raw);
  return AppConfigSchema.parse(parsed);
}
