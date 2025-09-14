import React from 'react';
import { GrupoEmpresarial } from '../types';
import { TriadLogo } from './icons/TriadLogo';
import GrupoUserProfileDropdown from './GrupoUserProfileDropdown';

interface GrupoHeaderProps {
  user: GrupoEmpresarial;
  onLogout: () => void;
  onEditProfile: () => void;
  onChangePassword: () => void;
}

const GrupoHeader: React.FC<GrupoHeaderProps> = ({ user, onLogout, onEditProfile, onChangePassword }) => {
  return (
    <header className="flex items-center justify-between animate-fade-in">
       <div className="flex items-center gap-3">
            <div className="bg-dark-card p-2.5 rounded-lg border border-dark-border">
              <TriadLogo className="w-6 h-6 text-dark-primary" />
            </div>
            <h1 className="text-xl font-bold text-dark-text">TRIAD3</h1>
        </div>

      <GrupoUserProfileDropdown 
        user={user}
        onLogout={onLogout}
        onEditProfile={onEditProfile}
        onChangePassword={onChangePassword}
      />
    </header>
  );
};

export default GrupoHeader;