import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Company } from '../types';
import { formatCurrency, parseCurrency } from '../utils/calculationUtils';

interface MarketingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
  totalAdBudget: number;
  onSendRequest: (data: { message: string; driveUrl: string; budget: number }) => void;
}

const MarketingRequestModal: React.FC<MarketingRequestModalProps> = ({ isOpen, onClose, company, totalAdBudget, onSendRequest }) => {
  const [message, setMessage] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [budget, setBudget] = useState(0);
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    if (isOpen) {
        const initialBudget = company.monthlyAdBudget || 0;
        setDriveUrl(company.marketingDriveUrl || '');
        setBudget(initialBudget);
        setBudgetInput(formatCurrency(initialBudget));
    }
  }, [isOpen, company]);

  const handleSend = () => {
    onSendRequest({ message: message.trim(), driveUrl: driveUrl.trim(), budget });
    setMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-2">
        <h2 className="text-2xl font-bold text-center mb-4 text-dark-text">Comunicação com Marketing</h2>
        <p className="text-dark-secondary text-center mb-6">Envie mensagens ou atualize o link de materiais e o orçamento da sua equipe.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-dark-background rounded-lg border border-dark-border">
                <label htmlFor="monthlyBudget" className="text-sm font-medium text-dark-secondary">Orçamento Mensal (R$)</label>
                <input
                    type="text"
                    id="monthlyBudget"
                    value={budgetInput}
                    onChange={(e) => {
                        setBudgetInput(e.target.value);
                        setBudget(parseCurrency(e.target.value));
                    }}
                    onBlur={() => setBudgetInput(formatCurrency(budget))}
                    onFocus={() => {
                        if (budget > 0) setBudgetInput(String(budget));
                        else setBudgetInput('');
                    }}
                    className="w-full bg-transparent text-xl font-bold text-dark-primary focus:outline-none p-0 border-0"
                    placeholder="R$ 0,00"
                />
            </div>
            <div className="p-3 bg-dark-background rounded-lg border border-dark-border">
                <label className="text-sm font-medium text-dark-secondary">Gasto Atual (Calculado)</label>
                <p className="text-xl font-bold text-dark-text">{formatCurrency(totalAdBudget)}</p>
            </div>
        </div>
        
        <div>
            <label htmlFor="driveUrl" className="block text-sm font-medium text-dark-secondary mb-1">Link do Google Drive (Materiais)</label>
            <input
              id="driveUrl"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md"
              placeholder="Cole o link da pasta compartilhada aqui"
            />
        </div>

        <div className="mt-4">
          <label htmlFor="message" className="block text-sm font-medium text-dark-secondary mb-1">Mensagem ou Solicitação (Opcional)</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md"
            placeholder="Ex: Por favor, criar uma campanha de destaque para o SUV X..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 font-bold rounded-lg bg-dark-border/50 hover:bg-dark-border text-dark-text transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            className="px-5 py-2.5 font-bold rounded-lg bg-dark-primary text-dark-background transition-opacity hover:opacity-90"
          >
            Salvar e Enviar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MarketingRequestModal;