import React from 'react';
import { TeamMember, Reminder } from '../types';
import Card from './Card';
import { PlusIcon } from './icons/PlusIcon';
import ReminderItem from './ReminderItem';

interface TeamMemberReminderCardProps {
    member: TeamMember;
    reminders: Reminder[];
    onAdd: () => void;
    onEdit: (reminder: Reminder) => void;
    onDelete: (id: string) => void;
    onToggle: (reminder: Reminder) => void;
}

const TeamMemberReminderCard: React.FC<TeamMemberReminderCardProps> = ({ member, reminders, onAdd, onEdit, onDelete, onToggle }) => {
    return (
        <Card className="p-5">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <img src={member.avatarUrl} alt={member.name} className="w-12 h-12 rounded-full" />
                    <div>
                        <h3 className="text-xl font-bold text-dark-text">{member.name}</h3>
                        <p className="text-sm font-medium text-dark-secondary">{member.role}</p>
                    </div>
                </div>
                <button 
                    onClick={onAdd}
                    className="flex items-center gap-2 bg-dark-card border border-dark-border px-3 py-1.5 rounded-lg hover:border-dark-primary transition-colors font-medium text-sm text-dark-primary"
                >
                    <PlusIcon className="w-4 h-4" />
                    Adicionar
                </button>
            </div>

            <div className="space-y-3 pt-4 border-t border-dark-border">
                {reminders.length > 0 ? (
                    reminders.map(reminder => (
                        <ReminderItem
                            key={reminder.id}
                            reminder={reminder}
                            onEdit={() => onEdit(reminder)}
                            onDelete={() => onDelete(reminder.id)}
                            onToggle={() => onToggle(reminder)}
                        />
                    ))
                ) : (
                    <p className="text-center text-sm text-dark-secondary py-4">Nenhum lembrete para {member.name.split(' ')[0]}.</p>
                )}
            </div>
        </Card>
    );
};

export default TeamMemberReminderCard;
