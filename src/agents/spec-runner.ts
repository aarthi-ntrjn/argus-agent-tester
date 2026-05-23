import { spawn } from 'child_process';
import { log } from '../utils/logger.js';

export interface RunResult {
  passed: boolean;
  exitCode: number;
}

export async function runSpecRunner(specsDir: string): Promise<RunResult> {
  log.step('Spec Runner');
  log.info(`Running specs from: ${specsDir}`);

  return new Promise((resolve) => {
    const proc = spawn(
      'npx',
      ['playwright', 'test', specsDir, '--reporter=list'],
      { stdio: 'inherit', shell: true },
    );

    proc.on('close', (code) => {
      const exitCode = code ?? 1;
      const passed = exitCode === 0;

      if (passed) {
        log.success('All specs passed');
      } else {
        log.error(`Specs failed with exit code ${exitCode}`);
      }

      resolve({ passed, exitCode });
    });

    proc.on('error', (err) => {
      log.error(`Playwright runner error: ${err.message}`);
      resolve({ passed: false, exitCode: 1 });
    });
  });
}
