import React from 'react';
import { Company } from '../types';
import Card from './Card';
import { CarIcon } from './icons/CarIcon';

interface CompanyInfoCardProps {
    company: Company;
    vehicleCount: number;
    onClick: () => void;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({ company, vehicleCount, onClick }) => {
    return (
        <Card
            className="p-5 transition-transform duration-300 hover:scale-105 hover:border-dark-primary cursor-pointer animate-stagger opacity-0"
            style={{ animationFillMode: 'forwards' }}
            onClick={onClick}
        >
            <div className="flex items-center gap-4 mb-4">
                <img src={company.logoUrl} alt={company.name} className="w-14 h-14 rounded-full" />
                <div>
                    <h3 className="text-lg font-bold text-dark-text">{company.name}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${company.isActive ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                        {company.isActive ? 'Ativa' : 'Pendente'}
                    </span>
                </div>
            </div>
            <div className="pt-4 border-t border-dark-border flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-dark-secondary">
                    <CarIcon className="w-5 h-5" />
                    <span>Veículos em Estoque</span>
                </div>
                <span className="font-bold text-dark-text text-lg">{vehicleCount}</span>
            </div>
        </Card>
    );
};

export default CompanyInfoCard;
