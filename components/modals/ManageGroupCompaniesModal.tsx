
import React, { useState, useEffect } from 'react';
import { GrupoEmpresarial, Company } from '../../types';
import Modal from '../Modal';

interface ManageGroupCompaniesModalProps {
    isOpen: boolean;
    onClose: () => void;
    grupo: GrupoEmpresarial;
    allCompanies: Company[];
    onSave: (groupId: string, companyIds: string[]) => Promise<void>;
}

const ManageGroupCompaniesModal: React.FC<ManageGroupCompaniesModalProps> = ({
    isOpen,
    onClose,
    grupo,
    allCompanies,
    onSave,
}) => {
    const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (grupo) {
            setSelectedCompanyIds(grupo.companyIds || []);
        }
    }, [grupo, isOpen]);

    const handleToggleCompany = (companyId: string) => {
        setSelectedCompanyIds(prev =>
            prev.includes(companyId)
                ? prev.filter(id => id !== companyId)
                : [...prev, companyId]
        );
    };
    
    const handleSave = async () => {
        setIsLoading(true);
        try {
            await onSave(grupo.id, selectedCompanyIds);
        } catch (error) {
            console.error("Failed to save company selection:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-2">
                <h2 className="text-2xl font-bold text-center mb-2 text-dark-text">Gerenciar Empresas do Grupo</h2>
                <p className="text-center text-dark-secondary mb-6">
                    Selecione as empresas que pertencem ao grupo <strong className="text-dark-text">{grupo.name}</strong>.
                </p>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 border-t border-b border-dark-border py-4">
                    {allCompanies.map(company => (
                        <label
                            key={company.id}
                            className="flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer bg-dark-background/50 hover:border-dark-primary/30"
                        >
                            <input
                                type="checkbox"
                                checked={selectedCompanyIds.includes(company.id)}
                                onChange={() => handleToggleCompany(company.id)}
                                className="w-5 h-5 mr-4 text-dark-primary bg-dark-background border-dark-secondary focus:ring-dark-primary focus:ring-offset-dark-card"
                            />
                            <img src={company.logoUrl} alt={company.name} className="w-10 h-10 rounded-full mr-4" />
                            <div>
                                <p className="font-semibold text-dark-text">{company.name}</p>
                                <p className="text-xs text-dark-secondary">{company.cnpj || 'CNPJ não informado'}</p>
                            </div>
                        </label>
                    ))}
                    {allCompanies.length === 0 && (
                        <p className="text-center text-dark-secondary py-4">Nenhuma empresa cadastrada no sistema.</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 font-bold rounded-lg bg-dark-border/50 hover:bg-dark-border text-dark-text transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-5 py-2.5 font-bold rounded-lg bg-dark-primary text-dark-background transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ManageGroupCompaniesModal;