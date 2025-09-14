import React, { useState } from 'react';
import { TeamMember, Vehicle } from '../types';
import { AdvancedFilters } from './FilterBar';
import { XIcon } from './icons/XIcon';

interface AdvancedFilterDropdownProps {
    salespeople: TeamMember[];
    vehicles: Vehicle[];
    onApply: (filters: AdvancedFilters) => void;
    onClose: () => void;
}

const stockDayOptions = [
    { id: '0-15', label: '0-15 dias' },
    { id: '16-30', label: '16-30 dias' },
    { id: '31-60', label: '31-60 dias' },
    { id: '60+', label: 'Mais de 60 dias' },
];

const priceRangeOptions = [
    { id: '0-50000', label: 'Até R$ 50.000' },
    { id: '50001-100000', label: 'R$ 50.001 - R$ 100.000' },
    { id: '100001-150000', label: 'R$ 100.001 - R$ 150.000' },
    { id: '150001+', label: 'Acima de R$ 150.000' },
];

const Checkbox: React.FC<{id: string; label: string; checked: boolean; onChange: (checked: boolean) => void;}> = ({ id, label, checked, onChange }) => (
    <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-dark-border/50">
        <input 
            type="checkbox" 
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded bg-dark-background border-dark-border text-dark-primary focus:ring-dark-primary focus:ring-offset-dark-card"
        />
        <span className="text-sm font-medium text-dark-secondary">{label}</span>
    </label>
);


const AdvancedFilterDropdown: React.FC<AdvancedFilterDropdownProps> = ({ salespeople, vehicles, onApply, onClose }) => {
    const [filters, setFilters] = useState<AdvancedFilters>({
        salespersonIds: [],
        stockDays: [],
        priceRanges: [],
        modelNames: [],
    });

    const handleCheckboxChange = (category: keyof AdvancedFilters, value: string) => {
        setFilters(prev => {
            const currentValues = prev[category] as string[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [category]: newValues };
        });
    };
    
    const handleClear = () => {
        const clearedFilters = { salespersonIds: [], stockDays: [], priceRanges: [], modelNames: [] };
        setFilters(clearedFilters);
        onApply(clearedFilters);
    };

    const uniqueModels = [...new Set(vehicles.map(v => v.model))].sort();

    return (
        <div className="absolute top-full right-0 sm:left-0 mt-2 w-80 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-20 animate-fade-in p-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-dark-text">Filtros Avançados</h4>
                <button onClick={onClose} className="p-1 rounded-full text-dark-secondary hover:bg-dark-border">
                    <XIcon className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {/* Salesperson Filter */}
                <div>
                    <h5 className="font-semibold text-sm text-dark-text mb-2">Vendedor</h5>
                    <div className="space-y-1">
                        <Checkbox id="sp-unassigned" label="Não Atribuído" checked={filters.salespersonIds.includes('unassigned')} onChange={() => handleCheckboxChange('salespersonIds', 'unassigned')} />
                        {salespeople.map(sp => (
                            <Checkbox key={sp.id} id={`sp-${sp.id}`} label={sp.name} checked={filters.salespersonIds.includes(sp.id)} onChange={() => handleCheckboxChange('salespersonIds', sp.id)} />
                        ))}
                    </div>
                </div>

                {/* Model Filter */}
                <div>
                    <h5 className="font-semibold text-sm text-dark-text mb-2">Modelo</h5>
                    <div className="space-y-1">
                        {uniqueModels.map(model => (
                            <Checkbox key={model} id={`model-${model}`} label={model} checked={filters.modelNames.includes(model)} onChange={() => handleCheckboxChange('modelNames', model)} />
                        ))}
                    </div>
                </div>

                {/* Stock Days Filter */}
                <div>
                    <h5 className="font-semibold text-sm text-dark-text mb-2">Tempo de Estoque</h5>
                    <div className="space-y-1">
                        {stockDayOptions.map(opt => (
                            <Checkbox key={opt.id} id={`sd-${opt.id}`} label={opt.label} checked={filters.stockDays.includes(opt.id)} onChange={() => handleCheckboxChange('stockDays', opt.id)} />
                        ))}
                    </div>
                </div>

                {/* Price Range Filter */}
                <div>
                    <h5 className="font-semibold text-sm text-dark-text mb-2">Faixa de Preço</h5>
                    <div className="space-y-1">
                        {priceRangeOptions.map(opt => (
                            <Checkbox key={opt.id} id={`pr-${opt.id}`} label={opt.label} checked={filters.priceRanges.includes(opt.id)} onChange={() => handleCheckboxChange('priceRanges', opt.id)} />
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between mt-5 pt-4 border-t border-dark-border">
                 <button 
                    onClick={handleClear}
                    className="px-4 py-2 text-sm font-bold rounded-lg text-dark-secondary hover:bg-dark-border/50"
                >
                    Limpar Filtros
                </button>
                <button 
                    onClick={() => onApply(filters)}
                    className="px-4 py-2 text-sm font-bold rounded-lg bg-dark-primary text-dark-background hover:opacity-90"
                >
                    Aplicar Filtros
                </button>
            </div>
        </div>
    );
};

export default AdvancedFilterDropdown;