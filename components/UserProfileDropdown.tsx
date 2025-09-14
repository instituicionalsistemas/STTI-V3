import React, { useState, useRef, useEffect } from 'react';
import { Company } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CogIcon } from './icons/CogIcon';
import { ShieldIcon } from './icons/ShieldIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { UsersIcon } from './icons/UsersIcon';

interface UserProfileDropdownProps {
  company: Company;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
  onManageTeam?: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  company,
  onEditProfile,
  onChangePassword,
  onLogout,
  onManageTeam,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg bg-dark-card border border-dark-border hover:border-dark-primary/50 transition-colors"
      >
        <img src={company.logoUrl} alt={company.name} className="w-8 h-8 rounded-full" />
        <span className="hidden sm:inline font-bold text-dark-text">{company.name}</span>
        <ChevronDownIcon className={`w-5 h-5 text-dark-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-30 animate-fade-in p-2">
          <div className="p-3 border-b border-dark-border">
              <p className="font-bold text-dark-text truncate">{company.name}</p>
              <p className="text-sm text-dark-secondary truncate">{company.email}</p>
          </div>
          <div className="py-2">
              <button onClick={() => handleAction(onEditProfile)} className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-dark-border/50 transition-colors text-dark-text">
                  <CogIcon className="w-5 h-5 text-dark-secondary" />
                  <span>Editar Perfil</span>
              </button>
               {onManageTeam && (
                <button onClick={() => handleAction(onManageTeam)} className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-dark-border/50 transition-colors text-dark-text">
                    <UsersIcon className="w-5 h-5 text-dark-secondary" />
                    <span>Gerenciar Equipe</span>
                </button>
               )}
              <button onClick={() => handleAction(onChangePassword)} className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-dark-border/50 transition-colors text-dark-text">
                  <ShieldIcon className="w-5 h-5 text-dark-secondary" />
                  <span>Alterar Senha</span>
              </button>
          </div>
          <div className="pt-2 border-t border-dark-border">
              <button onClick={() => handleAction(onLogout)} className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-dark-border/50 transition-colors text-red-400">
                  <LogoutIcon className="w-5 h-5" />
                  <span>Sair</span>
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;