import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useMockData';
import { Vehicle, TeamMember } from '../types';
import KpiCard from '../components/KpiCard';
import { getDaysInStock } from '../utils/dateUtils';
import UserProfileDropdown from '../components/UserProfileDropdown';
import TrafficVehicleCard from '../components/TrafficVehicleCard';
import ActionCenterCard from '../components/ActionCenterCard';
import { formatCurrency } from '../utils/calculationUtils';
import { CarIcon } from '../components/icons/CarIcon';
import { MegaphoneIcon } from '../components/icons/MegaphoneIcon';
import { TrendingUpIcon } from '../components/icons/TrendingUpIcon';
import NotificationBell from '../components/NotificationBell';
import MarketingAssetsCard from '../components/MarketingAssetsCard';
import MaterialRequestModal from '../components/MaterialRequestModal';
import ImageLightbox from '../components/ImageLightbox';
import Modal from '../components/Modal';
import UserProfileForm from '../components/forms/UserProfileForm';
import ChangePasswordForm from '../components/forms/ChangePasswordForm';


interface TrafficManagerDashboardScreenProps {
  user: TeamMember;
  onLogout: () => void;
}

const TrafficManagerDashboardScreen: React.FC<TrafficManagerDashboardScreenProps> = ({ user, onLogout }) => {
    const { 
        companies, vehicles, teamMembers, deactivatedAdVehicleIds, 
        markAdAsDeactivated, notifications, markNotificationAsRead,
        addMaterialRequest, updateVehicle, toggleVehicleAdStatus
    } = useData();
    
    // Modal State
    const [materialRequestVehicle, setMaterialRequestVehicle] = useState<Vehicle | null>(null);
    const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

    // Active company data
    const activeCompany = companies.find(c => c.id === user.companyId);
    const availableVehicles = vehicles.filter(v => v.companyId === activeCompany?.id && v.status === 'available');
    const salespeople = teamMembers.filter(tm => tm.companyId === activeCompany?.id && tm.role === 'Vendedor');
    const trafficManager = user;
    const userNotifications = notifications.filter(n => n.recipientRole === 'traffic_manager');

    
    // KPI Calculations
    const activeAdsCount = useMemo(() => 
        availableVehicles.filter(v => v.isAdActive).length,
        [availableVehicles]
    );
    const newVehiclesLast7Days = availableVehicles.filter(v => getDaysInStock(v.entryDate) <= 7);
    const totalAdBudget = availableVehicles.reduce((sum, v) => sum + v.adCost, 0);
    const monthlyBudget = activeCompany?.monthlyAdBudget || 0;
    const budgetRemaining = monthlyBudget - totalAdBudget;
    const budgetTrend = budgetRemaining >= 0 ? `${formatCurrency(budgetRemaining)} restantes` : `${formatCurrency(Math.abs(budgetRemaining))} acima`;


    const soldVehiclesNeedingAction = vehicles.filter(v => 
        v.status === 'sold' && 
        v.companyId === activeCompany?.id && 
        !deactivatedAdVehicleIds.has(v.id!)
    ).sort((a, b) => new Date(b.saleDate!).getTime() - new Date(a.saleDate!).getTime());


    if (!activeCompany) {
        return <div>Carregando dados da empresa...</div>;
    }

    return (
        <div className="container mx-auto">
             <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-dark-text">
                        Dashboard de Anúncios
                    </h1>
                </div>
                 <div className="flex items-center gap-4">
                    <NotificationBell
                        notifications={userNotifications}
                        onMarkAsRead={markNotificationAsRead}
                    />
                    <UserProfileDropdown
                        company={{...activeCompany, name: user.name, logoUrl: user.avatarUrl, email: user.email}}
                        onEditProfile={() => setEditProfileModalOpen(true)}
                        onChangePassword={() => setChangePasswordModalOpen(true)}
                        onLogout={onLogout}
                        onManageTeam={() => {}}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     {soldVehiclesNeedingAction.length > 0 && (
                        <ActionCenterCard 
                            vehicles={soldVehiclesNeedingAction}
                            onConfirmDeactivation={markAdAsDeactivated}
                        />
                    )}
                </div>
                <div className="lg:col-span-1">
                    <MarketingAssetsCard driveUrl={activeCompany.marketingDriveUrl} />
                </div>
            </div>

            
            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <KpiCard title="Total em Estoque" value={availableVehicles.length.toString()} trend="veículos disponíveis" icon={<CarIcon />} />
                <KpiCard title="Anúncios Ativos" value={activeAdsCount.toString()} trend={`${availableVehicles.length > 0 ? Math.round((activeAdsCount / availableVehicles.length) * 100) : 0}% online`} icon={<MegaphoneIcon />} />
                <KpiCard title="Novos Veículos (7d)" value={newVehiclesLast7Days.length.toString()} trend="Criar novas campanhas" icon={<TrendingUpIcon />} />
                <KpiCard title="Orçamento de Anúncio" value={formatCurrency(monthlyBudget)} trend={budgetTrend} isLoss={budgetRemaining < 0} />
            </div>

            {/* Vehicle List Section */}
            <div className="mt-12">
                 <h2 className="text-2xl font-bold mb-4 animate-fade-in">
                    Gestão de Anúncios do Estoque
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableVehicles.map((vehicle, index) => {
                        const salesperson = salespeople.find(s => s.id === vehicle.salespersonId);
                        return (
                            <TrafficVehicleCard 
                                key={vehicle.id}
                                vehicle={vehicle}
                                company={activeCompany}
                                salesperson={salesperson}
                                onOpenMaterialRequest={() => setMaterialRequestVehicle(vehicle)}
                                onUpdateVehicle={updateVehicle}
                                onImageClick={() => vehicle.imageUrl && setExpandedImageUrl(vehicle.imageUrl)}
                                onToggleAdStatus={() => toggleVehicleAdStatus(vehicle.id!)}
                                style={{ animationDelay: `${index * 100}ms` }}
                            />
                        );
                    })}
                </div>
                 {availableVehicles.length === 0 && (
                    <div className="text-center py-16 bg-dark-card rounded-2xl border border-dark-border">
                        <h3 className="text-xl font-bold text-dark-text">Nenhum Veículo Encontrado</h3>
                        <p className="text-dark-secondary mt-2">
                            Não há veículos no estoque que correspondam aos filtros selecionados.
                        </p>
                    </div>
                )}
            </div>
            
            <MaterialRequestModal
                isOpen={!!materialRequestVehicle}
                onClose={() => setMaterialRequestVehicle(null)}
                vehicle={materialRequestVehicle}
                company={activeCompany}
                salespeople={salespeople}
                onSendRequest={({ vehicleId, requestDetails, assigneeId }) => {
                    if (trafficManager) {
                        addMaterialRequest({
                            vehicleId,
                            requestDetails,
                            assigneeId,
                            requesterId: trafficManager.id
                        });
                    }
                }}
            />
            {expandedImageUrl && (
                <ImageLightbox
                    imageUrl={expandedImageUrl}
                    onClose={() => setExpandedImageUrl(null)}
                />
            )}

            <Modal isOpen={isEditProfileModalOpen} onClose={() => setEditProfileModalOpen(false)}>
                <UserProfileForm initialData={user} onClose={() => setEditProfileModalOpen(false)} />
            </Modal>

            <Modal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)}>
                <ChangePasswordForm onClose={() => setChangePasswordModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default TrafficManagerDashboardScreen;