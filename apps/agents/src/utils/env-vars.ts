import { z } from 'zod';

// use zod schems to validate the env vars

// create an object with all env vars used in other modules
const envVarsSchema = z.object({
  DATABASE_URL: z.string().describe('MongoDB Atlas connection string'),
  OPENAI_API_KEY: z.string().describe('OpenAI API key'),
  ANTHROPIC_API_KEY: z.string().describe('Anthropic API key'),
  DIRECT_DATABASE_URL: z.string().describe('Direct MongoDB Atlas connection string')
});

const envVars = envVarsSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL
});

if (!envVars.success) {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Invalid environment variables:', envVars.error.format());
  }
  throw new Error('Missing environment variables');
}
export const { DATABASE_URL, OPENAI_API_KEY, ANTHROPIC_API_KEY, DIRECT_DATABASE_URL } =
  envVars.data;
