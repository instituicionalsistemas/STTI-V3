import React, { ReactNode } from 'react';
import Modal from './Modal';
import { TriadLogo } from './icons/TriadLogo';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center p-4">
        <TriadLogo className="w-16 h-16 mx-auto text-dark-primary mb-5" />
        <h2 className="text-2xl font-bold mb-4 text-dark-text">{title}</h2>
        <p className="text-dark-secondary mb-8 max-w-sm mx-auto">{children}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="w-full max-w-xs px-6 py-3 font-bold rounded-lg bg-dark-primary hover:opacity-90 text-dark-background transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InfoModal;