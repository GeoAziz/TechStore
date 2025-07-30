import React, { useState } from 'react';

interface AITooltipProps {
  message: string;
}

export default function AITooltip({ message }: AITooltipProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <button className="btn btn-neon font-space-mono neon-glow" onClick={() => setShow(!show)}>
        AI Assistant
      </button>
      {show && (
        <div className="absolute left-0 mt-2 w-64 bg-glass p-4 rounded-xl shadow-neon text-white animate-fadeIn border border-neon-blue">
          <p className="font-space-mono text-neon-violet">{message}</p>
        </div>
      )}
    </div>
  );
}
