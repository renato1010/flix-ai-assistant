import { z } from 'zod';

const keysSchema = z.object({
  openaiSecretKey: z.string().min(1, 'OpenAI key is required'),
  anthropicSecretKey: z.string().min(1, 'Anthropic secret key is required')
});

const result = keysSchema.safeParse({
  openaiSecretKey: process.env.OPENAI_API_KEY,
  anthropicSecretKey: process.env.ANTHROPIC_API_KEY
});
if (!result.success) {
  console.error('Invalid keys:', result.error.format());
  throw new Error(result.error.message);
}

export const { openaiSecretKey, anthropicSecretKey } = result.data;
