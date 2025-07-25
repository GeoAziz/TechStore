
import type { NextApiRequest, NextApiResponse } from 'next';
import { ai } from '@/ai/genkit';
import { NextRequest, NextResponse } from 'next/server';

// Opt out of caching and streaming
export const dynamic = 'force-dynamic';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Next.js Edge API routes use a different request object. 
  // We need to parse the body manually.
  let body;
  try {
    body = await req.json();
  } catch (e) {
    body = req.body; // Fallback for standard serverless functions
  }
  
  const { message } = body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    // A simple prompt to get a futuristic, helpful response.
    const prompt = `You are Zizo, a sci-fi AI assistant for the Zizo OrderVerse e-commerce store. 
    Your personality is helpful, slightly quirky, and very futuristic. 
    A user has asked the following question: "${message}". 
    Provide a concise and helpful response in character. If you don't know the answer, say so in a futuristic way.`;

    const { output } = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.0-flash', // Ensure you are using a valid model
    });
    
    return res.status(200).json({ reply: output || 'Transmission error. Please try again.' });
  } catch (error) {
    console.error("AI backend error:", error);
    return res.status(500).json({ error: 'AI systems are currently offline.' });
  }
}


// This is the new way to define API routes in Next.js App Router.
// Since the file is in `src/pages/api`, it uses the old `pages` directory convention.
// Let's create it the standard way for `/pages/api`
export default async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }
    try {
      // Re-using the prompt logic from above.
      const prompt = `You are Zizo, a sci-fi AI assistant for the Zizo OrderVerse e-commerce store. 
      Your personality is helpful, slightly quirky, and very futuristic. 
      A user has asked the following question: "${message}". 
      Provide a concise and helpful response in character. If you don't know the answer, say so in a futuristic way.`;

      const { output } = await ai.generate({ prompt });

      res.status(200).json({ reply: output || 'AI systems are currently offline. Please try again later.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error communicating with AI service.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

    