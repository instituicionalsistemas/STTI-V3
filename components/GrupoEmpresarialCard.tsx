
import React from 'react';
import { GrupoEmpresarial } from '../types';
import Card from './Card';
import { PencilIcon } from './icons/PencilIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface GrupoEmpresarialCardProps {
    grupo: GrupoEmpresarial;
    onManage: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onStatusChange: (e: React.MouseEvent) => void;
}

const GrupoEmpresarialCard: React.FC<GrupoEmpresarialCardProps> = ({ grupo, onManage, onEdit, onStatusChange }) => {
    return (
        <Card
            className={`flex flex-col transition-all duration-300 hover:scale-105 hover:border-dark-primary cursor-pointer animate-stagger opacity-0 group ${!grupo.isActive ? 'opacity-60 hover:opacity-80' : ''}`}
            style={{ animationFillMode: 'forwards' }}
            onClick={onManage}
        >
            <div className="relative h-32 w-full overflow-hidden rounded-t-2xl bg-dark-background">
                <img src={grupo.bannerUrl} alt={`Banner de ${grupo.name}`} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${grupo.isActive 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'}`}>
                        {grupo.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                </div>
                <button 
                    onClick={onEdit}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Editar Grupo"
                >
                    <PencilIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold text-dark-text truncate">{grupo.name}</h3>
                </div>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-dark-border">
                    <div className="flex items-center gap-3">
                        <img src={grupo.responsiblePhotoUrl} alt={grupo.responsibleName} className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="text-xs text-dark-secondary">Responsável</p>
                            <p className="font-semibold text-dark-text">{grupo.responsibleName}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 text-dark-secondary text-sm">
                        <BriefcaseIcon className="w-5 h-5" />
                        <span className="font-bold text-dark-text">{grupo.companyIds.length}</span>
                    </div>
                </div>
                 <div className="flex items-center justify-between pt-3 mt-3 border-t border-dark-border">
                    <span className="text-sm font-semibold">Status do Grupo:</span>
                    {/* FIX: Moved onStatusChange to the label's onClick and made the input readOnly to fix type mismatch and ensure correct behavior. */}
                    <label htmlFor={`toggle-group-${grupo.id}`} className="flex items-center cursor-pointer" onClick={onStatusChange}>
                        <div className="relative">
                            <input type="checkbox" id={`toggle-group-${grupo.id}`} className="sr-only peer" checked={grupo.isActive} readOnly />
                            <div className="w-10 h-5 bg-dark-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-dark-primary"></div>
                        </div>
                    </label>
                </div>
            </div>
        </Card>
    );
};

export default GrupoEmpresarialCard;
