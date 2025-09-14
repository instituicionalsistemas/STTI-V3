import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { TeamMember } from '../types';
import { UsersIcon } from './icons/UsersIcon';

interface AssignSalespersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (salespersonId: string | null) => void;
  salespeople: TeamMember[];
  currentSalespersonId?: string;
}

const AssignSalespersonModal: React.FC<AssignSalespersonModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  salespeople,
  currentSalespersonId,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(currentSalespersonId || null);

  useEffect(() => {
    setSelectedId(currentSalespersonId || null);
  }, [currentSalespersonId, isOpen]);

  const handleAssign = () => {
    onAssign(selectedId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-2">
        <h2 className="text-2xl font-bold text-center mb-6 text-dark-text">Atribuir Vendedor</h2>
        
        <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
           <label
              key="unassign"
              className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                selectedId === null ? 'border-dark-primary bg-dark-primary/10' : 'border-dark-border bg-dark-background/50 hover:border-dark-primary/30'
              }`}
            >
              <input
                type="radio"
                name="salesperson"
                checked={selectedId === null}
                onChange={() => setSelectedId(null)}
                className="w-5 h-5 mr-4 text-dark-primary bg-dark-background border-dark-secondary focus:ring-dark-primary"
              />
              <div className="w-10 h-10 rounded-full mr-4 bg-dark-border flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-dark-secondary" />
              </div>
              <div>
                <p className="font-semibold text-dark-text">Não Atribuir</p>
                <p className="text-xs text-dark-secondary">Responsabilidade de todos</p>
              </div>
            </label>

          {salespeople.map((sp) => (
            <label
              key={sp.id}
              className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                selectedId === sp.id ? 'border-dark-primary bg-dark-primary/10' : 'border-dark-border bg-dark-background/50 hover:border-dark-primary/30'
              }`}
            >
              <input
                type="radio"
                name="salesperson"
                value={sp.id}
                checked={selectedId === sp.id}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-5 h-5 mr-4 text-dark-primary bg-dark-background border-dark-secondary focus:ring-dark-primary"
              />
              <img src={sp.avatarUrl} alt={sp.name} className="w-10 h-10 rounded-full mr-4" />
              <div>
                <p className="font-semibold text-dark-text">{sp.name}</p>
                <p className="text-xs text-dark-secondary">{sp.email}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-bold rounded-lg bg-dark-border/50 hover:bg-dark-border text-dark-text transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={selectedId === (currentSalespersonId || null)}
            className="px-5 py-2.5 font-bold rounded-lg bg-dark-primary text-dark-background transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          >
            Salvar Atribuição
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignSalespersonModal;