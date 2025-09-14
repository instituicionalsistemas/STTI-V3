import React, { useState, useRef, useEffect } from 'react';
import { TeamMember, Vehicle, Feature } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { ClockIcon } from './icons/ClockIcon';
import { FilterIcon } from './icons/FilterIcon';
import AdvancedFilterDropdown from './AdvancedFilterDropdown';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { BullseyeIcon } from './icons/BullseyeIcon';


export interface AdvancedFilters {
    salespersonIds: string[];
    stockDays: string[];
    priceRanges: string[];
    modelNames: string[];
}

type StockView = 'available' | 'sold';

interface FilterBarProps {
    onAddVehicle?: () => void;
    onOpenSalesAnalysis?: () => void;
    onOpenLembrAI?: () => void;
    onOpenMarketingModal?: () => void;
    onOpenProspectAI?: () => void;
    salespeople: TeamMember[];
    vehicles: Vehicle[];
    isOverdueFilterActive: boolean;
    onOverdueFilterToggle: () => void;
    onAdvancedFilterChange: (filters: AdvancedFilters) => void;
    activeAdvancedFiltersCount: number;
    selectedSalespersonId: string | null;
    onSalespersonSelect: (id: string | null) => void;
    areFiltersDisabled?: boolean;
    stockView?: StockView;
    onStockViewChange?: (view: StockView) => void;
    enabledFeatures?: Feature[];
    // Props for conditional rendering
    showAddVehicle?: boolean;
    showSalesAnalysis?: boolean;
    showMarketing?: boolean;
    showLembrAI?: boolean;
    showProspectAI?: boolean;
    showStockViewToggle?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
    onAddVehicle, onOpenSalesAnalysis, onOpenMarketingModal, onOpenLembrAI, onOpenProspectAI, salespeople,
    vehicles, isOverdueFilterActive, onOverdueFilterToggle, onAdvancedFilterChange,
    activeAdvancedFiltersCount, selectedSalespersonId, onSalespersonSelect,
    areFiltersDisabled = false, stockView, onStockViewChange, enabledFeatures,
    showAddVehicle = true,
    showSalesAnalysis = true,
    showMarketing = true,
    showLembrAI = true,
    showProspectAI = true,
    showStockViewToggle = true,
}) => {
    const [isAdvancedFilterOpen, setAdvancedFilterOpen] = useState(false);
    const [isSalespersonFilterOpen, setSalespersonFilterOpen] = useState(false);
    
    const advancedFilterRef = useRef<HTMLDivElement>(null);
    const salespersonFilterRef = useRef<HTMLDivElement>(null);

    const useOutsideAlerter = (ref: React.RefObject<HTMLDivElement>, callback: () => void) => {
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (ref.current && !ref.current.contains(event.target as Node)) {
                    callback();
                }
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, [ref, callback]);
    };

    useOutsideAlerter(advancedFilterRef, () => setAdvancedFilterOpen(false));
    useOutsideAlerter(salespersonFilterRef, () => setSalespersonFilterOpen(false));

    const handleApplyFilters = (filters: AdvancedFilters) => {
        onAdvancedFilterChange(filters);
        setAdvancedFilterOpen(false);
    };
    
    const handleSelectSalesperson = (id: string | null) => {
        onSalespersonSelect(id);
        setSalespersonFilterOpen(false);
    };

    const selectedSalesperson = salespeople.find(s => s.id === selectedSalespersonId);
    
    return (
        <div className="mb-8 animate-fade-in flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-3">
                {/* Left side: Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={onOverdueFilterToggle}
                        disabled={areFiltersDisabled}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                            isOverdueFilterActive 
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                            : 'bg-dark-card border-dark-border text-dark-secondary hover:border-dark-primary'
                        } ${areFiltersDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <ClockIcon className="w-4 h-4" />
                        Atrasados (+30 dias)
                    </button>
                    
                    <div className="relative" ref={salespersonFilterRef}>
                        <button 
                            onClick={() => setSalespersonFilterOpen(prev => !prev)}
                            disabled={areFiltersDisabled}
                            className={`flex-shrink-0 w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-dark-card border border-dark-border text-dark-secondary hover:border-dark-primary transition-colors ${areFiltersDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <UserGroupIcon className="w-4 h-4" />
                            <span>{selectedSalesperson?.name || 'Todos os Vendedores'}</span>
                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isSalespersonFilterOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isSalespersonFilterOpen && (
                            <div className="absolute top-full left-0 mt-2 w-60 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-20 animate-fade-in p-2">
                                <button onClick={() => handleSelectSalesperson(null)} className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-dark-border/50">
                                    <div className="w-8 h-8 rounded-full bg-dark-background flex items-center justify-center">
                                    <UserGroupIcon className="w-5 h-5 text-dark-secondary" />
                                    </div>
                                    <span className="font-semibold">Todos os Vendedores</span>
                                </button>
                                {salespeople.map(sp => (
                                    <button key={sp.id} onClick={() => handleSelectSalesperson(sp.id)} className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-dark-border/50">
                                        <img src={sp.avatarUrl} alt={sp.name} className="w-8 h-8 rounded-full" />
                                        <span className="font-semibold text-dark-text">{sp.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={advancedFilterRef}>
                        <button 
                            onClick={() => setAdvancedFilterOpen(prev => !prev)}
                            disabled={areFiltersDisabled}
                            className={`flex-shrink-0 w-full sm:w-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-dark-card border border-dark-border text-dark-secondary hover:border-dark-primary transition-colors ${areFiltersDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <FilterIcon className="w-4 h-4" />
                            Filtros Avançados
                            {activeAdvancedFiltersCount > 0 && (
                                <span className="w-2 h-2 bg-dark-primary rounded-full ml-1"></span>
                            )}
                        </button>
                        
                        {isAdvancedFilterOpen && (
                            <AdvancedFilterDropdown 
                                salespeople={salespeople}
                                vehicles={vehicles}
                                onApply={handleApplyFilters}
                                onClose={() => setAdvancedFilterOpen(false)}
                            />
                        )}
                    </div>
                    {enabledFeatures?.includes('estoque_inteligente') && showSalesAnalysis && onOpenSalesAnalysis && (
                        <button
                            onClick={onOpenSalesAnalysis}
                            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-dark-card border border-dark-border text-dark-secondary hover:border-dark-primary transition-colors"
                        >
                            <ChartBarIcon className="w-4 h-4" />
                            Análise de Vendas
                        </button>
                    )}
                    {enabledFeatures?.includes('marketing') && showMarketing && onOpenMarketingModal && (
                        <button
                            onClick={onOpenMarketingModal}
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-dark-card border border-dark-border text-dark-secondary hover:border-dark-primary transition-colors`}
                        >
                            <MegaphoneIcon className="w-4 h-4" />
                            Marketing/Tráfego
                        </button>
                    )}
                     {enabledFeatures?.includes('prospectai') && showProspectAI && onOpenProspectAI && (
                        <button
                            onClick={onOpenProspectAI}
                            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-dark-card border border-dark-border text-dark-secondary hover:border-dark-primary transition-colors"
                        >
                            <BullseyeIcon className="w-4 h-4" />
                            ProspectAI
                        </button>
                    )}
                </div>

                {/* Center: View Toggle */}
                {showStockViewToggle && stockView && onStockViewChange && (
                    <div className="flex-1 flex justify-center">
                         <div className="bg-dark-card p-1 rounded-lg border border-dark-border flex items-center gap-1">
                            <button 
                                onClick={() => onStockViewChange('available')}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${stockView === 'available' ? 'bg-dark-primary text-dark-background' : 'text-dark-secondary hover:bg-dark-border/50'}`}
                            >
                                Estoque Atual
                            </button>
                            <button 
                                 onClick={() => onStockViewChange('sold')}
                                 className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${stockView === 'sold' ? 'bg-dark-primary text-dark-background' : 'text-dark-secondary hover:bg-dark-border/50'}`}
                            >
                                Veículos Vendidos
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-3">
                {enabledFeatures?.includes('estoque_inteligente') && showAddVehicle && onAddVehicle && (
                    <button onClick={onAddVehicle} className="flex items-center gap-2 bg-dark-card border border-dark-border px-4 py-2 rounded-lg hover:border-dark-primary transition-colors font-medium text-sm">
                        <PlusIcon className="w-4 h-4" /> Cadastrar Veículo
                    </button>
                )}
                {enabledFeatures?.includes('estoque_inteligente') && showLembrAI && onOpenLembrAI && (
                    <button
                        onClick={onOpenLembrAI}
                        className="flex items-center gap-2 bg-dark-primary text-dark-background px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-bold text-sm"
                    >
                        <ClockIcon className="w-4 h-4" />
                        LembrAI
                    </button>
                )}
            </div>
        </div>
    );
};

export default FilterBar;