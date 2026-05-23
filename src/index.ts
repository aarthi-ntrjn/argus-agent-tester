import { Command } from 'commander';
import { resolve, join } from 'path';
import { loadConfig } from './config/loader.js';
import { runInstallAgent } from './agents/install-agent.js';
import { runSpecGenerator } from './agents/spec-generator.js';
import { runSpecRunner } from './agents/spec-runner.js';
import { log } from './utils/logger.js';

const program = new Command();

program
  .name('argus-agent-tester')
  .description('AI-driven spec generation and test execution for any web application')
  .version('0.1.0');

program
  .command('generate')
  .description('Generate Playwright specs from app config using Claude')
  .argument('<config>', 'Path to app-config.json')
  .action(async (configPath: string) => {
    const config = await loadConfig(resolve(configPath));
    const outputDir = join(resolve(configPath), '..', config.specsDir);
    await runSpecGenerator(config, outputDir);
  });

program
  .command('run')
  .description('Run previously generated Playwright specs')
  .argument('<config>', 'Path to app-config.json')
  .option('--install', 'Run install agent before executing specs')
  .option('--app-dir <dir>', 'Working directory of the target app')
  .action(async (configPath: string, options: { install?: boolean; appDir?: string }) => {
    const config = await loadConfig(resolve(configPath));
    const specsDir = join(resolve(configPath), '..', config.specsDir);

    if (options.install) {
      const appDir = options.appDir ? resolve(options.appDir) : process.cwd();
      const { process: appProcess } = await runInstallAgent(config, appDir);

      process.on('exit', () => appProcess.kill());
      process.on('SIGINT', () => {
        appProcess.kill();
        process.exit(0);
      });
    }

    const result = await runSpecRunner(specsDir);
    process.exit(result.exitCode);
  });

program
  .command('test')
  .description('Generate specs then immediately run them (full pipeline)')
  .argument('<config>', 'Path to app-config.json')
  .option('--install', 'Run install agent before executing specs')
  .option('--app-dir <dir>', 'Working directory of the target app')
  .action(async (configPath: string, options: { install?: boolean; appDir?: string }) => {
    const config = await loadConfig(resolve(configPath));
    const specsDir = join(resolve(configPath), '..', config.specsDir);

    if (options.install) {
      const appDir = options.appDir ? resolve(options.appDir) : process.cwd();
      const { process: appProcess } = await runInstallAgent(config, appDir);

      process.on('exit', () => appProcess.kill());
      process.on('SIGINT', () => {
        appProcess.kill();
        process.exit(0);
      });
    }

    log.info(`Generating specs for: ${config.name}`);
    await runSpecGenerator(config, specsDir);

    const result = await runSpecRunner(specsDir);
    process.exit(result.exitCode);
  });

program.parse();
