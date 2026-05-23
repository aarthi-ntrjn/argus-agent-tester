import { z } from 'zod';

export const FeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const AppConfigSchema = z.object({
  name: z.string(),
  install: z.array(z.string()),
  start: z.string(),
  healthCheck: z.string().url(),
  baseUrl: z.string().url(),
  features: z.array(FeatureSchema),
  specsDir: z.string().default('generated-specs'),
});

export type Feature = z.infer<typeof FeatureSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
