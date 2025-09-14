import React from 'react';
import { Reminder, TeamMember } from '../types';
import Card from './Card';
import { ClockIcon } from './icons/ClockIcon';

interface RecentRemindersCardProps {
    reminders: Reminder[];
    teamMembers: TeamMember[];
    everyoneReminders: Reminder[];
}

const RecentRemindersCard: React.FC<RecentRemindersCardProps> = ({ reminders, teamMembers, everyoneReminders }) => {

    const recentReminders = [...reminders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
        
    const getAssigneeName = (id: string) => {
        if (id === 'everyone') return 'Todos';
        return teamMembers.find(tm => tm.id === id)?.name || 'Desconhecido';
    };

    return (
        <Card className="p-5 sticky top-8">
            <h3 className="font-bold text-xl mb-4 text-dark-text">Últimos Lembretes</h3>
            <div className="space-y-3">
                {recentReminders.length > 0 ? (
                    recentReminders.map(reminder => (
                        <div key={reminder.id} className="p-3 rounded-lg bg-dark-background border border-dark-border">
                            <p className="text-sm font-medium text-dark-text leading-tight">{reminder.message}</p>
                            <p className="text-xs text-dark-secondary mt-2">
                                Para: <span className="font-semibold">{getAssigneeName(reminder.assigneeId)}</span>
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-center py-4 text-dark-secondary">Nenhum lembrete cadastrado.</p>
                )}
            </div>
            
            {everyoneReminders.length > 0 && (
                <div className="mt-6 pt-4 border-t border-dark-border">
                    <h4 className="font-semibold text-dark-text mb-3">Lembretes para Todos</h4>
                     <div className="space-y-2">
                         {everyoneReminders.map(reminder => (
                            <div key={reminder.id} className="flex items-center gap-2 p-2 rounded-md bg-dark-background/50">
                                <ClockIcon className="w-4 h-4 text-dark-secondary flex-shrink-0" />
                                <p className="text-sm text-dark-secondary leading-tight">{reminder.message}</p>
                            </div>
                         ))}
                     </div>
                </div>
            )}
        </Card>
    );
};

export default RecentRemindersCard;
