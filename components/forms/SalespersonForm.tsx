import React, { useState, useEffect, FormEvent } from 'react';
import { TeamMember } from '../../types';
import { useData } from '../../hooks/useMockData';

interface TeamMemberFormProps {
  initialData?: TeamMember;
  onClose: () => void;
  companyId: string;
}

const TeamMemberForm: React.FC<TeamMemberFormProps> = ({ initialData, onClose, companyId }) => {
  const { addTeamMember, updateTeamMember } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    monthlySalesGoal: 5,
    role: 'Vendedor' as TeamMember['role'],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        name: initialData.name, 
        email: initialData.email, 
        phone: initialData.phone || '',
        monthlySalesGoal: initialData.monthlySalesGoal || 5,
        role: initialData.role,
      });
    } else {
      setFormData({ name: '', email: '', phone: '', monthlySalesGoal: 5, role: 'Vendedor' });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const type = 'type' in e.target ? e.target.type : 'select-one';

    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (initialData?.id) {
        updateTeamMember({
            ...initialData,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            monthlySalesGoal: formData.role === 'Vendedor' ? formData.monthlySalesGoal : 0,
            role: formData.role,
        });
    } else {
        addTeamMember({
          ...formData,
          monthlySalesGoal: formData.role === 'Vendedor' ? formData.monthlySalesGoal : 0,
        }, companyId);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">{initialData ? 'Editar Membro da Equipe' : 'Adicionar Novo Membro'}</h2>
      
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-dark-secondary mb-1">Cargo / Função na Empresa</label>
        <p className="text-xs text-dark-secondary/70 mb-2 -mt-1">Define o nível de acesso e as responsabilidades do usuário.</p>
        <select
          name="role"
          id="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary disabled:bg-dark-background/50 disabled:cursor-not-allowed"
          disabled={initialData?.role === 'Gestor'}
        >
          {initialData?.role === 'Gestor' && <option value="Gestor">Gestor</option>}
          <option value="Vendedor">Vendedor</option>
          <option value="Gestor de Tráfego">Gestor de Tráfego</option>
        </select>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-dark-secondary mb-1">Nome Completo</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-dark-secondary mb-1">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary disabled:bg-dark-background/50 disabled:cursor-not-allowed"
          required
          disabled={!!initialData}
        />
      </div>
       <div>
        <label htmlFor="phone" className="block text-sm font-medium text-dark-secondary mb-1">Telefone (WhatsApp)</label>
        <input
          type="tel"
          name="phone"
          id="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(11) 99999-9999"
          className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary"
        />
      </div>
      
      {formData.role === 'Vendedor' && (
        <div>
          <label htmlFor="monthlySalesGoal" className="block text-sm font-medium text-dark-secondary mb-1">Meta de Vendas Mensal (unidades)</label>
          <input
            type="number"
            name="monthlySalesGoal"
            id="monthlySalesGoal"
            value={formData.monthlySalesGoal}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary"
            required
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-dark-border/50 hover:bg-dark-border transition-colors">Cancelar</button>
        <button type="submit" className="px-4 py-2 rounded-md bg-dark-primary text-dark-background font-bold hover:opacity-90 transition-opacity">Salvar</button>
      </div>
    </form>
  );
};

export default TeamMemberForm;