import React from 'react';
import type { View } from '../types';
import { AdminIcon } from './icons/AdminIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { TriadLogo } from './icons/TriadLogo';
import AdminNotificationBell from './AdminNotificationBell';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, onOpenSettings, onLogout }) => {
  const NavButton: React.FC<{
    view: View;
    label: string;
    icon: React.ReactNode;
  }> = ({ view, label, icon }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 text-sm font-medium ${
        currentView === view
          ? 'bg-dark-primary/20 text-dark-primary'
          : 'text-dark-secondary hover:bg-dark-border/50'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <header className="flex items-center justify-between mb-8 animate-fade-in">
       <div className="flex items-center gap-3">
            <div className="bg-dark-card p-2.5 rounded-lg border border-dark-border">
              <TriadLogo className="w-6 h-6 text-dark-primary" />
            </div>
            <h1 className="text-xl font-bold text-dark-text">TRIAD3</h1>
        </div>

      <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-dark-card p-1 rounded-lg border border-dark-border">
              <NavButton view="dashboard" label="Dashboard" icon={<DashboardIcon />} />
              <NavButton view="admin" label="Admin" icon={<AdminIcon />} />
              <NavButton view="grupos" label="Grupos Empresarias" icon={<BriefcaseIcon />} />
          </div>
          <div className="flex items-center gap-2">
             <AdminNotificationBell />
             <button
                onClick={onOpenSettings}
                className="p-2.5 rounded-lg bg-dark-card border border-dark-border text-dark-secondary hover:text-dark-primary transition-colors"
                aria-label="Configurações"
             >
                <SettingsIcon className="w-5 h-5" />
             </button>
             <button
                onClick={onLogout}
                className="p-2.5 rounded-lg bg-dark-card border border-dark-border text-dark-secondary hover:text-red-400 transition-colors"
                aria-label="Sair do sistema"
             >
                <LogoutIcon className="w-5 h-5" />
             </button>
          </div>
      </div>
    </header>
  );
};

export default Header;