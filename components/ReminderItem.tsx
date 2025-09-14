import React from 'react';
import { Reminder } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ReminderItemProps {
    reminder: Reminder;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}

const formatRepetition = (reminder: Reminder): string => {
    const time = reminder.time;
    switch (reminder.repetition) {
        case 'daily': return `Diariamente às ${time}`;
        case 'weekly': 
            const weekDaysFormatted = reminder.weekDays?.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ') || '';
            return `Semanal (${weekDaysFormatted}) às ${time}`;
        case 'monthly': return `Mensalmente às ${time}`;
        default: 
            const date = new Date(reminder.date + 'T00:00:00');
            return `Em ${date.toLocaleDateString('pt-BR')} às ${time}`;
    }
};

const ReminderItem: React.FC<ReminderItemProps> = ({ reminder, onEdit, onDelete, onToggle }) => {
    return (
        <div className={`p-3 rounded-lg bg-dark-background/50 border border-dark-border/50 transition-opacity ${!reminder.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold uppercase px-2 py-0.5 bg-dark-primary/20 text-dark-primary rounded">{reminder.category}</span>
                    </div>
                    <p className="text-dark-text font-medium text-sm">{reminder.message}</p>
                    <p className="text-xs text-dark-secondary mt-1">
                        {formatRepetition(reminder)}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <label htmlFor={`toggle-item-${reminder.id}`} className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" id={`toggle-item-${reminder.id}`} className="sr-only peer" checked={reminder.isActive} onChange={onToggle} />
                            <div className="w-10 h-5 bg-dark-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-dark-primary"></div>
                        </div>
                    </label>
                    <button onClick={onEdit} className="p-1.5 rounded-full text-dark-secondary hover:bg-dark-border"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="p-1.5 rounded-full text-red-500/70 hover:bg-dark-border hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};

export default ReminderItem;
