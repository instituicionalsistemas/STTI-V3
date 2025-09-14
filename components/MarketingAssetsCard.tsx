import React from 'react';
import Card from './Card';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import { TriadLogo } from './icons/TriadLogo';

interface MarketingAssetsCardProps {
  driveUrl?: string;
}

const MarketingAssetsCard: React.FC<MarketingAssetsCardProps> = ({ driveUrl }) => {
  return (
    <Card className="p-5 animate-fade-in flex flex-col h-full">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-dark-background border border-dark-border flex items-center justify-center">
            <TriadLogo className="w-6 h-6 text-dark-primary" />
        </div>
        <div>
            <h3 className="font-bold text-xl text-dark-text">Recursos de Marketing</h3>
        </div>
      </div>
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        {driveUrl ? (
            <>
                <p className="text-sm text-dark-secondary mb-4">Acesse a pasta compartilhada no Google Drive para baixar os materiais da empresa.</p>
                <a
                    href={driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-300 bg-dark-primary text-dark-background hover:opacity-90"
                >
                    <ExternalLinkIcon className="w-4 h-4" />
                    Abrir Drive
                </a>
            </>
        ) : (
            <p className="text-sm text-center py-4 text-dark-secondary">
                Nenhum link do Google Drive foi configurado pelo gestor da empresa.
            </p>
        )}
      </div>
    </Card>
  );
};

export default MarketingAssetsCard;
