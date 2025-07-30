
"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUGGESTIONS = [
  'Show trending laptops',
  'Track my last order',
  'Recommend me a headset',
  'Show deals on monitors',
];

export default function AiAssistantOverlay() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{type: 'user' | 'ai', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setHistory(h => [...h, { type: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
        const res = await fetch('/api/ai-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'AI backend error.');
        }

        const data = await res.json();
        setHistory(h => [...h, { type: 'ai', text: data.reply || "I couldn't process that." }]);
    } catch (error) {
        setHistory(h => [...h, { type: 'ai', text: error instanceof Error ? error.message : "An unknown error occurred." }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 z-[100] bg-cyan-400/90 hover:bg-cyan-400 text-black rounded-full p-4 shadow-[0_0_24px_#00fff7] border-2 border-cyan-400 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 300 }}
        onClick={() => setOpen(true)}
        aria-label="Open AI Assistant"
      >
        <Bot className="w-7 h-7 animate-pulse" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-md bg-[#10102a] border border-cyan-400/30 rounded-2xl shadow-[0_0_32px_#00fff7] p-6 mx-2 mb-8 md:mb-0"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 180 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-cyan-400 hover:text-cyan-200"
                onClick={() => setOpen(false)}
                aria-label="Close AI Assistant"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                <span className="font-bold text-cyan-200 font-[Orbitron,Space Grotesk,monospace] text-lg">AI Assistant</span>
              </div>
              <div className="min-h-[120px] max-h-48 overflow-y-auto mb-4 space-y-2 text-cyan-100 text-sm font-mono pr-2">
                {history.length === 0 && (
                  <div className="text-cyan-400/70">Ask me anything about Zizo_OrderVerse...</div>
                )}
                {history.map((msg, i) => (
                  <div key={i} className={`whitespace-pre-wrap ${msg.type === 'user' ? 'text-right' : ''}`}>
                    <span className={`inline-block p-2 rounded-lg ${msg.type === 'user' ? 'bg-cyan-900/50' : 'bg-slate-700/50'}`}>
                      {msg.type === 'user' ? '🧑‍🚀' : '🤖'}: {msg.text}
                    </span>
                  </div>
                ))}
                {loading && <div className="text-cyan-400 animate-pulse flex items-center gap-2">🤖: <Loader2 className="w-4 h-4 animate-spin"/></div>}
              </div>
              <div className="flex gap-2 mb-2 flex-wrap">
                {SUGGESTIONS.map(s => (
                  <Button key={s} size="sm" variant="outline" className="border-cyan-400/40 text-cyan-200 hover:bg-cyan-400/10 rounded-full px-3 py-1 text-xs" onClick={() => setInput(s)}>{s}</Button>
                ))}
              </div>
              <form
                className="flex gap-2 mt-2"
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <input
                  className="flex-1 rounded-lg px-3 py-2 bg-[#18182c] border border-cyan-400/30 text-cyan-100 placeholder:text-cyan-400/40 font-mono focus:outline-none focus:border-cyan-400"
                  placeholder="Type your command..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  autoFocus
                  disabled={loading}
                />
                <Button type="submit" className="bg-cyan-400 text-black hover:bg-cyan-300 font-bold px-4 py-2 rounded-lg shadow-[0_0_8px_#00fff7]" disabled={loading} aria-label="Send message">
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
