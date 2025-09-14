import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useMockData';
import { LogEntry, LogType } from '../types';
import { CsvIcon } from '../components/icons/CsvIcon';
import { PdfIcon } from '../components/icons/PdfIcon';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import LogChart from '../components/LogChart';

const logTypeLabels: Record<LogType, string> = {
    COMPANY_APPROVED: 'Empresa Aprovada',
    COMPANY_DEACTIVATED: 'Empresa Desativada',
    COMPANY_PENDING: 'Cadastro de Empresa',
    COMPANY_DELETED: 'Empresa Excluída',
    ADMIN_LOGIN_SUCCESS: 'Login de Admin',
    USER_LOGIN_SUCCESS: 'Login de Usuário',
    USER_CREATED: 'Usuário Criado',
    USER_UPDATED: 'Usuário Atualizado',
    USER_DELETED: 'Usuário Excluído',
    REMINDER_CREATED: 'Lembrete Criado',
    REMINDER_UPDATED: 'Lembrete Atualizado',
    REMINDER_DELETED: 'Lembrete Excluído',
    VEHICLE_CREATED: 'Veículo Cadastrado',
    VEHICLE_SOLD: 'Veículo Vendido',
    VEHICLE_DELETED: 'Veículo Excluído',
};

const LogRow: React.FC<{ log: LogEntry }> = ({ log }) => {
    return (
        <tr className="border-b border-dark-border last:border-b-0 hover:bg-dark-background/50 transition-colors">
            <td className="p-3 text-xs">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
            <td className="p-3 text-xs font-semibold">{logTypeLabels[log.type] || log.type}</td>
            <td className="p-3 text-sm">{log.description}</td>
            <td className="p-3 text-sm">{log.companyName || 'N/A'}</td>
            <td className="p-3 text-sm">{log.userName || 'N/A'}</td>
        </tr>
    );
};

const LogCenterScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { logs, companies } = useData();
    const [filters, setFilters] = useState({
        logType: '',
        companyId: '',
        startDate: '',
        endDate: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            if (filters.logType && log.type !== filters.logType) return false;
            if (filters.companyId && log.company_id !== filters.companyId) return false;
            
            const logDate = new Date(log.timestamp);
            if (filters.startDate) {
                const startDate = new Date(filters.startDate + 'T00:00:00');
                if (logDate < startDate) return false;
            }
            if (filters.endDate) {
                const endDate = new Date(filters.endDate + 'T23:59:59.999');
                if (logDate > endDate) return false;
            }
            return true;
        });
    }, [logs, filters]);

    const chartData = useMemo(() => {
        if (filteredLogs.length === 0) {
            return [];
        }
        
        const timestamps = filteredLogs.map(log => new Date(log.timestamp).getTime());
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);
        const timeRange = maxTime - minTime;
        
        // Use hourly grouping for ranges up to 7 days
        const useHourGrouping = timeRange <= 7 * 24 * 60 * 60 * 1000;

        const logCounts = filteredLogs.reduce((acc, log) => {
            const date = new Date(log.timestamp);
            let key: string;
            if (useHourGrouping) {
                date.setMinutes(0, 0, 0); 
                key = date.toISOString();
            } else {
                date.setHours(0, 0, 0, 0); 
                key = date.toISOString();
            }
            
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(logCounts)
            // FIX: Cast count to number to resolve TypeScript error.
            .map(([timestamp, count]): [number, number] => [new Date(timestamp).getTime(), count as number])
            .sort((a, b) => a[0] - b[0]);

    }, [filteredLogs]);

    const handleExportCSV = () => {
        exportToCSV(filteredLogs, 'relatorio_logs_triad3');
    };
    const handleExportPDF = () => {
        exportToPDF(filteredLogs, 'relatorio_logs_triad3');
    };

    return (
        <div className="animate-fade-in">
            <header className="flex justify-between items-center mb-6">
                 <button onClick={onBack} className="flex items-center gap-2 text-sm text-dark-secondary hover:text-dark-text">
                    &larr; Voltar para Gestão
                </button>
                <h1 className="text-3xl font-bold text-dark-text">Central de Logs</h1>
            </header>
            
            <div className="p-4 bg-dark-card rounded-xl border border-dark-border mb-6 flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[150px]">
                    <label htmlFor="logType" className="filter-label">Tipo de Log</label>
                    <select name="logType" value={filters.logType} onChange={handleFilterChange} className="filter-input">
                        <option value="">Todos</option>
                        {Object.entries(logTypeLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label htmlFor="companyId" className="filter-label">Empresa</label>
                    <select name="companyId" value={filters.companyId} onChange={handleFilterChange} className="filter-input">
                        <option value="">Todas</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label htmlFor="startDate" className="filter-label">Data Início</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="filter-input" />
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label htmlFor="endDate" className="filter-label">Data Fim</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="filter-input" />
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={handleExportCSV} className="export-btn bg-green-500/10 text-green-400 hover:bg-green-500/20"><CsvIcon /> CSV</button>
                    <button onClick={handleExportPDF} className="export-btn bg-red-500/10 text-red-400 hover:bg-red-500/20"><PdfIcon /> PDF</button>
                </div>
            </div>
            
            <div className="mb-6 bg-dark-card rounded-2xl shadow-2xl shadow-black/20 p-4 border border-dark-border">
                <LogChart data={chartData} />
            </div>

            <div className="bg-dark-card rounded-2xl shadow-2xl shadow-black/20 overflow-hidden border border-dark-border">
                <div className="overflow-auto max-h-[60vh]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-dark-card/50 sticky top-0">
                            <tr>
                                <th className="p-3 font-semibold text-dark-secondary uppercase tracking-wider">Timestamp</th>
                                <th className="p-3 font-semibold text-dark-secondary uppercase tracking-wider">Tipo</th>
                                <th className="p-3 font-semibold text-dark-secondary uppercase tracking-wider">Descrição</th>
                                <th className="p-3 font-semibold text-dark-secondary uppercase tracking-wider">Empresa</th>
                                <th className="p-3 font-semibold text-dark-secondary uppercase tracking-wider">Usuário</th>
                            </tr>
                        </thead>
                        <tbody>
                           {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                <LogRow key={log.id} log={log} />
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-dark-secondary">Nenhum log encontrado com os filtros selecionados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
             <style>{`
                .filter-label { display: block; font-size: 0.75rem; font-weight: 500; color: #8A93A3; margin-bottom: 0.25rem; }
                .filter-input { width: 100%; padding: 0.5rem 0.75rem; background-color: #0A0F1E; border: 1px solid #243049; border-radius: 0.375rem; color: #E0E0E0; font-size: 0.875rem;}
                .filter-input:focus { outline: none; box-shadow: 0 0 0 2px #00D1FF; }
                .export-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: bold; font-size: 0.875rem; transition: background-color 0.2s; }
            `}</style>
        </div>
    );
};

export default LogCenterScreen;