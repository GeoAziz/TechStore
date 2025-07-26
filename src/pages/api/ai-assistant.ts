
import type { NextApiRequest, NextApiResponse } from 'next';
import { ai } from '@/ai/genkit';
import { generate } from 'genkit/ai';

// Ensure you have a 'googleai/gemini-1.5-flash-latest' or similar model configured in your genkit setup
// Example in src/ai/genkit.ts:
// export const ai = genkit({ plugins: [googleAI()], model: 'googleai/gemini-1.5-flash-latest' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'No valid message provided' });
  }

  try {
    const { output } = await generate({
      prompt: `You are an AI assistant for an e-commerce store called Zizo_OrderVerse. 
               Your persona is a helpful, slightly futuristic AI. Keep responses concise and helpful.
               User query: "${message}"`,
      model: 'googleai/gemini-1.5-flash-latest',
      // You can add tools here for analytics, order tracking, etc. in the future.
    });
    
    const reply = output();
    if (!reply) {
        return res.status(500).json({ error: 'AI did not return a response.' });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('AI assistant API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    res.status(500).json({ error: `AI backend error: ${errorMessage}` });
  }
}
