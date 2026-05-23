import Anthropic from '@anthropic-ai/sdk';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { AppConfig, Feature } from '../config/types.js';
import { log } from '../utils/logger.js';

const client = new Anthropic();

export async function runSpecGenerator(config: AppConfig, outputDir: string): Promise<string[]> {
  log.step('Spec Generator');

  await mkdir(outputDir, { recursive: true });

  const generatedFiles: string[] = [];

  for (const feature of config.features) {
    log.info(`Generating spec: ${feature.name}`);
    const specContent = await generateSpec(config, feature);
    const fileName = toSpecFileName(feature.name);
    const filePath = join(outputDir, fileName);
    await writeFile(filePath, specContent, 'utf-8');
    log.success(`Written: ${filePath}`);
    generatedFiles.push(filePath);
  }

  return generatedFiles;
}

async function generateSpec(config: AppConfig, feature: Feature): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildPrompt(config, feature),
      },
    ],
  });

  const text = response.content.find((b) => b.type === 'text')?.text ?? '';
  return extractCodeBlock(text);
}

function buildPrompt(config: AppConfig, feature: Feature): string {
  return `
Application: ${config.name}
Base URL: ${config.baseUrl}

Feature to test:
Name: ${feature.name}
Description: ${feature.description}

Generate a complete Playwright test file for this feature. The test must be self-contained and runnable with \`npx playwright test\`.
`.trim();
}

function extractCodeBlock(text: string): string {
  const match = text.match(/```(?:typescript|ts)?\n([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

function toSpecFileName(featureName: string): string {
  return (
    featureName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '.spec.ts'
  );
}

const SYSTEM_PROMPT = `
You are an expert Playwright test engineer. Given a feature description and base URL, generate a single complete Playwright TypeScript test file.

Rules:
- Use @playwright/test imports only
- Use descriptive test and step names
- Assert on visible outcomes, not implementation details
- Use page.getByRole, page.getByLabel, page.getByText over CSS selectors
- Include a test for the happy path and at least one edge case
- Do not use any external dependencies beyond @playwright/test
- Output only a TypeScript code block, no explanation
`.trim();
