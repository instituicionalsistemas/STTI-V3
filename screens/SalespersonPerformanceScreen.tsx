import React, { useState, useMemo } from 'react';
import { TeamMember, Vehicle } from '../types';
import { formatCurrency } from '../utils/calculationUtils';
import Card from '../components/Card';
import { TrophyIcon } from '../components/icons/TrophyIcon';
import { getDaysInStock } from '../utils/dateUtils';

type Period = 'last_30_days' | 'last_90_days' | 'this_month';
type SalesData = { totalSales: number; totalRevenue: number; totalProfit: number; avgDaysToSell: number };

interface SalespersonPerformanceScreenProps {
  salespeople: TeamMember[];
  vehicles: Vehicle[]; // Should be all sold vehicles for the company
  currentUser?: TeamMember; // To know if the view is for a specific salesperson
  onBack: () => void;
}

// --- HELPER FUNCTIONS ---
const getDateRange = (period: Period) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    switch (period) {
        case 'this_month':
            start.setDate(1);
            break;
        case 'last_30_days':
            start.setDate(today.getDate() - 29);
            break;
        case 'last_90_days':
            start.setDate(today.getDate() - 89);
            break;
    }
    return { start, end: today };
};

const calculateMetrics = (vehicles: Vehicle[]): SalesData => {
    const totalSales = vehicles.length;
    const totalRevenue = vehicles.reduce((acc, v) => acc + (v.announcedPrice - v.discount), 0);
    const totalProfit = vehicles.reduce((acc, v) => {
        const salePrice = v.announcedPrice - v.discount;
        const totalCosts = v.purchasePrice + v.maintenance.reduce((sum, m) => sum + m.cost, 0);
        return acc + (salePrice - totalCosts);
    }, 0);
    const avgDaysToSell = totalSales > 0 ? vehicles.reduce((acc, v) => acc + getDaysInStock(v.entryDate, v.saleDate), 0) / totalSales : 0;
    return { totalSales, totalRevenue, totalProfit, avgDaysToSell };
};

// --- SUB-COMPONENTS ---

const KpiCard: React.FC<{ title: string; value: string; subValue?: string }> = ({ title, value, subValue }) => (
    <Card className="p-4">
        <p className="text-sm text-dark-secondary font-semibold">{title}</p>
        <p className="text-3xl font-bold text-dark-text mt-1">{value}</p>
        {subValue && <p className="text-xs text-dark-secondary mt-1">{subValue}</p>}
    </Card>
);

const LeaderboardItem: React.FC<{ rank: number; salesperson: TeamMember & SalesData; isSalespersonView?: boolean }> = ({ rank, salesperson, isSalespersonView = false }) => {
    const colors = ['border-yellow-400', 'border-gray-400', 'border-yellow-600'];
    const rankColor = rank < 3 ? colors[rank] : 'border-dark-border';

    return (
        <div className={`flex flex-wrap items-center p-3 rounded-lg bg-dark-background border-2 ${rankColor}`}>
            <div className={`flex items-center gap-4 w-full mb-2 sm:mb-0 ${isSalespersonView ? 'sm:w-1/2' : 'sm:w-1/3'}`}>
                <TrophyIcon className={`w-6 h-6 ${rank < 3 ? colors[rank].replace('border-', 'text-') : 'text-dark-secondary'}`} />
                <img src={salesperson.avatarUrl} alt={salesperson.name} className="w-10 h-10 rounded-full" />
                <p className="font-bold text-dark-text">{salesperson.name}</p>
            </div>
            
            {isSalespersonView ? (
                <div className="grid grid-cols-2 gap-2 text-center text-sm w-full sm:w-1/2">
                    <div><span className="text-xs text-dark-secondary block">Vendas</span><span className="font-bold text-lg">{salesperson.totalSales}</span></div>
                    <div><span className="text-xs text-dark-secondary block">T.M.V.</span><span className="font-bold text-lg">{Math.round(salesperson.avgDaysToSell)}d</span></div>
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center text-sm w-full sm:w-2/3">
                    <div><span className="text-xs text-dark-secondary block">Vendas</span><span className="font-bold text-lg">{salesperson.totalSales}</span></div>
                    <div><span className="text-xs text-dark-secondary block">Lucro</span><span className="font-bold text-green-400 text-base">{formatCurrency(salesperson.totalProfit)}</span></div>
                    <div><span className="text-xs text-dark-secondary block">Receita</span><span className="font-bold text-dark-primary text-base">{formatCurrency(salesperson.totalRevenue)}</span></div>
                    <div className="hidden sm:block"><span className="text-xs text-dark-secondary block">T.M.V.</span><span className="font-bold text-lg">{Math.round(salesperson.avgDaysToSell)}d</span></div>
                </div>
            )}
        </div>
    );
};

const BarChart: React.FC<{ title: string, data: { label: string, value: number, colorClass: string }[], format: (val: number) => string }> = ({ title, data, format }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    return(
        <Card className="p-6">
            <h4 className="font-bold text-dark-text mb-4">{title}</h4>
            <div className="space-y-3">
                {data.map(item => (
                    <div key={item.label} className="flex items-center gap-4 text-sm">
                        <span className="w-1/4 font-medium text-dark-secondary truncate">{item.label}</span>
                        <div className="w-2/4 bg-dark-background rounded-full h-4 border border-dark-border">
                            <div className={`${item.colorClass} h-4 rounded-full`} style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`, transition: 'width 0.5s ease-out' }} />
                        </div>
                        <span className="w-1/4 font-bold text-dark-text text-right">{format(item.value)}</span>
                    </div>
                ))}
            </div>
        </Card>
    )
};


const SalespersonPerformanceScreen: React.FC<SalespersonPerformanceScreenProps> = ({ salespeople, vehicles, currentUser, onBack }) => {
    const [period, setPeriod] = useState<Period>('last_90_days');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    const uniqueCategories = useMemo(() => [...new Set(vehicles.map(v => v.category))].sort(), [vehicles]);

    const filteredVehicles = useMemo(() => {
        const { start, end } = getDateRange(period);
        return vehicles.filter(v => {
            const saleDate = new Date(v.saleDate!);
            const isDateInRange = saleDate >= start && saleDate <= end;
            const isCategoryMatch = !categoryFilter || v.category === categoryFilter;
            return isDateInRange && isCategoryMatch;
        });
    }, [vehicles, period, categoryFilter]);

    const leaderboardData = useMemo(() => {
        const salesByPerson = filteredVehicles.reduce((acc, vehicle) => {
            const id = vehicle.salespersonId || 'unassigned';
            if (!acc[id]) acc[id] = [];
            acc[id].push(vehicle);
            return acc;
        }, {} as Record<string, Vehicle[]>);

        return salespeople.map(sp => {
            const sales = salesByPerson[sp.id] || [];
            return { ...sp, ...calculateMetrics(sales) };
        }).sort((a, b) => b.totalSales - a.totalSales || b.totalProfit - a.totalProfit);

    }, [filteredVehicles, salespeople]);

    const totalMetrics = useMemo(() => calculateMetrics(filteredVehicles), [filteredVehicles]);

    const categoryRevenue = useMemo(() => {
        const data = filteredVehicles.reduce((acc, v) => {
            acc[v.category] = (acc[v.category] || 0) + (v.announcedPrice - v.discount);
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(data).map(([label, value]) => ({ label, value, colorClass: 'bg-dark-primary' })).sort((a,b) => b.value - a.value);
    }, [filteredVehicles]);
    
    const avgDaysToSellBySalesperson = useMemo(() => {
       return leaderboardData
        .filter(sp => sp.totalSales > 0)
        .map(sp => ({label: sp.name, value: sp.avgDaysToSell, colorClass: 'bg-yellow-500'}))
        .sort((a,b) => a.value - b.value);
    }, [leaderboardData]);
    

    const userPerformance = currentUser ? leaderboardData.find(sp => sp.id === currentUser.id) : null;
    const teamAverage = {
        totalSales: totalMetrics.totalSales / salespeople.length,
        totalProfit: totalMetrics.totalProfit / salespeople.length,
    }

    return (
        <div className="animate-fade-in">
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm text-dark-secondary hover:text-dark-text mb-2">&larr; Voltar</button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-dark-text">
                        {currentUser ? `Minha Performance` : `Performance de Vendedores`}
                    </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select value={period} onChange={e => setPeriod(e.target.value as Period)} className="input-select">
                        <option value="last_30_days">Últimos 30 dias</option>
                        <option value="last_90_days">Últimos 90 dias</option>
                        <option value="this_month">Este Mês</option>
                    </select>
                    <select value={categoryFilter || 'all'} onChange={e => setCategoryFilter(e.target.value === 'all' ? null : e.target.value)} className="input-select">
                        <option value="all">Todas as Categorias</option>
                        {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </header>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <KpiCard title="Vendas Totais" value={totalMetrics.totalSales.toString()} subValue="no período" />
                <KpiCard title="Receita Total" value={formatCurrency(totalMetrics.totalRevenue)} subValue="gerada no período" />
                <KpiCard title="Lucro Total" value={formatCurrency(totalMetrics.totalProfit)} subValue="gerado no período" />
                <KpiCard title="Tempo Médio Venda" value={`${Math.round(totalMetrics.avgDaysToSell)} dias`} subValue="para todo o time" />
            </div>

            {userPerformance && (
                 <Card className="p-6 mb-8 bg-dark-primary/5">
                    <h3 className="text-xl font-bold text-dark-text mb-4">Seu Desempenho vs. Média da Equipe</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-sm text-dark-secondary">Suas Vendas</p>
                            <p className="text-2xl font-bold">{userPerformance.totalSales}</p>
                        </div>
                         <div>
                            <p className="text-sm text-dark-secondary">Média da Equipe</p>
                            <p className="text-2xl font-bold">{teamAverage.totalSales.toFixed(1)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-dark-secondary">Seu Lucro</p>
                            <p className="text-2xl font-bold text-green-400">{formatCurrency(userPerformance.totalProfit)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-dark-secondary">Média da Equipe</p>
                            <p className="text-2xl font-bold text-green-400">{formatCurrency(teamAverage.totalProfit)}</p>
                        </div>
                    </div>
                 </Card>
            )}

            <div className="space-y-6">
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-dark-text mb-4">Leaderboard de Vendas</h3>
                    <div className="space-y-3">
                        {leaderboardData.map((sp, index) => <LeaderboardItem key={sp.id} rank={index} salesperson={sp} isSalespersonView={!!currentUser} />)}
                    </div>
                </Card>

                <BarChart title="Receita por Categoria de Veículo" data={categoryRevenue} format={formatCurrency} />
                <BarChart title="Eficiência (Tempo Médio de Venda)" data={avgDaysToSellBySalesperson} format={val => `${Math.round(val)} dias`} />
            </div>

            <style>{`.input-select{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:#10182C;border:1px solid #243049;color:#E0E0E0;padding:.5rem .75rem;border-radius:.5rem;font-size:.875rem;font-weight:500;cursor:pointer;padding-right:2rem;background-image:url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238A93A3' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");background-position:right .5rem center;background-repeat:no-repeat;background-size:1.5em 1.5em}`}</style>
        </div>
    );
};

export default SalespersonPerformanceScreen;