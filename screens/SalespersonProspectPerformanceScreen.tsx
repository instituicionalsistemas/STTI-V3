import React, { useMemo, useState } from 'react';
import { TeamMember, ProspectAILead } from '../types';
import Card from '../components/Card';
import { ArrowDownIcon } from '../components/icons/ArrowDownIcon';
import ImageLightbox from '../components/ImageLightbox';

// --- Helper Functions ---
const formatDuration = (ms: number): string => {
    if (ms < 0 || isNaN(ms)) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    if (seconds > 0) return `${seconds}s`;
    return 'Imediato';
};


const calculatePerformanceMetrics = (leads: ProspectAILead[]) => {
    const converted = leads.filter(l => l.status === 'Finalizado - Convertido');
    const notConverted = leads.filter(l => l.status === 'Finalizado - Não Convertido');
    const finalized = [...converted, ...notConverted];
    const prospected = leads.filter(l => l.prospected_at);

    const conversionRate = finalized.length > 0 ? (converted.length / finalized.length) * 100 : 0;

    const responseTimes = prospected
        .map(l => new Date(l.prospected_at!).getTime() - new Date(l.createdAt).getTime())
        .filter(t => t >= 0);
    
    const avgResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;

    const closingTimes = finalized
        .filter(l => l.prospected_at && l.last_feedback_at)
        .map(l => new Date(l.last_feedback_at!).getTime() - new Date(l.prospected_at!).getTime())
        .filter(t => t >= 0);

    const avgClosingTime = closingTimes.length > 0 ? closingTimes.reduce((a, b) => a + b, 0) / closingTimes.length : 0;
    
    const allFeedbacks = leads
        .flatMap(l => l.feedback ? l.feedback.map(f => ({ ...f, leadName: l.leadName, leadStatus: l.status })) : [])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


    return {
        totalLeads: leads.length,
        totalConverted: converted.length,
        totalNotConverted: notConverted.length,
        conversionRate,
        avgResponseTime,
        avgClosingTime,
        allFeedbacks
    };
};

const Kpi: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <Card className="p-5 text-center">
        <p className="text-sm font-medium text-dark-secondary">{title}</p>
        <p className="text-3xl font-bold mt-2 text-dark-primary">{value}</p>
    </Card>
);

const FunnelStep: React.FC<{ title: string; count: number; total: number; isLast?: boolean; borderColorClass?: string; }> = ({ title, count, total, isLast = false, borderColorClass = 'border-dark-border' }) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    return (
        <div className="flex flex-col items-center">
            <div className={`bg-dark-background border-2 ${borderColorClass} p-4 rounded-lg text-center w-48`}>
                <p className="font-bold text-dark-text">{title}</p>
                <p className="text-2xl font-extrabold text-dark-primary">{count}</p>
                <p className="text-xs text-dark-secondary">{percentage}% do Total</p>
            </div>
            {!isLast && <ArrowDownIcon className="w-8 h-8 text-dark-secondary my-2" />}
        </div>
    );
};

interface PerformanceScreenProps {
    user: TeamMember;
    leads: ProspectAILead[];
    onBack: () => void;
}

type Period = 'all' | '7d' | 'this_month' | '90d';

const SalespersonProspectPerformanceScreen: React.FC<PerformanceScreenProps> = ({ user, leads, onBack }) => {
    const [period, setPeriod] = useState<Period>('all');
    const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);

    const filteredLeads = useMemo(() => {
        if (period === 'all') return leads;

        const now = new Date();
        let startDate: Date;

        switch (period) {
            case '7d':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                break;
            case 'this_month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case '90d':
                 startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
                break;
            default:
                return leads;
        }
        
        return leads.filter(lead => new Date(lead.createdAt) >= startDate);
    }, [leads, period]);

    const metrics = useMemo(() => calculatePerformanceMetrics(filteredLeads), [filteredLeads]);

    const categorizedLeads = useMemo(() => {
        const categorized: { [key: string]: any[] } = {
            'Novo Lead': [], 'Em Contato': [], 'Agendado': [], 'Finalizado - Convertido': [], 'Finalizado - Não Convertido': [], 'Remanejado': []
        };
        filteredLeads.forEach(lead => categorized[lead.status]?.push(lead));
        return categorized;
    }, [filteredLeads]);

    const periodOptions: { id: Period; label: string }[] = [
        { id: '7d', label: 'Últimos 7 Dias' },
        { id: 'this_month', label: 'Este Mês' },
        { id: '90d', label: 'Últimos 90 Dias' },
        { id: 'all', label: 'Todo o Período' },
    ];

    return (
        <div className="animate-fade-in">
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm text-dark-secondary hover:text-dark-text mb-2">
                        &larr; Voltar ao Pipeline
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-dark-text">Análise de Desempenho</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-dark-card p-1 rounded-lg border border-dark-border flex items-center gap-1">
                        {periodOptions.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setPeriod(opt.id)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                                    period === opt.id ? 'bg-dark-primary text-dark-background' : 'text-dark-secondary hover:bg-dark-border/50'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-dark-card border border-dark-border">
                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                        <span className="font-bold text-dark-text">{user.name}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Kpi title="Total de Leads" value={metrics.totalLeads.toString()} />
                <Kpi title="Taxa de Conversão" value={`${metrics.conversionRate.toFixed(1)}%`} />
                <Kpi title="1º Contato (Média)" value={formatDuration(metrics.avgResponseTime)} />
                <Kpi title="Atendimento (Média)" value={formatDuration(metrics.avgClosingTime)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex flex-col items-center">
                     <h2 className="text-2xl font-bold text-dark-text mb-6">Funil de Vendas</h2>
                     <FunnelStep title="Total de Leads" count={metrics.totalLeads} total={metrics.totalLeads} />
                     <FunnelStep title="Em Contato" count={categorizedLeads['Em Contato'].length + categorizedLeads['Agendado'].length + categorizedLeads['Finalizado - Convertido'].length + categorizedLeads['Finalizado - Não Convertido'].length} total={metrics.totalLeads} />
                     <FunnelStep title="Agendados" count={categorizedLeads['Agendado'].length + categorizedLeads['Finalizado - Convertido'].length + categorizedLeads['Finalizado - Não Convertido'].length} total={metrics.totalLeads} />
                     <FunnelStep 
                        title="Finalizados (Conversão)" 
                        count={categorizedLeads['Finalizado - Convertido'].length} 
                        total={metrics.totalLeads}
                        borderColorClass="border-green-500/60"
                     />
                     <FunnelStep 
                        title="Finalizados (Não Conversão)" 
                        count={categorizedLeads['Finalizado - Não Convertido'].length} 
                        total={metrics.totalLeads} 
                        isLast={true}
                        borderColorClass="border-red-500/60"
                     />
                </div>
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <h2 className="text-2xl font-bold text-dark-text mb-4">Feedbacks Recentes</h2>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {metrics.allFeedbacks.length > 0 ? (
                                metrics.allFeedbacks.map((fb, index) => {
                                    let borderColorClass = 'border-dark-border/50';
                                    if (fb.leadStatus === 'Finalizado - Convertido') {
                                        borderColorClass = 'border-green-500/60';
                                    } else if (fb.leadStatus === 'Finalizado - Não Convertido') {
                                        borderColorClass = 'border-red-500/60';
                                    }

                                    return (
                                        <div key={index} className={`p-3 bg-dark-background/50 rounded-md border ${borderColorClass}`}>
                                            <p className="text-xs text-dark-secondary">
                                                Lead: <span className="font-semibold">{fb.leadName}</span>
                                            </p>
                                            <p className="whitespace-pre-wrap text-sm text-dark-text mt-1">{fb.text}</p>
                                            {fb.images && fb.images.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {fb.images.map((img, i) => (
                                                        <button key={i} onClick={() => setExpandedImageUrl(img)} className="block w-16 h-16 rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-dark-primary">
                                                            <img src={img} alt="feedback" className="w-full h-full object-cover"/>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-right text-dark-secondary/70 mt-2 text-[10px]">{new Date(fb.createdAt).toLocaleString('pt-BR')}</p>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-dark-secondary py-8">Nenhum feedback registrado no período selecionado.</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
            {expandedImageUrl && (
                <ImageLightbox
                    imageUrl={expandedImageUrl}
                    onClose={() => setExpandedImageUrl(null)}
                />
            )}
        </div>
    );
};

export default SalespersonProspectPerformanceScreen;