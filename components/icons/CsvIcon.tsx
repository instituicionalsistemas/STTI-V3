import React from 'react';

export const CsvIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h1M4 10h1M4 14h1M20 6h-1M20 10h-1M20 14h-1" />
    </svg>
);