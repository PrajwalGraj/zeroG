import React from 'react';

export const TechBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Soft beige gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #F7F3EE 0%, #F4EFEA 100%)',
        }}
      />
      
      {/* Ultra-faint dotted grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.03) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
      
      {/* Subtle geometric lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.05 }}
      >
        <defs>
          <pattern id="tech-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Horizontal lines */}
            <line x1="0" y1="50" x2="200" y2="50" stroke="currentColor" strokeWidth="0.5" />
            <line x1="0" y1="150" x2="200" y2="150" stroke="currentColor" strokeWidth="0.5" />
            
            {/* Vertical lines */}
            <line x1="50" y1="0" x2="50" y2="200" stroke="currentColor" strokeWidth="0.5" />
            <line x1="150" y1="0" x2="150" y2="200" stroke="currentColor" strokeWidth="0.5" />
            
            {/* Diagonal accent */}
            <line x1="0" y1="0" x2="40" y2="40" stroke="currentColor" strokeWidth="0.5" />
            <line x1="160" y1="160" x2="200" y2="200" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tech-pattern)" />
      </svg>
    </div>
  );
};
