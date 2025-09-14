import React, { useState } from 'react';
import { TeamMember } from '../types';
import TeamMemberForm from './forms/SalespersonForm';
import TeamMemberCard from './UserProfileCard';
import { PlusIcon } from './icons/PlusIcon';

interface TeamManagementProps {
    teamMembers: TeamMember[];
    onClose: () => void;
    onDeleteMember: (id: string) => void;
    companyId: string;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ teamMembers, onClose, onDeleteMember, companyId }) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingMember, setEditingMember] = useState<TeamMember | undefined>(undefined);

    const handleAddNew = () => {
        setEditingMember(undefined);
        setView('form');
    };

    const handleEdit = (member: TeamMember) => {
        setEditingMember(member);
        setView('form');
    };

    const handleFormClose = () => {
        setEditingMember(undefined);
        setView('list');
    };

    return (
        <div className="p-2">
            {view === 'list' && (
                <>
                    <div className="flex justify-between items-center mb-6">
                         <h2 className="text-2xl font-bold text-dark-text">Gerenciar Equipe</h2>
                         <button onClick={handleAddNew} className="flex items-center gap-2 bg-dark-primary text-dark-background px-3 py-2 rounded-lg hover:opacity-90 transition-opacity font-bold text-sm">
                            <PlusIcon className="w-4 h-4" /> Adicionar Membro
                        </button>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {teamMembers.map(member => (
                            <TeamMemberCard 
                                key={member.id}
                                user={member}
                                onEdit={() => handleEdit(member)}
                                onDelete={() => onDeleteMember(member.id)}
                            />
                        ))}
                         {teamMembers.length === 0 && (
                             <p className="text-center text-dark-secondary py-8">Nenhum membro da equipe cadastrado.</p>
                         )}
                    </div>
                </>
            )}

            {view === 'form' && (
                <TeamMemberForm 
                    initialData={editingMember}
                    onClose={handleFormClose}
                    companyId={companyId}
                />
            )}
        </div>
    );
};

export default TeamManagement;