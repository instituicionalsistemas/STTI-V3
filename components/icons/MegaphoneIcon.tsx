import React from 'react';

export const MegaphoneIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.584C18.354 1.832 18 3.65 18 5.5c0 1.606.348 3.112.964 4.508l-2.752 2.752M7 6v7.732a4.001 4.001 0 002.768 3.736l3.68.863c.44.104.863.228 1.28.384a4.001 4.001 0 003.45-1.576l1.3-2.296" />
    </svg>
);