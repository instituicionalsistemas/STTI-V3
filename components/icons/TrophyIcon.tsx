import React from 'react';

export const TrophyIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 4v8a5 5 0 01-10 0V4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 9a2 2 0 104 0a2 2 0 10-4 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9a2 2 0 104 0a2 2 0 10-4 0" />
    </svg>
);
