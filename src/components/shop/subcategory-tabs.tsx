import React, { useState } from 'react';
import { motion } from 'framer-motion';

const subcategories = [
  'All',
  'Laptops',
  'Phones',
  'Accessories',
  'Wearables',
  'Audio',
];

export default function SubcategoryTabs({ onSelect }) {
  const [active, setActive] = useState('All');
  return (
    <div className="flex gap-2 py-4 px-2 bg-glass rounded-xl shadow-neon overflow-x-auto">
      {subcategories.map(sub => (
        <motion.button
          key={sub}
          whileHover={{ scale: 1.08, boxShadow: '0 0 12px #7DF9FF' }}
          className={`px-4 py-2 font-space-mono rounded-lg transition-colors duration-200 ${active === sub ? 'bg-neon-blue text-black shadow-neon' : 'bg-slate-800 text-white'}`}
          onClick={() => { setActive(sub); onSelect(sub); }}
        >
          {sub}
        </motion.button>
      ))}
    </div>
  );
}
