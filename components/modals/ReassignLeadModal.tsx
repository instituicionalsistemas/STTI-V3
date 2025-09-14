import React, { useState } from 'react';
import { ProspectAILead, TeamMember } from '../../types';
import Modal from '../Modal';
import ConfirmationModal from '../ConfirmationModal';

interface ReassignLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: ProspectAILead;
    salespeople: TeamMember[];
    onConfirm: (newOwnerId: string) => void;
}

const ReassignLeadModal: React.FC<ReassignLeadModalProps> = ({ isOpen, onClose, lead, salespeople, onConfirm }) => {
    const [selectedSalesperson, setSelectedSalesperson] = useState<TeamMember | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const handleSelect = (salesperson: TeamMember) => {
        setSelectedSalesperson(salesperson);
        setIsConfirming(true);
    };

    const handleConfirm = () => {
        if (selectedSalesperson) {
            onConfirm(selectedSalesperson.id);
        }
        // Modals will be closed by the parent component
    };
    
    const handleCloseConfirmation = () => {
        setIsConfirming(false);
        setSelectedSalesperson(null);
    };
    
    // When the main modal is closed from outside, reset internal state
    if (!isOpen && (selectedSalesperson || isConfirming)) {
        setIsConfirming(false);
        setSelectedSalesperson(null);
    }

    return (
        <>
            <Modal isOpen={isOpen && !isConfirming} onClose={onClose}>
                <div className="p-2">
                    <h2 className="text-2xl font-bold text-center mb-2 text-dark-text">Remanejar Lead</h2>
                    <p className="text-center text-dark-secondary mb-6">
                        Para qual vendedor você deseja transferir o lead <strong className="text-dark-text">{lead?.leadName}</strong>?
                    </p>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 border-t border-b border-dark-border py-4">
                        {salespeople.map(sp => (
                            <button
                                key={sp.id}
                                onClick={() => handleSelect(sp)}
                                className="w-full flex items-center p-3 rounded-lg border-2 border-dark-border bg-dark-background/50 hover:border-dark-primary/50 transition-all text-left"
                            >
                                <img src={sp.avatarUrl} alt={sp.name} className="w-10 h-10 rounded-full mr-4" />
                                <div>
                                    <p className="font-semibold text-dark-text">{sp.name}</p>
                                    <p className="text-xs text-dark-secondary">{sp.role}</p>
                                </div>
                            </button>
                        ))}
                        {salespeople.length === 0 && (
                            <p className="text-center text-dark-secondary py-4">Nenhum outro vendedor disponível.</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-6">
                        <button onClick={onClose} className="px-5 py-2.5 font-bold rounded-lg bg-dark-border/50 hover:bg-dark-border text-dark-text transition-colors">
                            Cancelar
                        </button>
                    </div>
                </div>
            </Modal>

            {selectedSalesperson && (
                 <ConfirmationModal
                    isOpen={isConfirming}
                    onClose={handleCloseConfirmation}
                    onConfirm={handleConfirm}
                    title="Confirmar Remanejamento"
                    confirmButtonText="Sim, Remanejar"
                    confirmButtonClass="bg-purple-600 hover:bg-purple-700"
                >
                    Você tem certeza que deseja remanejar o lead <strong className="text-dark-text">{lead?.leadName}</strong> para <strong className="text-dark-text">{selectedSalesperson.name}</strong>?
                </ConfirmationModal>
            )}
        </>
    );
};

export default ReassignLeadModal;