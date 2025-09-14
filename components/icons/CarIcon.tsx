
import React from 'react';
export const CarIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-6H3l4 6h10zm-5 4a2 2 0 100-4 2 2 0 000 4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 16h14M5 16V8a2 2 0 012-2h10a2 2 0 012 2v8" />
    </svg>
);
