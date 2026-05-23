import { log } from './logger.js';

const POLL_INTERVAL_MS = 1000;

export async function waitForHealthCheck(
  url: string,
  timeoutMs: number = 30_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastError = '';

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        log.success(`Health check passed: ${url}`);
        return;
      }
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = (err as Error).message;
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(`Health check timed out after ${timeoutMs}ms. Last error: ${lastError}`);
}
