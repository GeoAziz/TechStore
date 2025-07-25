import React from 'react';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center gap-2 text-neon-blue py-2">
      {items.map((item, idx) => (
        <span key={item.href}>
          <a href={item.href} className="hover:underline neon-glow font-space-mono transition-all duration-200">{item.label}</a>
          {idx < items.length - 1 && <span className="mx-2 text-neon-violet">/</span>}
        </span>
      ))}
    </nav>
  );
}
