import React from 'react';

export default function ParticlesBG() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {/* Example: Add a canvas or SVG for animated particles here */}
      <svg width="100%" height="100%">
        <circle cx="20" cy="20" r="4" fill="#7DF9FF" opacity="0.7">
          <animate attributeName="cx" values="20;400;20" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle cx="200" cy="80" r="3" fill="#9F00FF" opacity="0.5">
          <animate attributeName="cy" values="80;300;80" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="350" cy="200" r="2" fill="#7DF9FF" opacity="0.4">
          <animate attributeName="cy" values="200;50;200" dur="7s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="300" r="5" fill="#9F00FF" opacity="0.6">
          <animate attributeName="cx" values="100;600;100" dur="8s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
