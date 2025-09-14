import React, { useState, useEffect, FormEvent } from 'react';
import { Reminder, TeamMember } from '../../types';

interface ReminderFormProps {
  initialData?: Reminder;
  preselectedAssigneeId?: string | null;
  onSave: (reminder: Omit<Reminder, 'id' | 'createdAt'> | Reminder) => void;
  onCancel: () => void;
  teamMembers: TeamMember[];
}

type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

const weekDayOptions: { id: WeekDay; label: string }[] = [
    { id: 'sun', label: 'D' },
    { id: 'mon', label: 'S' },
    { id: 'tue', label: 'T' },
    { id: 'wed', label: 'Q' },
    { id: 'thu', label: 'Q' },
    { id: 'fri', label: 'S' },
    { id: 'sat', label: 'S' },
];

const ReminderForm: React.FC<ReminderFormProps> = ({ initialData, preselectedAssigneeId, onSave, onCancel, teamMembers }) => {
  const [formData, setFormData] = useState({
    category: '',
    message: '',
    assigneeId: 'everyone',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    repetition: 'none' as Reminder['repetition'],
    weekDays: [] as WeekDay[],
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category,
        message: initialData.message,
        assigneeId: initialData.assigneeId,
        date: initialData.date,
        time: initialData.time,
        repetition: initialData.repetition,
        weekDays: initialData.weekDays || [],
        isActive: initialData.isActive,
      });
    } else if (preselectedAssigneeId) {
        setFormData(prev => ({...prev, assigneeId: preselectedAssigneeId}));
    }
  }, [initialData, preselectedAssigneeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleWeekDayChange = (day: WeekDay) => {
    setFormData(prev => {
        const newWeekDays = prev.weekDays.includes(day)
            ? prev.weekDays.filter(d => d !== day)
            : [...prev.weekDays, day];
        return { ...prev, weekDays: newWeekDays };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData };
    if (finalData.repetition !== 'weekly') {
        finalData.weekDays = [];
    }
    
    if (initialData?.id) {
        onSave({ ...initialData, ...finalData });
    } else {
        onSave(finalData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2">
      <h2 className="text-2xl font-bold text-center mb-6">{initialData ? 'Editar Lembrete' : 'Novo Lembrete'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label htmlFor="category" className="label-style">Categoria</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} className="input-style" placeholder="Ex: Follow-up, Marketing" required/>
        </div>
        <div>
            <label htmlFor="assigneeId" className="label-style">Atribuir Para</label>
            <select name="assigneeId" value={formData.assigneeId} onChange={handleChange} className="input-style">
                <option value="everyone">Todos</option>
                {teamMembers.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
            </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="label-style">Mensagem do Lembrete</label>
        <textarea name="message" rows={3} value={formData.message} onChange={handleChange} className="input-style" placeholder="Descreva a tarefa ou lembrete..." required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
            <label htmlFor="date" className="label-style">Data de Início</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-style"/>
        </div>
        <div>
            <label htmlFor="time" className="label-style">Horário</label>
            <input type="time" name="time" value={formData.time} onChange={handleChange} className="input-style"/>
        </div>
        <div>
            <label htmlFor="repetition" className="label-style">Repetição</label>
            <select name="repetition" value={formData.repetition} onChange={handleChange} className="input-style">
                <option value="none">Não repetir</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
            </select>
        </div>
      </div>
      
      {formData.repetition === 'weekly' && (
        <div className="animate-fade-in">
            <label className="label-style">Repetir nos dias</label>
            <div className="flex items-center justify-center gap-2 mt-2">
                {weekDayOptions.map(day => (
                     <button
                        type="button"
                        key={day.id}
                        onClick={() => handleWeekDayChange(day.id)}
                        className={`w-10 h-10 rounded-full font-bold text-sm transition-colors ${
                            formData.weekDays.includes(day.id) 
                            ? 'bg-dark-primary text-dark-background' 
                            : 'bg-dark-background hover:bg-dark-border'
                        }`}
                    >
                        {day.label}
                    </button>
                ))}
            </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-dark-border/50 hover:bg-dark-border transition-colors font-bold">Cancelar</button>
        <button type="submit" className="px-4 py-2 rounded-md bg-dark-primary text-dark-background font-bold hover:opacity-90 transition-opacity">Salvar Lembrete</button>
      </div>

      <style>{`
        .label-style { display: block; font-size: 0.875rem; font-weight: 500; color: #8A93A3; margin-bottom: 0.25rem; }
        .input-style { width: 100%; padding: 0.5rem 0.75rem; background-color: #0A0F1E; border: 1px solid #243049; border-radius: 0.375rem; color: #E0E0E0; }
        .input-style:focus { outline: none; box-shadow: 0 0 0 2px #00D1FF; }
      `}</style>
    </form>
  );
};

export default ReminderForm;