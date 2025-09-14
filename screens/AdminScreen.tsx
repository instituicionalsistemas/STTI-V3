import React, { useState } from 'react';
import { useData } from '../hooks/useMockData';
import type { Company } from '../types';
import { PlusIcon } from '../components/icons/PlusIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import Modal from '../components/Modal';
import CompanyForm from '../components/forms/CompanyForm';
import ConfirmationModal from '../components/ConfirmationModal';
import { HistoryIcon } from '../components/icons/HistoryIcon';
import LogCenterScreen from './LogCenterScreen';

const CompanyRow: React.FC<{ company: Company; onStatusChange: (id: string, status: boolean) => void; onEdit: (company: Company) => void; onDelete: (id: string) => void; }> = ({ company, onStatusChange, onEdit, onDelete }) => {
    const handleToggle = () => {
        onStatusChange(company.id, !company.isActive);
    };

    return (
        <tr className="border-b border-dark-border last:border-b-0 hover:bg-dark-background/50 transition-colors">
            <td className="p-4 flex items-center gap-4">
                <img src={company.logoUrl} alt={`${company.name} logo`} className="w-10 h-10 rounded-full" />
                <span className="font-medium text-dark-text">{company.name}</span>
            </td>
            <td className="p-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${company.isActive 
                    ? 'bg-green-500/10 text-green-400' 
                    : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {company.isActive ? 'Ativa' : 'Pendente'}
                </span>
            </td>
            <td className="p-4">
                <label htmlFor={`toggle-${company.id}`} className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" id={`toggle-${company.id}`} className="sr-only peer" checked={company.isActive} onChange={handleToggle} />
                        <div className="w-11 h-6 bg-dark-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dark-primary"></div>
                    </div>
                </label>
            </td>
            <td className="p-4">
                <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(company)} className="p-2 rounded-md text-dark-secondary hover:text-dark-text transition-colors"><PencilIcon /></button>
                    <button onClick={() => onDelete(company.id)} className="p-2 rounded-md text-red-500/70 hover:text-red-500 transition-colors"><TrashIcon /></button>
                </div>
            </td>
        </tr>
    );
};


const AdminScreen: React.FC = () => {
    const { companies, updateCompanyStatus, deleteCompany } = useData();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [isStatusConfirmOpen, setStatusConfirmOpen] = useState(false);
    const [statusChangeInfo, setStatusChangeInfo] = useState<{ id: string; name: string; newStatus: boolean } | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<Company | undefined>(undefined);
    const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'companies' | 'logs'>('companies');

    const handleAddNew = () => {
        setSelectedCompany(undefined);
        setFormModalOpen(true);
    };

    const handleEdit = (company: Company) => {
        setSelectedCompany(company);
        setFormModalOpen(true);
    };

    const handleDeleteRequest = (id: string) => {
        setDeletingCompanyId(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDeletion = () => {
        if (deletingCompanyId) {
            deleteCompany(deletingCompanyId);
        }
        setDeleteConfirmOpen(false);
        setDeletingCompanyId(null);
    };
    
    const handleStatusChangeRequest = (id: string, name: string, newStatus: boolean) => {
        setStatusChangeInfo({ id, name, newStatus });
        setStatusConfirmOpen(true);
    };

    const confirmStatusChange = () => {
        if (statusChangeInfo) {
            updateCompanyStatus(statusChangeInfo.id, statusChangeInfo.newStatus);
        }
        setStatusConfirmOpen(false);
        setStatusChangeInfo(null);
    };

    if (currentView === 'logs') {
        return <LogCenterScreen onBack={() => setCurrentView('companies')} />;
    }

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-dark-text">Gestão de Empresas</h1>
                <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentView('logs')} className="flex items-center gap-2 bg-dark-card border border-dark-border px-4 py-2 rounded-lg hover:border-dark-primary transition-colors font-medium text-sm">
                        <HistoryIcon />
                        <span>Central de Logs</span>
                    </button>
                    <button onClick={handleAddNew} className="flex items-center gap-2 bg-dark-primary text-dark-background px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-bold">
                        <PlusIcon />
                        <span>Nova Empresa</span>
                    </button>
                </div>
            </div>

            <div className="bg-dark-card rounded-2xl shadow-2xl shadow-black/20 overflow-hidden border border-dark-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-dark-card/50">
                            <tr>
                                <th className="p-4 font-semibold text-dark-secondary uppercase tracking-wider">Empresa</th>
                                <th className="p-4 font-semibold text-dark-secondary uppercase tracking-wider">Status</th>
                                <th className="p-4 font-semibold text-dark-secondary uppercase tracking-wider">Ativar/Desativar</th>
                                <th className="p-4 font-semibold text-dark-secondary uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map(company => (
                                <CompanyRow 
                                    key={company.id} 
                                    company={company} 
                                    onStatusChange={(id, status) => handleStatusChangeRequest(id, company.name, status)}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteRequest}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)}>
                <CompanyForm
                    initialData={selectedCompany}
                    onClose={() => setFormModalOpen(false)}
                />
            </Modal>
            
            <ConfirmationModal
                isOpen={isStatusConfirmOpen}
                onClose={() => setStatusConfirmOpen(false)}
                onConfirm={confirmStatusChange}
                title="Confirmar Alteração de Status"
                confirmButtonText={statusChangeInfo?.newStatus ? "Sim, Ativar" : "Sim, Desativar"}
                confirmButtonClass={statusChangeInfo?.newStatus ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'}
            >
                Você tem certeza que deseja {statusChangeInfo?.newStatus ? 'ATIVAR' : 'DESATIVAR'} a empresa "{statusChangeInfo?.name}"?
            </ConfirmationModal>

            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDeletion}
                title="Confirmar Exclusão"
                confirmButtonText="Confirmar Exclusão"
            >
                Você tem certeza que deseja excluir esta empresa? Todos os dados associados (veículos, equipe) serão perdidos. Esta ação não pode ser desfeita.
            </ConfirmationModal>
        </div>
    );
};

export default AdminScreen;