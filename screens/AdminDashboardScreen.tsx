import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useMockData';
import CompanyInfoCard from '../components/CompanyInfoCard';
import { SearchIcon } from '../components/icons/SearchIcon';

interface AdminDashboardScreenProps {
    onCompanySelect: (companyId: string) => void;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onCompanySelect }) => {
    const { companies, vehicles } = useData();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCompanies = useMemo(() => {
        if (!searchQuery.trim()) {
            return companies;
        }
        return companies.filter(company =>
            company.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [companies, searchQuery]);

    return (
        <div className="animate-fade-in">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-dark-text">Dashboard de Empresas</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Pesquisar por nome..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-2 text-sm text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-primary transition-all w-full sm:w-64"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-secondary" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.length > 0 ? (
                    filteredCompanies.map(company => {
                        const companyVehicles = vehicles.filter(v => v.companyId === company.id && v.status === 'available').length;
                        return (
                            <CompanyInfoCard
                                key={company.id}
                                company={company}
                                vehicleCount={companyVehicles}
                                onClick={() => onCompanySelect(company.id)}
                            />
                        );
                    })
                ) : (
                     <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-dark-card rounded-2xl border border-dark-border">
                        <h3 className="text-xl font-bold text-dark-text">Nenhuma Empresa Encontrada</h3>
                        <p className="text-dark-secondary mt-2">
                            Tente ajustar os termos da sua busca.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardScreen;