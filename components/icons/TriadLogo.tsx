import React from 'react';

export const TriadLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
    <div className={`${className} relative group transition-transform duration-300 ease-in-out hover:scale-110`}>
        {/* The glow effect element */}
        <div 
            className="absolute -inset-0.5 bg-dark-primary rounded-full blur-lg opacity-60 group-hover:opacity-80 group-hover:blur-xl transition-all duration-300"
            aria-hidden="true"
        />
        {/* The actual logo image */}
        <img 
            src="https://aisfizoyfpcisykarrnt.supabase.co/storage/v1/object/public/imagens/LOGO%20TRIAD3%20.png"
            alt="Triad3 Logo"
            className="relative w-full h-full rounded-full object-cover"
        />
    </div>
);