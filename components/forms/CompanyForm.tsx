import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Company, Vehicle, Feature } from '../../types';
import { useData } from '../../hooks/useMockData';
import { UploadIcon } from '../icons/UploadIcon';

interface CompanyFormProps {
  initialData?: Company;
  onClose: () => void;
}

type FormData = Omit<Company, 'id' | 'isActive' | 'monthlySalesGoal'>;

const vehicleDetailFields: { key: keyof Vehicle; label: string }[] = [
    { key: 'modelYear', label: 'Ano/Modelo' },
    { key: 'fabricationYear', label: 'Ano Fabricação' },
    { key: 'renavam', label: 'RENAVAM' },
    { key: 'mileage', label: 'Quilometragem' },
    { key: 'fuelType', label: 'Combustível' },
    { key: 'transmission', label: 'Câmbio' },
    { key: 'traction', label: 'Tração' },
    { key: 'doors', label: 'Nº de Portas' },
    { key: 'occupants', label: 'Nº de Ocupantes' },
    { key: 'chassis', label: 'Chassi' },
    { key: 'history', label: 'Histórico' },
    { key: 'revisions', label: 'Revisões' },
    { key: 'standardItems', label: 'Itens de Série' },
    { key: 'additionalAccessories', label: 'Acessórios Adicionais' },
    { key: 'documentStatus', label: 'Situação Documental' },
];

const availableFeatures: { key: Feature; label: string; description: string }[] = [
    { key: 'estoque_inteligente', label: 'Estoque Inteligente', description: 'Gestão de veículos, finanças, metas e análises de vendas.' },
    { key: 'prospectai', label: 'ProspectAI', description: 'Pipeline de prospecção e gestão de leads para vendedores.' },
    { key: 'marketing', label: 'Módulo de Marketing', description: 'Ferramentas para gestores de tráfego, gestão de anúncios e materiais.' },
];


const CompanyForm: React.FC<CompanyFormProps> = ({ initialData, onClose }) => {
    const { addCompany, updateCompany } = useData();
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        logoUrl: '',
        name: '',
        cnpj: '',
        phone: '',
        email: '',
        ownerEmail: '',
        instagram: '',
        ownerName: '',
        ownerPhone: '',
        visibleFields: [],
        enabledFeatures: [],
    });

    // FIX: Added state for password, error handling, and loading status.
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsAdmin(sessionStorage.getItem('userRole') === 'admin');
        if (initialData) {
            setFormData({
                logoUrl: initialData.logoUrl,
                name: initialData.name,
                cnpj: initialData.cnpj || '',
                phone: initialData.phone || '',
                email: initialData.email || '',
                ownerEmail: initialData.ownerEmail || '',
                instagram: initialData.instagram || '',
                ownerName: initialData.ownerName || '',
                ownerPhone: initialData.ownerPhone || '',
                visibleFields: initialData.visibleFields || [],
                enabledFeatures: initialData.enabledFeatures || [],
            });
            setLogoPreview(initialData.logoUrl);
        }
    }, [initialData]);
    
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value 
        }));
    };

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setLogoPreview(base64String);
                setFormData(prev => ({ ...prev, logoUrl: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVisibilityChange = (field: keyof Vehicle) => {
        setFormData(prev => {
            const currentFields = prev.visibleFields || [];
            const newFields = currentFields.includes(field)
                ? currentFields.filter(f => f !== field)
                : [...currentFields, field];
            return { ...prev, visibleFields: newFields };
        });
    };

    const handleFeatureChange = (feature: Feature) => {
        setFormData(prev => {
            const currentFeatures = prev.enabledFeatures || [];
            const newFeatures = currentFeatures.includes(feature)
                ? currentFeatures.filter(f => f !== feature)
                : [...currentFeatures, feature];
            return { ...prev, enabledFeatures: newFeatures };
        });
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (initialData) {
            await updateCompany({
                ...initialData,
                ...formData,
                monthlySalesGoal: initialData.monthlySalesGoal, // Manter a meta original
            });
            onClose();
        } else {
            // FIX: Added password validation for new company creation.
            if (password.length < 6) {
                setError('A senha deve ter pelo menos 6 caracteres.');
                return;
            }
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                return;
            }
            
            setIsLoading(true);
            try {
                // FIX: Pass password to addCompany to fix the "Expected 2 arguments, but got 1" error.
                await addCompany(formData, password);
                onClose();
            } catch (err: any) {
                setError(err.message || "Ocorreu um erro ao criar a empresa.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">{initialData ? 'Editar Perfil da Empresa' : 'Cadastrar Nova Empresa'}</h2>
            
            <div>
                <label className="block text-sm font-medium text-dark-secondary mb-2">Logo da Empresa</label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 flex-shrink-0 rounded-full bg-dark-background border-2 border-dashed border-dark-border flex items-center justify-center overflow-hidden">
                        {logoPreview ? <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" /> : <UploadIcon className="w-8 h-8 text-dark-secondary" />}
                    </div>
                    <label htmlFor="logo-upload" className="cursor-pointer bg-dark-border/50 hover:bg-dark-border text-dark-text font-medium py-2 px-4 rounded-md transition-colors text-sm">
                        <span>{initialData ? 'Alterar Imagem' : 'Selecionar Imagem'}</span>
                    </label>
                    <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleLogoChange} accept="image/png, image/jpeg" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <input name="name" placeholder="Nome da Empresa" required value={formData.name} onChange={handleChange} className="input-field disabled:bg-dark-background/50 disabled:cursor-not-allowed" disabled={!isAdmin && !!initialData} />
                <input name="cnpj" placeholder="CNPJ" required value={formData.cnpj} onChange={handleChange} className="input-field" />
                <input name="phone" placeholder="Telefone da Empresa" value={formData.phone} onChange={handleChange} className="input-field" />
                <input name="email" type="email" placeholder="E-mail da Empresa" value={formData.email} onChange={handleChange} className="input-field disabled:bg-dark-background/50 disabled:cursor-not-allowed" disabled={!isAdmin && !!initialData} />
                <input name="ownerName" placeholder="Nome do Proprietário" required value={formData.ownerName} onChange={handleChange} className="input-field" />
                <input name="ownerEmail" type="email" placeholder="E-mail do Proprietário (será o login)" required value={formData.ownerEmail} onChange={handleChange} className="input-field disabled:bg-dark-background/50 disabled:cursor-not-allowed" disabled={!isAdmin && !!initialData} />
                <input name="ownerPhone" placeholder="WhatsApp do Proprietário" value={formData.ownerPhone} onChange={handleChange} className="input-field" />
                <input name="instagram" placeholder="@instagram" value={formData.instagram} onChange={handleChange} className="input-field" />
            </div>

            {/* FIX: Added password fields for new company creation */}
            {!initialData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="password" type="password" placeholder="Crie uma Senha" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
                    <input name="confirmPassword" type="password" placeholder="Confirme sua Senha" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" />
                </div>
            )}

            {error && <p className="text-center text-sm text-red-400 mt-2">{error}</p>}

            {isAdmin && (
                <fieldset className="border border-dark-border p-4 rounded-lg mt-4">
                    <legend className="px-2 font-semibold text-dark-text">Ferramentas Habilitadas</legend>
                    <p className="text-sm text-dark-secondary mb-4">Selecione quais módulos do sistema esta empresa terá acesso.</p>
                    <div className="space-y-3">
                        {availableFeatures.map(feature => (
                            <label key={feature.key} className="flex items-start space-x-3 cursor-pointer p-3 rounded-md hover:bg-dark-border/50 transition-colors">
                                <input 
                                    type="checkbox"
                                    checked={formData.enabledFeatures?.includes(feature.key)}
                                    onChange={() => handleFeatureChange(feature.key)}
                                    className="h-5 w-5 mt-0.5 rounded bg-dark-background border-dark-border text-dark-primary focus:ring-dark-primary focus:ring-offset-dark-card flex-shrink-0"
                                />
                                <div>
                                    <span className="font-medium text-dark-text">{feature.label}</span>
                                    <p className="text-xs text-dark-secondary">{feature.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </fieldset>
            )}

            <fieldset className="border border-dark-border p-4 rounded-lg mt-4">
                <legend className="px-2 font-semibold text-dark-text">Visibilidade dos Detalhes do Veículo</legend>
                <p className="text-sm text-dark-secondary mb-4">Selecione quais campos de detalhes adicionais serão visíveis para vendedores e gestores de tráfego.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2">
                    {vehicleDetailFields.map(field => (
                        <label key={field.key} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-dark-border/50">
                            <input 
                                type="checkbox"
                                checked={formData.visibleFields?.includes(field.key)}
                                onChange={() => handleVisibilityChange(field.key)}
                                className="h-4 w-4 rounded bg-dark-background border-dark-border text-dark-primary focus:ring-dark-primary focus:ring-offset-dark-card"
                            />
                            <span className="text-sm font-medium text-dark-secondary">{field.label}</span>
                        </label>
                    ))}
                </div>
            </fieldset>
            
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-dark-border/50 hover:bg-dark-border transition-colors">Cancelar</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-md bg-dark-primary text-dark-background font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
                    {isLoading ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Salvar')}
                </button>
            </div>
            <style>{`
                .input-field {
                    position: relative; display: block; width: 100%;
                    padding: 0.75rem 1rem; border: 1px solid #243049;
                    color: #E0E0E0; background-color: #0A0F1E;
                    border-radius: 0.5rem;
                }
                .input-field:focus {
                    outline: none; box-shadow: 0 0 0 2px #00D1FF;
                }
                .input-field::placeholder { color: #8A93A3; }
            `}</style>
        </form>
    );
};

export default CompanyForm;
