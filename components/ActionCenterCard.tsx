import React from 'react';
import Card from './Card';
import { Vehicle } from '../types';
import { ExclamationIcon } from './icons/ExclamationIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ActionCenterCardProps {
  vehicles: Vehicle[];
  onConfirmDeactivation: (vehicleId: string) => void;
}

const ActionCenterCard: React.FC<ActionCenterCardProps> = ({ vehicles, onConfirmDeactivation }) => {
  return (
    <Card className="p-5 animate-fade-in bg-red-900/40 border-red-500/50">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <ExclamationIcon className="w-6 h-6 text-red-300" />
        </div>
        <div>
            <h3 className="font-bold text-xl text-white">Centro de Ações Urgentes</h3>
            <p className="text-sm text-red-200">Veículos vendidos que precisam ter os anúncios desativados.</p>
        </div>
      </div>

      <div className="space-y-3 overflow-y-auto pr-2 max-h-48">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="w-full flex items-center justify-between gap-3 text-sm p-3 rounded-lg bg-dark-background border border-dark-border text-left"
          >
            <div className="flex items-center gap-3">
              <img src={vehicle.imageUrl} alt={vehicle.model} className="w-12 h-10 object-cover rounded" />
              <div>
                <span className="font-medium text-dark-text block">{vehicle.model}</span>
                <span className="text-xs text-dark-secondary">{vehicle.plate} - Vendido em {new Date(vehicle.saleDate!).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <button 
                onClick={() => onConfirmDeactivation(vehicle.id!)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold text-xs transition-colors"
            >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Confirmar</span>
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActionCenterCard;
