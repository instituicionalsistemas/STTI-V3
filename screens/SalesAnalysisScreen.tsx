import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Company, TeamMember, Vehicle } from '../types';
import { formatCurrency } from '../utils/calculationUtils';
import { getDaysInStock } from '../utils/dateUtils';
import Card from '../components/Card';
import { ChevronDownIcon } from '../components/icons/ChevronDownIcon';
import { TrendingUpIcon } from '../components/icons/TrendingUpIcon';
import { DollarSignIcon } from '../components/icons/DollarSignIcon';
import { XIcon } from '../components/icons/XIcon';
import { TrophyIcon } from '../components/icons/TrophyIcon';
import SalespersonPerformanceScreen from './SalespersonPerformanceScreen';


type Period = 'this_month' | 'last_30_days' | 'last_month' | 'last_90_days';

interface SalesAnalysisScreenProps {
  company: Company;
  salespeople: TeamMember[];
  vehicles: Vehicle[];
  updateCompany: (company: Company) => void;
  updateSalesperson: (salesperson: TeamMember) => void;
  onBack: () => void;
}

const getDateRange = (period: Period) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let start = new Date(today);
    start.setHours(0, 0, 0, 0);
    let end = new Date(today);

    let prevStart = new Date();
    prevStart.setHours(0, 0, 0, 0);
    let prevEnd = new Date();
    prevEnd.setHours(23, 59, 59, 999);

    switch (period) {
        case 'this_month':
            start.setDate(1);
            prevEnd = new Date(start);
            prevEnd.setDate(0);
            prevStart = new Date(prevEnd);
            prevStart.setDate(1);
            break;
        case 'last_30_days':
            start.setDate(today.getDate() - 29);
            prevEnd = new Date(start);
            prevEnd.setDate(prevEnd.getDate() - 1);
            prevStart = new Date(prevEnd);
            prevStart.setDate(prevStart.getDate() - 29);
            break;
        case 'last_month':
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
            end.setHours(23, 59, 59, 999);
            prevStart = new Date(today.getFullYear(), today.getMonth() - 2, 1);
            prevEnd = new Date(today.getFullYear(), today.getMonth() - 1, 0);
            prevEnd.setHours(23, 59, 59, 999);
            break;
        case 'last_90_days':
            start.setDate(today.getDate() - 89);
            prevEnd = new Date(start);
            prevEnd.setDate(prevEnd.getDate() - 1);
            prevStart = new Date(prevEnd);
            prevStart.setDate(prevStart.getDate() - 89);
            break;
    }

    return { current: { start, end }, previous: { start: prevStart, end: prevEnd } };
};


const calculateMetrics = (vehicles: Vehicle[]) => {
    const totalSales = vehicles.length;
    const totalRevenue = vehicles.reduce((acc, v) => acc + (v.announcedPrice - v.discount), 0);
    const totalProfit = vehicles.reduce((acc, v) => {
        const salePrice = v.announcedPrice - v.discount;
        const totalCosts = v.purchasePrice + v.maintenance.reduce((sum, m) => sum + m.cost, 0);
        return acc + (salePrice - totalCosts);
    }, 0);
    const averageProfit = totalSales > 0 ? totalProfit / totalSales : 0;
    const averageDaysToSell = totalSales > 0 ? vehicles.reduce((acc, v) => acc + getDaysInStock(v.entryDate, v.saleDate), 0) / totalSales : 0;
    return { totalSales, totalRevenue, totalProfit, averageProfit, averageDaysToSell };
}

const Kpi: React.FC<{ title: string; value: string; comparison: number | null; invertColors?: boolean }> = ({ title, value, comparison, invertColors = false }) => {
    const isPositive = comparison !== null && comparison >= 0;
    const isNegative = comparison !== null && comparison < 0;
    const displayIsGood = (invertColors && isNegative) || (!invertColors && isPositive);

    return (
        <Card className="p-4">
            <p className="text-sm text-dark-secondary font-semibold">{title}</p>
            <p className="text-3xl font-bold text-dark-text mt-1">{value}</p>
            {comparison !== null && (
                <p className={`text-sm font-bold mt-1 flex items-center ${displayIsGood ? 'text-green-400' : 'text-red-400'}`}>
                    <svg className={`w-4 h-4 mr-1 ${isNegative ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                    {Math.abs(comparison).toFixed(1)}% vs. período anterior
                </p>
            )}
        </Card>
    );
};

const VehicleKpi: React.FC<{ title: string; model: string; value: string; isLoss?: boolean, icon: React.ReactNode }> = ({ title, model, value, isLoss = false, icon }) => (
    <Card className="p-4 flex items-center gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${isLoss ? 'bg-red-500/10 text-red-400' : 'bg-dark-primary/10 text-dark-primary'}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-dark-secondary font-semibold">{title}</p>
            <p className="text-lg font-bold text-dark-text truncate" title={model}>{model}</p>
            <p className={`text-xl font-bold ${isLoss ? 'text-red-400' : 'text-dark-primary'}`}>{value}</p>
        </div>
    </Card>
);

const SalespersonPerformanceCard: React.FC<{salesperson: TeamMember; metrics: {totalSales: number; totalRevenue: number; totalProfit: number; modelsSold: string[]}}> = ({ salesperson, metrics }) => (
    <Card className="p-6 mb-8 flex flex-col sm:flex-row items-center gap-6 animate-fade-in border-2 border-dark-primary/50">
        <div className="flex-shrink-0 text-center">
            <img src={salesperson.avatarUrl} alt={salesperson.name} className="w-24 h-24 rounded-full mx-auto border-4 border-dark-border" />
            <h3 className="text-xl font-bold mt-3">{salesperson.name}</h3>
            <p className="text-sm text-dark-secondary">Performance no Período</p>
        </div>
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div className="text-center bg-dark-background p-3 rounded-lg">
                <p className="text-sm text-dark-secondary">Vendas</p>
                <p className="text-2xl font-bold">{metrics.totalSales}</p>
            </div>
            <div className="text-center bg-dark-background p-3 rounded-lg">
                <p className="text-sm text-dark-secondary">Receita</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
            </div>
             <div className="text-center bg-dark-background p-3 rounded-lg">
                <p className="text-sm text-dark-secondary">Lucro</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalProfit)}</p>
            </div>
        </div>
         <div className="w-full sm:w-auto sm:max-w-xs sm:pl-6 sm:border-l sm:border-dark-border mt-4 sm:mt-0">
            <h4 className="font-semibold text-center sm:text-left">Modelos Vendidos</h4>
            <ul className="text-sm text-dark-secondary mt-2 space-y-1 text-center sm:text-left max-h-28 overflow-y-auto pr-2">
                {metrics.modelsSold.length > 0 ? metrics.modelsSold.map(m => <li key={m}>- {m}</li>) : <li>Nenhum</li>}
            </ul>
        </div>
    </Card>
);


const SimpleBarChart: React.FC<{ data: { label: string, value: number }[], format: (val: number) => string }> = ({ data, format }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    return (
        <Card className="p-6">
            <h4 className="font-bold text-dark-text mb-4">Receita por Modelo</h4>
             <div className="space-y-3">
                {data.map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-4 text-sm">
                        <span className="w-1/4 font-medium text-dark-secondary truncate">{label}</span>
                        <div className="w-2/4 bg-dark-background rounded-full h-4 border border-dark-border">
                            <div 
                                className="bg-dark-primary h-4 rounded-full" 
                                style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`, transition: 'width 0.5s ease-out' }}
                             ></div>
                        </div>
                        <span className="w-1/4 font-bold text-dark-text text-right">{format(value)}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

interface RankedVehicle extends Vehicle {
    daysToSell: number;
}

const RankedVehicleList: React.FC<{ title: string; vehicles: RankedVehicle[]; }> = ({ title, vehicles }) => (
  <Card className="p-6">
    <h4 className="font-bold text-dark-text mb-4">{title}</h4>
    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
      {vehicles.length > 0 ? vehicles.map((v, index) => (
        <div key={v.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-dark-background/50">
          <span className="font-medium text-dark-text truncate">
            <span className="text-dark-secondary mr-2 w-6 inline-block">{index + 1}.</span>
            {`${v.brand} ${v.model}`} <span className="text-dark-secondary text-xs">({v.plate})</span>
          </span>
          <span className="font-bold text-dark-primary">{v.daysToSell} dias</span>
        </div>
      )) : (
          <p className="text-dark-secondary text-center py-4">Nenhum dado para exibir neste período.</p>
      )}
    </div>
  </Card>
);


const SalesAnalysisScreen: React.FC<SalesAnalysisScreenProps> = ({ onBack, company, salespeople, vehicles }) => {
    const [view, setView] = useState<'analysis' | 'performance'>('analysis');
    const [period, setPeriod] = useState<Period>('last_90_days');
    const [salespersonFilter, setSalespersonFilter] = useState<string | null>(null);
    const [modelFilter, setModelFilter] = useState<string[]>([]);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [isModelFilterOpen, setModelFilterOpen] = useState(false);
    const modelFilterRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modelFilterRef.current && !modelFilterRef.current.contains(event.target as Node)) {
                setModelFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { current, previous } = getDateRange(period);
    const soldVehicles = vehicles.filter(v => v.status === 'sold' && v.saleDate);
    const uniqueModels = useMemo(() => [...new Set(soldVehicles.map(v => `${v.brand} ${v.model}`))].sort(), [soldVehicles]);
    const uniqueCategories = useMemo(() => [...new Set(soldVehicles.map(v => v.category))].sort(), [soldVehicles]);

    const filteredVehicles = useMemo(() => soldVehicles.filter(v => {
        const saleDate = new Date(v.saleDate!);
        const isDateInRange = saleDate >= current.start && saleDate <= current.end;
        const isSalespersonMatch = !salespersonFilter || v.salespersonId === salespersonFilter;
        const isModelMatch = modelFilter.length === 0 || modelFilter.includes(`${v.brand} ${v.model}`);
        const isCategoryMatch = !categoryFilter || v.category === categoryFilter;
        return isDateInRange && isSalespersonMatch && isModelMatch && isCategoryMatch;
    }), [soldVehicles, current, salespersonFilter, modelFilter, categoryFilter]);

     const previousPeriodVehicles = useMemo(() => soldVehicles.filter(v => {
        const saleDate = new Date(v.saleDate!);
        const isDateInRange = saleDate >= previous.start && saleDate <= previous.end;
        const isSalespersonMatch = !salespersonFilter || v.salespersonId === salespersonFilter;
        const isModelMatch = modelFilter.length === 0 || modelFilter.includes(`${v.brand} ${v.model}`);
        const isCategoryMatch = !categoryFilter || v.category === categoryFilter;
        return isDateInRange && isSalespersonMatch && isModelMatch && isCategoryMatch;
    }), [soldVehicles, previous, salespersonFilter, modelFilter, categoryFilter]);

    const currentMetrics = calculateMetrics(filteredVehicles);
    const previousMetrics = calculateMetrics(previousPeriodVehicles);

    const getComparison = (currentVal: number, prevVal: number): number | null => {
        if (prevVal === 0) return currentVal > 0 ? 100 : 0;
        if (currentVal === 0 && prevVal > 0) return -100;
        if (currentVal === 0 && prevVal === 0) return 0;
        return ((currentVal - prevVal) / prevVal) * 100;
    }
    
    const revenueByModel = filteredVehicles.reduce((acc, v) => {
        const revenue = v.announcedPrice - v.discount;
        const fullName = `${v.brand} ${v.model}`;
        acc[fullName] = (acc[fullName] || 0) + revenue;
        return acc;
    }, {} as { [key: string]: number });
    
    const chartData = Object.entries(revenueByModel).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({label, value}));

    const rankedVehicles = useMemo(() => {
        return filteredVehicles.map(v => ({
            ...v,
            daysToSell: getDaysInStock(v.entryDate, v.saleDate),
        }));
    }, [filteredVehicles]);

    const fastestSales = [...rankedVehicles].sort((a, b) => a.daysToSell - b.daysToSell).slice(0, 10);
    const slowestSales = [...rankedVehicles].sort((a, b) => b.daysToSell - a.daysToSell).slice(0, 10);

    const selectedSalespersonMetrics = useMemo(() => {
        if (!salespersonFilter) return null;
        const salesperson = salespeople.find(sp => sp.id === salespersonFilter);
        if (!salesperson) return null;
        const metrics = calculateMetrics(filteredVehicles); // Already filtered by salesperson
        const modelsSold = [...new Set(filteredVehicles.map(v => `${v.brand} ${v.model}`))];
        return { salesperson, metrics: { ...metrics, modelsSold } };
    }, [salespersonFilter, salespeople, filteredVehicles]);
    
    const vehicleKpis = useMemo(() => {
        const defaultResult = {
            bestSeller: { model: 'N/A', value: '0 unidades' },
            highestProfit: { model: 'N/A', value: formatCurrency(0) },
            lowestProfit: { model: 'Nenhum', value: formatCurrency(0), isLoss: false }
        };

        if (filteredVehicles.length === 0) {
            return defaultResult;
        }

        const modelStats = filteredVehicles.reduce((acc, v) => {
            const salePrice = v.announcedPrice - v.discount;
            const totalCosts = v.purchasePrice + v.maintenance.reduce((sum, m) => sum + m.cost, 0);
            const profit = salePrice - totalCosts;
            const fullName = `${v.brand} ${v.model}`;

            if (!acc[fullName]) {
                acc[fullName] = { count: 0, totalProfit: 0 };
            }
            acc[fullName].count += 1;
            acc[fullName].totalProfit += profit;
            
            return acc;
        }, {} as { [model: string]: { count: number, totalProfit: number } });

        const statsArray = Object.entries(modelStats).map(([model, stats]) => ({ model, ...stats }));
        
        if (statsArray.length === 0) {
            return defaultResult;
        }

        const bestSeller = statsArray.reduce((prev, current) => (current.count > prev.count ? current : prev));
        const highestProfit = statsArray.reduce((prev, current) => (current.totalProfit > prev.totalProfit ? current : prev));
        const lowestProfit = statsArray.reduce((prev, current) => (current.totalProfit < prev.totalProfit ? current : prev));

        const hasActualLoss = lowestProfit && lowestProfit.totalProfit < 0;

        return {
            bestSeller: { model: bestSeller.model, value: `${bestSeller.count} unidades` },
            highestProfit: { model: highestProfit.model, value: formatCurrency(highestProfit.totalProfit) },
            lowestProfit: {
                model: hasActualLoss ? lowestProfit.model : 'Nenhum',
                value: formatCurrency(lowestProfit.totalProfit),
                isLoss: hasActualLoss,
            }
        };
    }, [filteredVehicles]);

    const handleModelFilterChange = (model: string) => {
        setModelFilter(prev => 
            prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]
        );
    };

    if (view === 'performance') {
        return <SalespersonPerformanceScreen salespeople={salespeople} vehicles={soldVehicles} onBack={() => setView('analysis')} />;
    }

    return (
        <div className="animate-fade-in">
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                     <button onClick={onBack} className="flex items-center gap-2 text-sm text-dark-secondary hover:text-dark-text mb-2">
                        &larr; Voltar ao Dashboard
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-dark-text">Análise de Performance</h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={() => setView('performance')} className="input-select bg-dark-primary/90 hover:bg-dark-primary text-dark-background border-dark-primary/50 flex items-center gap-2">
                        <TrophyIcon className="w-4 h-4" /> Performance de Vendedores
                    </button>
                     <select value={period} onChange={e => setPeriod(e.target.value as Period)} className="input-select">
                        <option value="last_30_days">Últimos 30 dias</option>
                        <option value="this_month">Este Mês</option>
                        <option value="last_month">Mês Passado</option>
                        <option value="last_90_days">Últimos 90 dias</option>
                    </select>
                    <select value={salespersonFilter || 'all'} onChange={e => setSalespersonFilter(e.target.value === 'all' ? null : e.target.value)} className="input-select">
                        <option value="all">Todos os Vendedores</option>
                        {salespeople.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                    </select>
                    <select value={categoryFilter || 'all'} onChange={e => setCategoryFilter(e.target.value === 'all' ? null : e.target.value)} className="input-select">
                        <option value="all">Todas as Categorias</option>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div className="relative" ref={modelFilterRef}>
                        <button onClick={() => setModelFilterOpen(prev => !prev)} className="input-select w-full sm:w-auto flex items-center justify-between">
                            Modelos ({modelFilter.length || 'Todos'})
                            <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${isModelFilterOpen ? 'rotate-180' : ''}`} />
                        </button>
                         {isModelFilterOpen && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-20 p-2 animate-fade-in">
                                <div className="p-2 max-h-60 overflow-y-auto">
                                {uniqueModels.map(model => (
                                    <label key={model} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-dark-border/50">
                                        <input type="checkbox" checked={modelFilter.includes(model)} onChange={() => handleModelFilterChange(model)} className="h-4 w-4 rounded bg-dark-background border-dark-border text-dark-primary focus:ring-dark-primary focus:ring-offset-dark-card"/>
                                        <span className="text-sm font-medium text-dark-text">{model}</span>
                                    </label>
                                ))}
                                </div>
                                <div className="pt-2 border-t border-dark-border">
                                    <button onClick={() => setModelFilter([])} className="w-full text-center text-sm font-bold text-dark-secondary hover:text-dark-text p-2">Limpar</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Kpi title="Vendas Totais" value={currentMetrics.totalSales.toString()} comparison={getComparison(currentMetrics.totalSales, previousMetrics.totalSales)} />
                <Kpi title="Receita Total" value={formatCurrency(currentMetrics.totalRevenue)} comparison={getComparison(currentMetrics.totalRevenue, previousMetrics.totalRevenue)} />
                <Kpi title="Lucro Total" value={formatCurrency(currentMetrics.totalProfit)} comparison={getComparison(currentMetrics.totalProfit, previousMetrics.totalProfit)} />
                <Kpi title="Tempo Médio de Venda" value={`${Math.round(currentMetrics.averageDaysToSell)} dias`} comparison={getComparison(currentMetrics.averageDaysToSell, previousMetrics.averageDaysToSell)} invertColors={true} />
            </div>

            {selectedSalespersonMetrics && <SalespersonPerformanceCard salesperson={selectedSalespersonMetrics.salesperson} metrics={selectedSalespersonMetrics.metrics}/>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <VehicleKpi title="Mais Vendido" model={vehicleKpis.bestSeller.model} value={vehicleKpis.bestSeller.value} icon={<TrendingUpIcon className="w-6 h-6"/>} />
                <VehicleKpi title="Maior Lucro" model={vehicleKpis.highestProfit.model} value={vehicleKpis.highestProfit.value} icon={<DollarSignIcon className="w-6 h-6"/>} />
                <VehicleKpi 
                    title={vehicleKpis.lowestProfit.isLoss ? "Maior Prejuízo" : "Menor Lucro"} 
                    model={vehicleKpis.lowestProfit.model} 
                    value={vehicleKpis.lowestProfit.value} 
                    isLoss={vehicleKpis.lowestProfit.isLoss} 
                    icon={<XIcon className="w-6 h-6"/>} 
                />
            </div>

            <div className="space-y-8">
                <SimpleBarChart data={chartData} format={formatCurrency} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <RankedVehicleList title="Top 10 Vendas Mais Rápidas" vehicles={fastestSales} />
                    <RankedVehicleList title="Top 10 Vendas Mais Lentas" vehicles={slowestSales} />
                </div>
            </div>
            
             <style>{`
                .input-select {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    background-color: #10182C;
                    border: 1px solid #243049;
                    color: #E0E0E0;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                }
                select.input-select {
                    padding-right: 2rem;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238A93A3' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                }
            `}</style>
        </div>
    );
};

export default SalesAnalysisScreen;