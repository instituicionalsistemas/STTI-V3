

import React, { useState } from 'react';
import { GrupoEmpresarial } from '../types';
import Modal from '../components/Modal';
import GrupoEmpresarialForm from '../components/forms/GrupoEmpresarialForm';
import GrupoEmpresarialCard from '../components/GrupoEmpresarialCard';
import { PlusIcon } from '../components/icons/PlusIcon';
import { BriefcaseIcon } from '../components/icons/BriefcaseIcon';
import { useData } from '../hooks/useMockData';
import ManageGroupCompaniesModal from '../components/modals/ManageGroupCompaniesModal';
import ConfirmationModal from '../components/ConfirmationModal';

const GruposEmpresariaisScreen: React.FC = () => {
    const { 
        companies, 
        gruposEmpresariais, 
        addGrupoEmpresarial, 
        updateGrupoEmpresarial, 
        updateGrupoCompanies,
        updateGrupoEmpresarialStatus
    } = useData();

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingGrupo, setEditingGrupo] = useState<GrupoEmpresarial | undefined>(undefined);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedGrupo, setSelectedGrupo] = useState<GrupoEmpresarial | null>(null);
    const [isStatusConfirmOpen, setStatusConfirmOpen] = useState(false);
    const [statusChangeInfo, setStatusChangeInfo] = useState<{ id: string; name: string; newStatus: boolean } | null>(null);

    const handleOpenFormModal = (grupo?: GrupoEmpresarial) => {
        setEditingGrupo(grupo);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setEditingGrupo(undefined);
        setIsFormModalOpen(false);
    };

    const handleOpenManageModal = (grupo: GrupoEmpresarial) => {
        setSelectedGrupo(grupo);
        setIsManageModalOpen(true);
    };

    const handleCloseManageModal = () => {
        setSelectedGrupo(null);
        setIsManageModalOpen(false);
    };

    const handleStatusChangeRequest = (grupo: GrupoEmpresarial) => {
        setStatusChangeInfo({ id: grupo.id, name: grupo.name, newStatus: !grupo.isActive });
        setStatusConfirmOpen(true);
    };

    const confirmStatusChange = async () => {
        if (statusChangeInfo) {
            await updateGrupoEmpresarialStatus(statusChangeInfo.id, statusChangeInfo.newStatus);
        }
        setStatusConfirmOpen(false);
        setStatusChangeInfo(null);
    };

    const handleSaveGrupo = async (data: Omit<GrupoEmpresarial, 'id' | 'companyIds' | 'createdAt' | 'isActive'>, password?: string) => {
        if (editingGrupo) {
            await updateGrupoEmpresarial({ ...editingGrupo, ...data });
        } else if (password) {
            await addGrupoEmpresarial(data, password);
        }
        handleCloseFormModal();
    };

    const handleSaveCompanySelection = async (groupId: string, companyIds: string[]) => {
        await updateGrupoCompanies(groupId, companyIds);
        handleCloseManageModal();
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark-text">Grupos Empresariais</h1>
                <button 
                    onClick={() => handleOpenFormModal()} 
                    className="flex items-center gap-2 bg-dark-primary text-dark-background px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-bold"
                >
                    <PlusIcon />
                    <span>Criar Novo Grupo</span>
                </button>
            </div>

            {gruposEmpresariais.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gruposEmpresariais.map(grupo => (
                        <GrupoEmpresarialCard 
                            key={grupo.id}
                            grupo={grupo}
                            onManage={() => handleOpenManageModal(grupo)}
                            onEdit={(e) => {
                                e.stopPropagation();
                                handleOpenFormModal(grupo);
                            }}
                            onStatusChange={(e) => {
                                e.stopPropagation();
                                handleStatusChangeRequest(grupo);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-16 bg-dark-card rounded-2xl border border-dark-border">
                    <BriefcaseIcon className="w-16 h-16 mx-auto text-dark-secondary" />
                    <h2 className="text-2xl font-bold text-dark-text mt-4">Nenhum grupo empresarial cadastrado</h2>
                    <p className="text-dark-secondary mt-2">Clique em "Criar Novo Grupo" para começar.</p>
                </div>
            )}
            
            <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal}>
                <GrupoEmpresarialForm
                    initialData={editingGrupo}
                    onSave={handleSaveGrupo}
                    onClose={handleCloseFormModal}
                />
            </Modal>
            
            {selectedGrupo && (
                <ManageGroupCompaniesModal
                    isOpen={isManageModalOpen}
                    onClose={handleCloseManageModal}
                    grupo={selectedGrupo}
                    allCompanies={companies}
                    onSave={handleSaveCompanySelection}
                />
            )}

            <ConfirmationModal
                isOpen={isStatusConfirmOpen}
                onClose={() => setStatusConfirmOpen(false)}
                onConfirm={confirmStatusChange}
                title="Confirmar Alteração de Status"
                confirmButtonText={statusChangeInfo?.newStatus ? "Sim, Ativar" : "Sim, Inativar"}
                confirmButtonClass={statusChangeInfo?.newStatus ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'}
            >
                Você tem certeza que deseja {statusChangeInfo?.newStatus ? 'ATIVAR' : 'INATIVAR'} o grupo "{statusChangeInfo?.name}"?
            </ConfirmationModal>
        </div>
    );
};

export default GruposEmpresariaisScreen;