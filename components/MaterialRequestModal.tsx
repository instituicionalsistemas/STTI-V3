import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Vehicle, TeamMember, Company } from '../types';

interface MaterialRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  company: Company;
  salespeople: TeamMember[];
  onSendRequest: (data: { vehicleId: string, requestDetails: string, assigneeId: string }) => void;
}

const MaterialRequestModal: React.FC<MaterialRequestModalProps> = ({ 
    isOpen, onClose, vehicle, company, salespeople, onSendRequest 
}) => {
  const [details, setDetails] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>(company.id);

  useEffect(() => {
    if (!isOpen) {
      setDetails('');
      setAssigneeId(company.id);
    }
  }, [isOpen, company.id]);

  const handleSend = () => {
    if (details.trim() && vehicle?.id) {
      onSendRequest({
        vehicleId: vehicle.id,
        requestDetails: details.trim(),
        assigneeId: assigneeId,
      });
      onClose();
    }
  };

  if (!vehicle) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-2">
        <h2 className="text-2xl font-bold text-center mb-2 text-dark-text">Solicitar Material</h2>
        <p className="text-center text-dark-secondary mb-6">
            Para o veículo: <span className="font-bold text-dark-text">{vehicle.model} ({vehicle.plate})</span>
        </p>
        
        <div>
          <label htmlFor="details" className="block text-sm font-medium text-dark-secondary mb-1">
            Detalhes da Solicitação
          </label>
          <textarea
            id="details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md"
            placeholder="Ex: 3 vídeos verticais para Reels, 5 fotos em alta resolução..."
          />
        </div>

        <div className="mt-4">
            <label htmlFor="assigneeId" className="block text-sm font-medium text-dark-secondary mb-1">
                Atribuir Para
            </label>
            <select
                id="assigneeId"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md"
            >
                <option value={company.id}>{company.name} (Empresa)</option>
                {salespeople.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
            </select>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-dark-border">
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-bold rounded-lg bg-dark-border/50 hover:bg-dark-border text-dark-text transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={!details.trim()}
            className="px-5 py-2.5 font-bold rounded-lg bg-dark-primary text-dark-background transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          >
            Enviar Solicitação
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MaterialRequestModal;
