import { spawn } from 'child_process';
import { AppConfig } from '../config/types.js';
import { log } from '../utils/logger.js';
import { waitForHealthCheck } from '../utils/health-check.js';

export interface InstallResult {
  process: ReturnType<typeof spawn>;
}

export async function runInstallAgent(config: AppConfig, cwd: string): Promise<InstallResult> {
  log.step('Install Agent');

  for (const cmd of config.install) {
    log.info(`Running: ${cmd}`);
    await runCommand(cmd, cwd);
  }

  log.step('Starting application');
  log.info(`Command: ${config.start}`);

  const [bin, ...args] = config.start.split(' ');
  const appProcess = spawn(bin, args, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  appProcess.on('error', (err) => {
    log.error(`Failed to start app: ${err.message}`);
  });

  log.info(`Waiting for health check at ${config.healthCheck}`);
  await waitForHealthCheck(config.healthCheck);

  return { process: appProcess };
}

function runCommand(cmd: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, { cwd, stdio: 'inherit', shell: true });
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${cmd}" exited with code ${code}`));
      }
    });
    proc.on('error', reject);
  });
}
