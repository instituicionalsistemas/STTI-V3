import React, { useState } from 'react';
import Modal from './Modal';
import ManageAdminsTab from './tabs/ManageAdminsTab';
import ChangePasswordTab from './tabs/ChangePasswordTab';
import { UsersIcon } from './icons/UsersIcon';
import { KeyIcon } from './icons/KeyIcon';

interface AdminSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ActiveTab = 'admins' | 'password';

const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('admins');

    const TabButton: React.FC<{ tab: ActiveTab, label: string, icon: React.ReactNode }> = ({ tab, label, icon }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-t-lg text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab 
                ? 'border-dark-primary text-dark-primary' 
                : 'border-transparent text-dark-secondary hover:text-dark-text hover:border-dark-border'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="flex border-b border-dark-border mb-4">
                <TabButton tab="admins" label="Gerenciar Admins" icon={<UsersIcon />} />
                <TabButton tab="password" label="Alterar Senha" icon={<KeyIcon />} />
            </div>

            <div>
                {activeTab === 'admins' && <ManageAdminsTab />}
                {activeTab === 'password' && <ChangePasswordTab />}
            </div>
        </Modal>
    );
};

export default AdminSettingsModal;