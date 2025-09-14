

import React, { useMemo, useState, useEffect } from 'react';
import Card from '../components/Card';
import { TeamMember, ProspectAILead, LeadStatus } from '../types';
import { useData } from '../hooks/useMockData';
import LeadCard from '../components/LeadCard';
import ConfirmationModal from '../components/ConfirmationModal';
import SalespersonProspectPerformanceScreen from './SalespersonProspectPerformanceScreen';
import { ChartBarIcon } from '../components/icons/ChartBarIcon';
import UserProfileDropdown from '../components/UserProfileDropdown';
import NotificationBell from '../components/NotificationBell';
import Modal from '../components/Modal';
import UserProfileForm from '../components/forms/UserProfileForm';
import ChangePasswordForm from '../components/forms/ChangePasswordForm';
import { formatTimeUntil } from '../utils/dateUtils';
import ReassignLeadModal from '../components/modals/ReassignLeadModal';

interface ProspectAIScreenProps {
    onBack: () => void;
    user: TeamMember;
    onLogout: () => void;
    showBackButton?: boolean;
    isManagerView?: boolean;
    allSalespeople?: TeamMember[];
}

const ProspectCard: React.FC<{ title: string; count: number; color: string; }> = ({ title, count, color }) => {
  return (
    <Card className="p-4 text-center animate-fade-in">
      <p className="text-sm font-medium text-dark-secondary">{title}</p>
      <p className="text-4xl font-bold mt-2" style={{ color }}>{count}</p>
    </Card>
  );
};

const ProspectColumn: React.FC<{ title: string; count: number; children: React.ReactNode; }> = ({ title, count, children }) => {
  return (
    <div className="bg-dark-card/50 p-4 rounded-lg flex flex-col gap-4 animate-fade-in min-h-[200px]">
      <h3 className="text-lg font-bold text-dark-text">{title} ({count})</h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};


const ProspectAIScreen: React.FC<ProspectAIScreenProps> = ({ onBack, user, onLogout, showBackButton = true, isManagerView = false, allSalespeople = [] }) => {
    const { 
        prospectaiLeads, 
        updateProspectLeadStatus,
        reassignProspectLead,
        companies,
        notifications,
        markNotificationAsRead,
        addNotification,
        teamMembers,
    } = useData();
    const [prospectingLead, setProspectingLead] = useState<ProspectAILead | null>(null);
    const [isPerformanceView, setIsPerformanceView] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [leadToReassign, setLeadToReassign] = useState<ProspectAILead | null>(null);


    // APPOINTMENT NOTIFICATION LOGIC
    useEffect(() => {
        const NOTIFIED_APPOINTMENTS_KEY = `notified_appointments_${user.id}`;

        const checkAppointments = () => {
            const notifiedIds: string[] = JSON.parse(sessionStorage.getItem(NOTIFIED_APPOINTMENTS_KEY) || '[]');
            const upcomingAppointments = prospectaiLeads.filter(lead => {
                if (lead.salespersonId !== user.id || lead.status !== 'Agendado' || !lead.appointment_at) {
                    return false;
                }
                const appointmentDate = new Date(lead.appointment_at);
                const now = new Date();
                const diffHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                
                // Notificar sobre agendamentos nas próximas 48 horas (hoje e amanhã) que ainda não ocorreram.
                return diffHours > 0 && diffHours <= 48;
            });

            const newNotifiedIds = [...notifiedIds];

            upcomingAppointments.forEach(lead => {
                if (!notifiedIds.includes(lead.id)) {
                    const timeUntil = formatTimeUntil(lead.appointment_at!);
                    const lastFeedback = lead.feedback && lead.feedback.length > 0 ? lead.feedback[lead.feedback.length - 1].text : null;

                    let message = `Lembrete: Agendamento com ${lead.leadName} ${timeUntil}.`;
                    if (lastFeedback) {
                        message += ` | Último feedback: "${lastFeedback}"`;
                    }
                    
                    // Envia uma notificação específica para este usuário
                    addNotification(message, 'salesperson', user.id);
                    
                    newNotifiedIds.push(lead.id);
                }
            });

            sessionStorage.setItem(NOTIFIED_APPOINTMENTS_KEY, JSON.stringify(newNotifiedIds));
        };

        // Verifica imediatamente ao carregar e depois a cada minuto
        checkAppointments();
        const intervalId = setInterval(checkAppointments, 60000); 

        return () => clearInterval(intervalId);

    }, [user.id, prospectaiLeads, addNotification]);

    const myLeads = useMemo(() => {
        // A pipeline de um usuário inclui leads atualmente atribuídos a ele,
        // E leads que foram remanejados a partir dele (que agora pertencem a outra pessoa).
        return prospectaiLeads.filter(lead => 
            lead.salespersonId === user.id || 
            lead.details?.reassigned_from === user.id
        );
    }, [prospectaiLeads, user.id]);
    
    const activeCompany = useMemo(() => companies.find(c => c.id === user.companyId), [companies, user.companyId]);
    const userNotifications = useMemo(() => notifications.filter(n => (n.recipientRole === 'salesperson' && !n.userId) || n.userId === user.id), [notifications, user.id]);

    const categorizedLeads = useMemo(() => {
        const initialCategories: Record<LeadStatus, ProspectAILead[]> = {
            'Novo Lead': [], 'Em Contato': [], 'Segunda Tentativa': [], 'Terceira Tentativa': [],
            'Agendado': [], 'Finalizado - Convertido': [], 'Finalizado - Não Convertido': [], 'Remanejado': []
        };

        myLeads.forEach(lead => {
            if (lead.status === 'Remanejado') {
                // Se foi remanejado PARA mim, é um novo lead.
                if (lead.salespersonId === user.id) {
                    initialCategories['Novo Lead'].push(lead);
                } 
                // Se foi remanejado DE mim, vai para a coluna de remanejados.
                else if (lead.details?.reassigned_from === user.id) {
                    initialCategories['Remanejado'].push(lead);
                }
            } else if (lead.salespersonId === user.id) {
                // Categorização normal para meus outros leads.
                 if (initialCategories[lead.status]) {
                    initialCategories[lead.status].push(lead);
                }
            }
        });
        return initialCategories;
    }, [myLeads, user.id]);

    const hasLeadInProgress = useMemo(() => {
        return categorizedLeads['Em Contato'].length > 0;
    }, [categorizedLeads]);

    const handleStartProspecting = async () => {
        if (prospectingLead) {
            await updateProspectLeadStatus(prospectingLead.id, 'Em Contato');
            setProspectingLead(null);
        }
    };
    
    const handleConfirmReassignment = async (newOwnerId: string) => {
        if (leadToReassign) {
            await reassignProspectLead(leadToReassign.id, newOwnerId, leadToReassign.salespersonId);
            setLeadToReassign(null);
        }
    };


    const counts = useMemo(() => ({
        total: myLeads.filter(l => l.salespersonId === user.id).length,
        converted: categorizedLeads['Finalizado - Convertido'].length,
        inProgress: categorizedLeads['Em Contato'].length + categorizedLeads['Agendado'].length,
        notConverted: categorizedLeads['Finalizado - Não Convertido'].length,
        reallocated: categorizedLeads['Remanejado'].length,
        new: categorizedLeads['Novo Lead'].length,
        contact: categorizedLeads['Em Contato'].length,
        secondAttempt: categorizedLeads['Segunda Tentativa'].length,
        thirdAttempt: categorizedLeads['Terceira Tentativa'].length,
        scheduled: categorizedLeads['Agendado'].length,
        finished: categorizedLeads['Finalizado - Convertido'].length + categorizedLeads['Finalizado - Não Convertido'].length,
    }), [myLeads, user.id, categorizedLeads]);

    const placeholderCard = (
        <div className="border-2 border-dashed border-dark-border rounded-lg p-8 text-center text-dark-secondary">
            Nenhum lead nesta etapa.
        </div>
    );

    if (!activeCompany) {
        return <div>Carregando...</div>;
    }

    if (isPerformanceView) {
        return (
            <SalespersonProspectPerformanceScreen
                user={user}
                leads={myLeads}
                onBack={() => setIsPerformanceView(false)}
            />
        );
    }

    return (
        <div className="animate-fade-in">
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    {showBackButton && (
                        <button onClick={onBack} className="flex items-center gap-2 text-sm text-dark-secondary hover:text-dark-text mb-2">
                            &larr; Voltar
                        </button>
                    )}
                    <h1 className="text-3xl sm:text-4xl font-bold text-dark-text">Pipeline de Prospecção</h1>
                </div>
                 <div className="flex items-center gap-4">
                     <button
                        onClick={() => setIsPerformanceView(true)}
                        className="flex items-center gap-2 bg-dark-card border border-dark-border px-4 py-2 rounded-lg hover:border-dark-primary transition-colors font-medium text-sm"
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        Analisar Desempenho
                    </button>
                    <NotificationBell
                        notifications={userNotifications}
                        onMarkAsRead={markNotificationAsRead}
                    />
                    <UserProfileDropdown
                        company={{ ...activeCompany, name: user.name, logoUrl: user.avatarUrl, email: user.email }}
                        onEditProfile={() => setEditProfileModalOpen(true)}
                        onChangePassword={() => setChangePasswordModalOpen(true)}
                        onLogout={onLogout}
                        onManageTeam={() => {}}
                    />
                </div>
            </header>

            {/* Top Row Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-8">
                <ProspectCard title="Meus Leads Atribuídos" count={counts.total} color="#00D1FF" />
                <ProspectCard title="Leads Convertidos" count={counts.converted} color="#22C55E" />
                <ProspectCard title="Em Atendimento" count={counts.contact} color="#FBBF24" />
                <ProspectCard title="Segunda Tentativa" count={counts.secondAttempt} color="#F59E0B" />
                <ProspectCard title="Terceira Tentativa" count={counts.thirdAttempt} color="#8B5CF6" />
                <ProspectCard title="Leads Agendados" count={counts.scheduled} color="#60A5FA" />
                <ProspectCard title="Leads Não Convertidos" count={counts.notConverted} color="#EF4444" />
                <ProspectCard title="Leads Remanejados" count={counts.reallocated} color="#A78BFA" />
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6">
                <ProspectColumn title="Novos Leads" count={counts.new}>
                    {categorizedLeads['Novo Lead'].length > 0
                        ? categorizedLeads['Novo Lead'].map(lead => <LeadCard key={lead.id} lead={lead} onClick={() => setProspectingLead(lead)} isDisabled={hasLeadInProgress} isManagerView={isManagerView} onReassign={setLeadToReassign} />)
                        : placeholderCard
                    }
                </ProspectColumn>
                <ProspectColumn title="Em Contato" count={counts.contact}>
                    {categorizedLeads['Em Contato'].length > 0
                        ? categorizedLeads['Em Contato'].map(lead => <LeadCard key={lead.id} lead={lead} isManagerView={isManagerView} onReassign={setLeadToReassign} allSalespeople={teamMembers} />)
                        : placeholderCard
                    }
                </ProspectColumn>
                 <ProspectColumn title="Segunda Tentativa" count={counts.secondAttempt}>
                    {categorizedLeads['Segunda Tentativa'].length > 0
                        ? categorizedLeads['Segunda Tentativa'].map(lead => <LeadCard key={lead.id} lead={lead} isManagerView={isManagerView} onReassign={setLeadToReassign} allSalespeople={teamMembers} />)
                        : placeholderCard
                    }
                </ProspectColumn>
                 <ProspectColumn title="Terceira Tentativa" count={counts.thirdAttempt}>
                    {categorizedLeads['Terceira Tentativa'].length > 0
                        ? categorizedLeads['Terceira Tentativa'].map(lead => <LeadCard key={lead.id} lead={lead} isManagerView={isManagerView} onReassign={setLeadToReassign} allSalespeople={teamMembers} />)
                        : placeholderCard
                    }
                </ProspectColumn>
                <ProspectColumn title="Agendados" count={counts.scheduled}>
                     {categorizedLeads['Agendado'].length > 0
                        ? categorizedLeads['Agendado'].map(lead => <LeadCard key={lead.id} lead={lead} isManagerView={isManagerView} onReassign={setLeadToReassign} allSalespeople={teamMembers}/>)
                        : placeholderCard
                    }
                </ProspectColumn>
                <ProspectColumn title="Finalizados" count={counts.finished}>
                    {(categorizedLeads['Finalizado - Convertido'].length > 0 || categorizedLeads['Finalizado - Não Convertido'].length > 0)
                        ? [...categorizedLeads['Finalizado - Convertido'], ...categorizedLeads['Finalizado - Não Convertido']]
                            .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map(lead => <LeadCard key={lead.id} lead={lead} isManagerView={isManagerView} allSalespeople={teamMembers} />)
                        : placeholderCard
                    }
                </ProspectColumn>
                <ProspectColumn title="Remanejados" count={counts.reallocated}>
                     {categorizedLeads['Remanejado'].length > 0
                        ? categorizedLeads['Remanejado'].map(lead => <LeadCard key={lead.id} lead={lead} isReassignedAwayView={true} isManagerView={isManagerView} allSalespeople={teamMembers} />)
                        : placeholderCard
                    }
                </ProspectColumn>
            </div>

            <ConfirmationModal
                isOpen={!!prospectingLead}
                onClose={() => setProspectingLead(null)}
                onConfirm={handleStartProspecting}
                title="Iniciar Prospecção"
                confirmButtonText="Iniciar Prospecção"
                confirmButtonClass="bg-green-600 hover:bg-green-700"
            >
                Deseja mover o lead <strong className="text-dark-text">{prospectingLead?.leadName}</strong> para a etapa "Em Contato"?
            </ConfirmationModal>

             {leadToReassign && (
                <ReassignLeadModal
                    isOpen={!!leadToReassign}
                    onClose={() => setLeadToReassign(null)}
                    lead={leadToReassign}
                    salespeople={allSalespeople.filter(sp => sp.id !== leadToReassign.salespersonId)}
                    onConfirm={handleConfirmReassignment}
                />
            )}

            <Modal isOpen={isEditProfileModalOpen} onClose={() => setEditProfileModalOpen(false)}>
                <UserProfileForm initialData={user} onClose={() => setEditProfileModalOpen(false)} />
            </Modal>
            
            <Modal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)}>
                <ChangePasswordForm onClose={() => setChangePasswordModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ProspectAIScreen;