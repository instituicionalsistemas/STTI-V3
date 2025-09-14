import React, { useState } from 'react';
import type { Vehicle, TeamMember, Company } from '../types';
import Card from './Card';
import { getDaysInStock } from '../utils/dateUtils';
import { formatCurrency, parseCurrency } from '../utils/calculationUtils';
import { CarIcon } from './icons/CarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { PdfIcon } from './icons/PdfIcon';
import { StarIcon } from './icons/StarIcon';
import { PhotoIcon } from './icons/PhotoIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { PlusIcon } from './icons/PlusIcon';


interface TrafficVehicleCardProps {
  vehicle: Vehicle;
  company: Company;
  salesperson?: TeamMember;
  onOpenMaterialRequest: () => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onToggleAdStatus: () => void;
  onImageClick?: () => void;
  style?: React.CSSProperties;
}

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
    maintenance: '',
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

const TrafficVehicleCard: React.FC<TrafficVehicleCardProps> = ({ vehicle, company, salesperson, onOpenMaterialRequest, onUpdateVehicle, onToggleAdStatus, onImageClick, style }) => {
  const [costToAdd, setCostToAdd] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const daysInStock = getDaysInStock(vehicle.entryDate);
  const isOverdue = daysInStock > 30;
  const isNew = daysInStock <= 7;
  
  const handleAddAdCost = () => {
    const valueToAdd = parseCurrency(costToAdd);
    if (valueToAdd > 0) {
      onUpdateVehicle({ ...vehicle, adCost: (vehicle.adCost || 0) + valueToAdd });
      setCostToAdd('');
    }
  };
  
  const handleDownloadPdf = () => {
    const { brand, model, plate, color, announcedPrice, adCost, description, maintenance, imageUrl } = vehicle;
    const maintenanceHtml = maintenance && maintenance.length > 0 
      ? `<ul>${maintenance.map(m => `<li><span>${m.description}</span><strong>${formatCurrency(m.cost)}</strong></li>`).join('')}</ul>` 
      : '<p>Nenhum registro de manutenção.</p>';

    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ficha do Veículo: ${brand} ${model}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
                @media print { .no-print { display: none; } }
                body { font-family: 'Inter', sans-serif; background-color: #f0f2f5; color: #111827; margin: 0; padding: 2rem; }
                .container { max-width: 800px; margin: auto; background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
                h1 { font-size: 2rem; color: #10182C; border-bottom: 2px solid #00D1FF; padding-bottom: 0.5rem; margin-bottom: 1rem; }
                h2 { font-size: 1.5rem; margin-top: 2rem; color: #10182C; }
                p { line-height: 1.6; }
                .meta { color: #6B7280; margin-bottom: 1.5rem; font-size: 1.1rem; }
                .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; }
                .detail-item { background: #F9FAFB; padding: 1rem; border-radius: 8px; border: 1px solid #E5E7EB; }
                .detail-item strong { display: block; font-size: 0.875rem; color: #4B5563; margin-bottom: 0.25rem; }
                .detail-item span { font-size: 1.25rem; font-weight: 600; color: #1F2937; }
                img { width: 100%; max-height: 400px; object-fit: cover; border-radius: 8px; margin-bottom: 2rem; }
                ul { list-style: none; padding: 0; }
                li { background: #F9FAFB; padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; }
                .print-btn { position: fixed; top: 20px; right: 20px; padding: 0.75rem 1.5rem; background: #00D1FF; color: #10182C; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            </style>
        </head>
        <body>
            <button onclick="window.print()" class="no-print print-btn">Imprimir / Salvar PDF</button>
            <div class="container">
                <h1>Ficha Técnica do Veículo</h1>
                ${imageUrl ? `<img src="${imageUrl}" alt="${brand} ${model}">` : ''}
                <h2>${brand} ${model}</h2>
                <p class="meta">${plate} &bull; ${color}</p>

                <div class="details-grid">
                    <div class="detail-item"><strong>Preço Anunciado</strong><span>${formatCurrency(announcedPrice)}</span></div>
                    <div class="detail-item"><strong>Custo Anúncio</strong><span>${formatCurrency(adCost)}</span></div>
                    <div class="detail-item"><strong>Dias em Estoque</strong><span>${daysInStock}</span></div>
                </div>

                ${description ? `
                <div style="margin-top: 2rem;">
                    <h2>Descrição</h2>
                    <p>${description.replace(/\n/g, '<br>')}</p>
                </div>` : ''}
                
                <h2>Manutenção</h2>
                ${maintenanceHtml}
            </div>
        </body>
        </html>
    `;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getStatusTag = () => {
    if (vehicle.isPriority) return <div className="tag bg-yellow-500/20 text-yellow-300"><StarIcon className="w-3 h-3"/>Prioridade</div>;
    if (isNew) return <div className="tag bg-blue-500/20 text-blue-300">Novo</div>;
    if (isOverdue) return <div className="tag bg-red-500/20 text-red-300">Prazo Esgotado</div>;
    return null;
  }

  return (
    <Card 
        className="flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:border-dark-primary/50 animate-stagger opacity-0"
        style={style}
    >
      <div>
        <div 
          className={`relative group ${onImageClick ? 'cursor-pointer' : ''}`}
          onClick={onImageClick}
        >
          <div className="h-48 w-full overflow-hidden rounded-t-2xl bg-dark-background flex items-center justify-center">
            {vehicle.imageUrl ? (
              <img src={vehicle.imageUrl} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <CarIcon className="w-12 h-12 text-dark-secondary" />
            )}
          </div>
           <div className="absolute top-3 right-3">{getStatusTag()}</div>
        </div>
        
        <div className="p-4">
            <h3 className="text-lg font-bold text-dark-primary truncate">{`${vehicle.brand} ${vehicle.model}`}</h3>
            <p className="text-sm text-dark-secondary">{vehicle.plate} - {vehicle.color}</p>

            <div className="mt-4 pt-4 border-t border-dark-border space-y-3 text-sm">
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
                    <span className="font-medium text-dark-secondary flex items-center gap-1.5"><DollarSignIcon className="w-4 h-4"/>Custo Anúncio (Total):</span>
                    <span className="font-bold text-lg text-dark-text">{formatCurrency(vehicle.adCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <label htmlFor={`addAdCost-${vehicle.id}`} className="font-medium text-dark-secondary text-sm">Adicionar Custo:</label>
                    <div className="flex items-center gap-2">
                        <input
                            id={`addAdCost-${vehicle.id}`}
                            type="text"
                            value={costToAdd}
                            onChange={(e) => setCostToAdd(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { handleAddAdCost(); } }}
                            className="w-24 bg-dark-background border border-dark-border rounded-md text-right px-2 py-1 text-dark-primary focus:outline-none focus:ring-2 focus:ring-dark-primary"
                            placeholder="R$ 0,00"
                        />
                        <button 
                            type="button" 
                            onClick={handleAddAdCost} 
                            className="p-1.5 rounded-md bg-dark-primary text-dark-background font-bold hover:opacity-90 disabled:opacity-50"
                            disabled={!costToAdd || parseCurrency(costToAdd) <= 0}
                            aria-label="Adicionar custo"
                        >
                            <PlusIcon className="w-3 h-3" />
                        </button>
                    </div>
                </div>
               <div className="flex justify-between items-center">
                <span className="font-medium text-dark-secondary flex items-center gap-1.5"><ClockIcon className="w-4 h-4"/>Dias em Estoque:</span>
                <span className={`font-bold text-lg ${isOverdue ? 'text-red-400' : 'text-dark-text'}`}>{daysInStock}</span>
              </div>
            </div>

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
                <div className="flex items-center gap-3 pt-3 mt-3 border-t border-dark-border">
                    <img src={salesperson.avatarUrl} alt={salesperson.name} className="w-8 h-8 rounded-full" />
                    <div>
                        <p className="text-xs text-dark-secondary">Vendedor Responsável</p>
                        <p className="font-semibold text-dark-text">{salesperson.name}</p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-dark-border">
                <span className="text-sm font-semibold">Anúncio Ativo:</span>
                <label htmlFor={`toggle-ad-${vehicle.id}`} className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" id={`toggle-ad-${vehicle.id}`} className="sr-only peer" checked={vehicle.isAdActive} onChange={onToggleAdStatus} />
                        <div className="w-11 h-6 bg-dark-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dark-primary"></div>
                    </div>
                </label>
            </div>
        </div>
      </div>

      <div className="p-3 bg-dark-background/30 rounded-b-2xl border-t border-dark-border flex gap-2">
        <button 
          onClick={handleDownloadPdf} 
          className="flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2 px-3 rounded-lg bg-dark-border/50 hover:bg-dark-border transition-colors"
        >
          <PdfIcon className="w-4 h-4" /> Baixar PDF
        </button>
        <button 
          onClick={onOpenMaterialRequest} 
          className="flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2 px-3 rounded-lg bg-dark-primary/20 text-dark-primary hover:bg-dark-primary/30 transition-colors"
        >
          <PhotoIcon className="w-4 h-4" /> Solicitar Material
        </button>
      </div>
      <style>{`
        .tag {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.25rem 0.6rem;
            font-size: 0.7rem;
            font-weight: 600;
            border-radius: 9999px;
            backdrop-filter: blur(4px);
        }
      `}</style>
    </Card>
  );
};

export default TrafficVehicleCard;