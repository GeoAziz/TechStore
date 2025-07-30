// --- CustomizerAI Component ---
// src/components/customizer/CustomizerAI.tsx
import React, { useState } from 'react';
import { getCompatibilityReport, getCustomizerSuggestions } from '@/lib/firestore-service';

export default function CustomizerAI({ selectedProductIds }: { selectedProductIds: string[] }) {
  const [compatibility, setCompatibility] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');

  const handleCheckCompatibility = async () => {
    setLoading(true);
    const result = await getCompatibilityReport(selectedProductIds);
    setCompatibility(result);
    setLoading(false);
  };

  const handleGetSuggestions = async () => {
    setLoading(true);
    const result = await getCustomizerSuggestions(input);
    setSuggestions(result);
    setLoading(false);
  };

  return (
    <div className="bg-[#18182c]/80 p-4 rounded-xl shadow-lg text-cyan-100">
      <h2 className="font-bold text-lg mb-2">AI Customizer & Compatibility</h2>
      <button onClick={handleCheckCompatibility} disabled={loading} className="bg-cyan-400/20 px-4 py-2 rounded mb-2">Check Compatibility</button>
      {compatibility && <pre className="bg-black/30 p-2 rounded text-xs mt-2">{JSON.stringify(compatibility, null, 2)}</pre>}
      <div className="mt-4">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Describe your build..." className="bg-[#10102a] border-cyan-400/30 px-2 py-1 rounded w-full mb-2" />
        <button onClick={handleGetSuggestions} disabled={loading} className="bg-cyan-400/20 px-4 py-2 rounded">Get AI Suggestions</button>
        {suggestions && <pre className="bg-black/30 p-2 rounded text-xs mt-2">{JSON.stringify(suggestions, null, 2)}</pre>}
      </div>
      {loading && <div className="mt-2 text-pink-400 animate-pulse">Loading AI...</div>}
    </div>
  );
}