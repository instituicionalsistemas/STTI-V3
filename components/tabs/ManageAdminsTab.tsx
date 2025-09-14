import React, { useState } from 'react';
import { useData } from '../../hooks/useMockData';
import { AdminUser } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import Modal from '../Modal';
import AdminUserForm from '../forms/AdminUserForm';
import ConfirmationModal from '../ConfirmationModal';

const ManageAdminsTab: React.FC = () => {
    const { adminUsers, deleteAdminUser } = useData();
    const [isFormOpen, setFormOpen] = useState(false);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | undefined>(undefined);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    const handleAdd = () => {
        setEditingUser(undefined);
        setFormOpen(true);
    };

    const handleEdit = (user: AdminUser) => {
        setEditingUser(user);
        setFormOpen(true);
    };
    
    const handleDeleteRequest = (id: string) => {
        setDeletingUserId(id);
        setConfirmOpen(true);
    };

    const confirmDeletion = () => {
        if (deletingUserId) {
            deleteAdminUser(deletingUserId);
        }
        setConfirmOpen(false);
        setDeletingUserId(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Usuários Administradores</h3>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-dark-primary text-dark-background px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity font-bold text-sm"
                >
                    <PlusIcon className="w-4 h-4" /> Novo Admin
                </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {adminUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-dark-background rounded-lg border border-dark-border">
                        <div>
                            <p className="font-bold">{user.name}</p>
                            <p className="text-sm text-dark-secondary">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(user)} className="p-2 rounded-full text-dark-secondary hover:text-dark-text"><PencilIcon /></button>
                            {/* Assuming we can't delete the main admin */}
                            {user.id !== 'admin1' && (
                                <button onClick={() => handleDeleteRequest(user.id)} className="p-2 rounded-full text-red-500/70 hover:text-red-500"><TrashIcon /></button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isFormOpen} onClose={() => setFormOpen(false)}>
                <AdminUserForm initialData={editingUser} onClose={() => setFormOpen(false)} />
            </Modal>
            
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmDeletion}
                title="Confirmar Exclusão"
            >
                Tem certeza que deseja remover este administrador? Esta ação não pode ser desfeita.
            </ConfirmationModal>
        </div>
    );
};

export default ManageAdminsTab;