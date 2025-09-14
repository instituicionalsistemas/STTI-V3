import React, { useState } from 'react';
import type { Vehicle, TeamMember, Company } from '../types';
import Card from './Card';
import { getDaysRemaining, getDaysInStock } from '../utils/dateUtils';
import { formatCurrency, calculateDailyLoss, calculateTotalLoss } from '../utils/calculationUtils';
import { CalendarIcon } from './icons/CalendarIcon';
import { CarIcon } from './icons/CarIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UserAddIcon } from './icons/UserAddIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { StarIcon } from './icons/StarIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { useData } from '../hooks/useMockData';


interface VehicleCardProps {
  id?: string;
  vehicle: Vehicle;
  company: Company;
  salesperson?: TeamMember;
  isSoldView?: boolean;
  isHighlighted?: boolean;
  isSalespersonView?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAssign?: () => void;
  onMarkAsSold?: () => void;
  onTogglePriority?: () => void;
  onImageClick?: () => void;
  style?: React.CSSProperties;
}

const ProgressBar: React.FC<{ daysLeft: number; goalDays: number }> = ({ daysLeft, goalDays }) => {
  const percentage = Math.max(0, (daysLeft / goalDays) * 100);
  let colorClass = 'bg-green-500';
  if (percentage <= 50 && percentage > 25) {
    colorClass = 'bg-yellow-500';
  } else if (percentage <= 25) {
    colorClass = 'bg-red-500';
  }

  return (
    <div className="w-full bg-dark-border rounded-full h-2.5">
      <div
        className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const IpvaStatus: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
    if (!vehicle.ipvaDueDate || !vehicle.ipvaCost) {
        return null;
    }

    const dueDate = new Date(vehicle.ipvaDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: 'overdue' | 'due_soon' | 'ok' = 'ok';
    let text = `IPVA em dia`;
    let colorClasses = 'text-green-400 bg-green-500/10 border-green-500/20';

    if (diffDays < 0) {
        status = 'overdue';
        text = 'IPVA Vencido';
        colorClasses = 'text-red-400 bg-red-500/10 border-red-500/20';
    } else if (diffDays <= 30) {
        status = 'due_soon';
        text = `IPVA vence em ${diffDays} dia(s)`;
        colorClasses = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }

    return (
        <div className={`flex items-center justify-between p-3 mt-4 rounded-lg border ${colorClasses}`}>
            <div className="flex items-center gap-3">
                <DocumentTextIcon className="w-5 h-5" />
                <div>
                    <p className="font-bold text-sm">{text}</p>
                    <p className="text-xs opacity-80">
                        {new Date(vehicle.ipvaDueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                    </p>
                </div>
            </div>
            <span className="font-bold text-sm">{formatCurrency(vehicle.ipvaCost)}</span>
        </div>
    );
};

const fieldLabels: Record<keyof Vehicle, string> = {
    modelYear: 'Ano/Modelo',
    fabricationYear: 'Ano Fabricação',
    renavam: 'RENAVAM',
    mileage: 'Quilometragem',
    fuelType: 'Combustível',
    transmission: 'Câmbio',
    traction: 'Tração',
    doors: 'Nº de Portas',
    occupants: 'Nº de Ocupantes',
    chassis: 'Chassi',
    history: 'Histórico',
    revisions: 'Revisões',
    standardItems: 'Itens de Série',
    additionalAccessories: 'Acessórios Adicionais',
    documentStatus: 'Situação Documental',
    // Fields from Vehicle interface that don't have a label.
    // They are here to satisfy TypeScript's Record type.
    id: '',
    companyId: '',
    brand: '', 
    model: '', 
    category: '', 
    color: '', 
    plate: '', 
    purchasePrice: '',
    announcedPrice: '',
    discount: '',
    entryDate: '', 
    dailyCost: '',
    saleGoalDays: '',
    adCost: '',
    salespersonId: '',
    imageUrl: '',
    status: '',
    saleDate: '',
    description: '',
    ipvaDueDate: '',
    ipvaCost: '',
    isPriority: '',
    isAdActive: '',
    maintenance: '',
};

const AdditionalDetails: React.FC<{ vehicle: Vehicle; visibleFields: (keyof Vehicle)[] }> = ({ vehicle, visibleFields }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const detailsToShow = visibleFields.map(key => {
        const value = vehicle[key];
        return value ? { label: fieldLabels[key], value } : null;
    }).filter(Boolean);

    if (detailsToShow.length === 0) return null;

    return (
        <div className="pt-4 mt-4 border-t border-dark-border text-sm">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center text-dark-primary font-semibold hover:underline"
            >
                <span>Ver mais detalhes</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {isExpanded && (
                <div className="mt-2 space-y-2 animate-fade-in">
                    {detailsToShow.map(detail => (
                        <div key={detail!.label} className="grid grid-cols-2 gap-2 text-dark-secondary">
                            <span className="font-semibold">{detail!.label}:</span>
                            <span className="text-dark-text text-right truncate" title={String(detail!.value)}>{String(detail!.value)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const VehicleCard: React.FC<VehicleCardProps> = ({ id, vehicle, company, salesperson, isSoldView = false, isHighlighted = false, onEdit, onDelete, onAssign, onMarkAsSold, onTogglePriority, onImageClick, style, isSalespersonView = false }) => {
  const { maintenanceRecords } = useData();
  const [showDescription, setShowDescription] = useState(false);
  const daysRemaining = getDaysRemaining(vehicle.entryDate, vehicle.saleGoalDays);
  const vehicleMaintenance = maintenanceRecords.filter(r => r.vehicleId === vehicle.id);
  const totalMaintenanceCost = vehicleMaintenance.reduce((sum, record) => sum + record.cost, 0);
  const dailyLoss = calculateDailyLoss(vehicle);
  const totalLoss = calculateTotalLoss(vehicle);


  return (
    <Card 
        id={id}
        className={`flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:border-dark-primary/50 animate-stagger opacity-0 ${isHighlighted ? 'border-dark-primary ring-2 ring-dark-primary ring-offset-2 ring-offset-dark-background' : ''}`}
        style={style}
    >
      <div>
        <div 
          className={`relative group ${onImageClick ? 'cursor-pointer' : ''}`}
          onClick={onImageClick}
        >
          <div className={`h-48 w-full overflow-hidden rounded-t-2xl bg-dark-background flex items-center justify-center ${isSoldView ? 'opacity-50' : ''}`}>
            {vehicle.imageUrl ? (
              <img src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
            ) : (
                <CarIcon className="w-12 h-12 text-dark-secondary" />
            )}
          </div>
          {isSoldView && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-t-2xl">
              <div className="flex flex-col items-center gap-2 text-white">
                <CheckCircleIcon className="w-10 h-10" />
                <span className="text-xl font-bold tracking-wider uppercase">Vendido</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-dark-primary">{`${vehicle.brand} ${vehicle.model}`}</h3>
                <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-dark-secondary">{vehicle.plate} - {vehicle.color}</p>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                        <div className={`w-2 h-2 rounded-full ${vehicle.isAdActive ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                        <span className={`${vehicle.isAdActive ? 'text-green-400' : 'text-gray-500'}`}>
                            {vehicle.isAdActive ? 'Anúncio Ativo' : 'Anúncio Inativo'}
                        </span>
                    </div>
                </div>
              </div>
              {!isSoldView && !isSalespersonView && (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={onTogglePriority} 
                    className={`p-2 rounded-full transition-colors ${vehicle.isPriority ? 'text-yellow-400 hover:bg-yellow-500/20' : 'text-dark-secondary hover:bg-dark-border'}`}
                    title={vehicle.isPriority ? "Remover de Prioritários" : "Marcar como Prioritário"}
                  >
                    <StarIcon className={`w-5 h-5 ${vehicle.isPriority ? 'fill-current' : 'fill-none stroke-current'}`} />
                  </button>
                  <button onClick={onEdit} className="p-2 rounded-full text-dark-secondary hover:bg-dark-border transition-colors"><PencilIcon className="w-4 h-4" /></button>
                  <button onClick={onDelete} className="p-2 rounded-full text-red-500/70 hover:bg-dark-border hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            {!isSoldView && <IpvaStatus vehicle={vehicle} />}

            <div className="space-y-3 text-sm mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-dark-secondary flex items-center gap-1.5"><DollarSignIcon className="w-4 h-4"/>Preço Anunciado:</span>
                {vehicle.discount > 0 ? (
                  <div className="text-right">
                    <span className="text-xs text-dark-secondary line-through">{formatCurrency(vehicle.announcedPrice)}</span>
                    <span className="font-bold text-lg text-dark-primary block">{formatCurrency(vehicle.announcedPrice - vehicle.discount)}</span>
                  </div>
                ) : (
                  <span className="font-semibold text-lg">{formatCurrency(vehicle.announcedPrice)}</span>
                )}
              </div>
               <div className="flex justify-between items-center">
                <span className="font-medium text-dark-secondary flex items-center gap-1.5"><DollarSignIcon className="w-4 h-4"/>Custo Diário:</span>
                <span className="font-semibold">{formatCurrency(vehicle.dailyCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-dark-secondary flex items-center gap-1.5"><DollarSignIcon className="w-4 h-4"/>Custo Anúncio (Total):</span>
                <span className="font-semibold">{formatCurrency(vehicle.adCost)}</span>
              </div>
              {totalMaintenanceCost > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-dark-secondary flex items-center gap-1.5"><DollarSignIcon className="w-4 h-4"/>Custo Manutenção:</span>
                  <span className="font-semibold">{formatCurrency(totalMaintenanceCost)}</span>
                </div>
              )}
            </div>
            
            {dailyLoss > 0 && !isSoldView && (
                <div className="pt-3 mt-3 border-t border-dark-border/50 space-y-2 text-sm">
                    <div className="flex justify-between items-center text-yellow-400/90">
                        <span className="font-medium flex items-center gap-1.5"><DollarSignIcon className="w-4 h-4"/>Prejuízo Diário:</span>
                        <span className="font-semibold">{formatCurrency(dailyLoss)}</span>
                    </div>
                    <div className="flex justify-between items-center text-red-400">
                        <span className="font-medium flex items-center gap-1.5"><DollarSignIcon className="w-4 h-4"/>Prejuízo Acumulado:</span>
                        <span className="font-bold">{formatCurrency(totalLoss)}</span>
                    </div>
                </div>
            )}


            {vehicle.description && (
                <div className="pt-4 mt-4 border-t border-dark-border text-sm">
                    <div className={`text-dark-secondary transition-all duration-300 ease-in-out ${!showDescription ? 'max-h-12 overflow-hidden' : 'max-h-96'}`}>
                        <span className="font-semibold text-dark-text block mb-1">Descrição do anúncio:</span>
                        <p className="whitespace-pre-wrap">{vehicle.description}</p>
                    </div>
                    {vehicle.description.length > 100 && ( 
                        <button
                            onClick={() => setShowDescription(!showDescription)}
                            className="text-dark-primary font-semibold hover:underline mt-1 text-xs"
                        >
                            {showDescription ? 'Mostrar menos' : 'Mostrar mais'}
                        </button>
                    )}
                </div>
            )}

            <AdditionalDetails vehicle={vehicle} visibleFields={company.visibleFields || []} />


            {salesperson && (
                <div className="flex items-center gap-3 pt-4 border-t border-dark-border mt-4">
                    <img src={salesperson.avatarUrl} alt={salesperson.name} className="w-8 h-8 rounded-full" />
                    <div>
                        <p className="text-xs text-dark-secondary">{isSoldView ? 'Vendido por' : 'Vendedor Atribuído'}</p>
                        <p className="font-semibold text-dark-text">{salesperson.name}</p>
                    </div>
                </div>
            )}

            {isSoldView && vehicle.saleDate && (
              <div className="mt-6 pt-3 border-t border-dark-border">
                  <div className="flex justify-center items-center text-sm">
                      <span className="font-medium text-dark-secondary mr-2">Vendido em:</span>
                      <span className="font-bold text-dark-text">{new Date(vehicle.saleDate).toLocaleDateString('pt-BR')}</span>
                  </div>
              </div>
            )}

            {!isSoldView && (
              <>
                <div className="flex justify-between items-center text-xs text-dark-secondary pt-3 border-t border-dark-border mt-4">
                  <span className="flex items-center gap-1.5"><CarIcon className="w-4 h-4"/> {getDaysInStock(vehicle.entryDate)} dias em estoque</span>
                  <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4"/> {vehicle.saleGoalDays} dias de meta</span>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Meta de Venda</span>
                    <span className={`text-sm font-bold ${daysRemaining <= 0 ? 'text-red-500' : (daysRemaining <= 7 ? 'text-yellow-500' : '')}`}>
                      {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Prazo Esgotado'}
                    </span>
                  </div>
                  <ProgressBar daysLeft={daysRemaining} goalDays={vehicle.saleGoalDays} />
                </div>
              </>
            )}
        </div>
      </div>

      {!isSoldView && (
        <div className="p-4 bg-dark-background/30 rounded-b-2xl border-t border-dark-border flex gap-2">
          {isSalespersonView ? (
             <button 
                onClick={onMarkAsSold}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold py-2 px-3 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
              >
                <CheckIcon className="w-4 h-4" /> Vendido
              </button>
          ) : (
            <>
              <button 
                onClick={onAssign} 
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2 px-3 rounded-lg bg-dark-border/50 hover:bg-dark-border transition-colors"
              >
                <UserAddIcon className="w-4 h-4" /> Atribuir Vendedor
              </button>
              <button 
                onClick={onMarkAsSold}
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2 px-3 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
              >
                <CheckIcon className="w-4 h-4" /> Vendido
              </button>
            </>
          )}
        </div>
      )}
    </Card>
  );
};

export default VehicleCard;