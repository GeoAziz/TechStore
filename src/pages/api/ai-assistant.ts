import type { NextApiRequest, NextApiResponse } from 'next';
import { ai } from '@/ai/genkit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }
  try {
    const response = await ai.chat({ messages: [
      { role: 'user', content: message }
    ] });
    res.status(200).json({ reply: response.choices?.[0]?.message?.content || 'No response.' });
  } catch (error) {
    res.status(500).json({ error: 'AI backend error.' });
  }
}
