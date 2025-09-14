import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useMockData';
import { GrupoEmpresarial } from '../types';
import CompanyInfoCard from '../components/CompanyInfoCard';
import GrupoHeader from '../components/GrupoHeader';
import DashboardScreen from './DashboardScreen';
import Modal from '../components/Modal';
import GrupoUserProfileForm from '../components/forms/GrupoUserProfileForm';
import GrupoUserPasswordForm from '../components/forms/GrupoUserPasswordForm';

interface GrupoUserDashboardScreenProps {
    user: GrupoEmpresarial;
    onLogout: () => void;
}

const GrupoUserDashboardScreen: React.FC<GrupoUserDashboardScreenProps> = ({ user, onLogout }) => {
    const { companies, vehicles, gruposEmpresariais } = useData();
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    // Get the most up-to-date user data from the context
    const currentUserData = useMemo(() => 
        gruposEmpresariais.find(g => g.id === user.id) || user, 
    [gruposEmpresariais, user]);

    const accessibleCompanies = useMemo(() => {
        return companies.filter(company => currentUserData.companyIds.includes(company.id) && company.isActive);
    }, [companies, currentUserData.companyIds]);

    const handleProfileUpdate = (updatedUser: GrupoEmpresarial) => {
        sessionStorage.setItem('groupUser', JSON.stringify(updatedUser));
        setIsEditProfileOpen(false);
    };

    if (selectedCompanyId) {
        return (
            <div className="min-h-screen bg-dark-background text-dark-text transition-colors duration-300 flex flex-col">
                <div className="flex-grow w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
                     <div className="flex justify-start mb-6">
                       <button 
                        onClick={() => setSelectedCompanyId(null)}
                        className="px-4 py-2 text-sm font-medium rounded-lg text-dark-secondary hover:bg-dark-card/50 transition-colors"
                       >
                         &larr; Voltar para Dashboard de Grupos
                       </button>
                    </div>
                    <main>
                        <DashboardScreen onLogout={onLogout} companyId={selectedCompanyId} />
                    </main>
                </div>
                 <footer className="w-full text-center py-4 text-dark-secondary text-xs border-t border-dark-border/20">
                    Powered by: Triad3 Inteligência Digital - Chega de Imitações!
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-background text-dark-text transition-colors duration-300 flex flex-col">
            <div className="flex-grow w-full max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <GrupoHeader 
                    user={currentUserData} 
                    onLogout={onLogout}
                    onEditProfile={() => setIsEditProfileOpen(true)}
                    onChangePassword={() => setIsChangePasswordOpen(true)}
                />
                <main className="animate-fade-in mt-8">
                    <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 shadow-2xl shadow-black/30">
                        <img 
                            src={currentUserData.bannerUrl} 
                            alt="Banner do Grupo" 
                            className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 flex flex-col justify-end">
                            <div className="flex items-center gap-4">
                                <img src={currentUserData.responsiblePhotoUrl} alt={currentUserData.responsibleName} className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-dark-border flex-shrink-0"/>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{currentUserData.name}</h1>
                                    <p className="text-sm md:text-base text-gray-200 drop-shadow-md">Responsável: {currentUserData.responsibleName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                     
                     <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-dark-text">Empresas Acessíveis</h2>
                        <div className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-sm">
                            <span className="font-bold text-dark-primary">{accessibleCompanies.length}</span>
                            <span className="text-dark-secondary ml-2">Empresas no grupo</span>
                        </div>
                    </div>
                     
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {accessibleCompanies.map(company => {
                            const companyVehicles = vehicles.filter(v => v.companyId === company.id && v.status === 'available').length;
                            return (
                                <CompanyInfoCard
                                    key={company.id}
                                    company={company}
                                    vehicleCount={companyVehicles}
                                    onClick={() => setSelectedCompanyId(company.id)}
                                />
                            );
                        })}
                    </div>
                     {accessibleCompanies.length === 0 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-dark-card rounded-2xl border border-dark-border">
                            <h3 className="text-xl font-bold text-dark-text">Nenhuma Empresa Acessível</h3>
                            <p className="text-dark-secondary mt-2">
                                Nenhuma empresa foi associada ao seu grupo ou as empresas associadas estão inativas.
                            </p>
                        </div>
                    )}
                </main>
            </div>
             <footer className="w-full text-center py-4 text-dark-secondary text-xs border-t border-dark-border/20">
                Powered by: Triad3 Inteligência Digital - Chega de Imitações!
            </footer>

            <Modal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)}>
                <GrupoUserProfileForm 
                    currentUser={currentUserData} 
                    onClose={() => setIsEditProfileOpen(false)}
                    onSave={handleProfileUpdate}
                />
            </Modal>
            
             <Modal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)}>
                <GrupoUserPasswordForm 
                    userId={currentUserData.id}
                    onClose={() => setIsChangePasswordOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default GrupoUserDashboardScreen;