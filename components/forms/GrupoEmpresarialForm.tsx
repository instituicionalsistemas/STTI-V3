

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { GrupoEmpresarial } from '../../types';
import { UploadIcon } from '../icons/UploadIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';

interface GrupoEmpresarialFormProps {
  initialData?: GrupoEmpresarial;
  onSave: (data: Omit<GrupoEmpresarial, 'id' | 'companyIds' | 'createdAt' | 'isActive'>, password?: string) => Promise<void>;
  onClose: () => void;
}

const GrupoEmpresarialForm: React.FC<GrupoEmpresarialFormProps> = ({ initialData, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        bannerUrl: '',
        responsibleName: '',
        responsiblePhotoUrl: '',
        accessEmail: '',
        phone: '',
        birthDay: '',
        birthMonth: '',
        birthYear: '',
    });
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');


    useEffect(() => {
        if (initialData) {
            const [year, month, day] = initialData.birthDate.split('-');
            setFormData({
                name: initialData.name,
                bannerUrl: initialData.bannerUrl,
                responsibleName: initialData.responsibleName,
                responsiblePhotoUrl: initialData.responsiblePhotoUrl,
                accessEmail: initialData.accessEmail,
                phone: initialData.phone,
                birthDay: day,
                birthMonth: month,
                birthYear: year,
            });
            setBannerPreview(initialData.bannerUrl);
            setPhotoPreview(initialData.responsiblePhotoUrl);
        }
    }, [initialData]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'banner' | 'photo') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                if (type === 'banner') {
                    setBannerPreview(base64String);
                    setFormData(prev => ({ ...prev, bannerUrl: base64String }));
                } else {
                    setPhotoPreview(base64String);
                    setFormData(prev => ({ ...prev, responsiblePhotoUrl: base64String }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!initialData) {
            if (password.length < 6) {
                setError('A senha deve ter pelo menos 6 caracteres.');
                return;
            }
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                return;
            }
        }
        
        setIsLoading(true);
        const { birthDay, birthMonth, birthYear, ...rest } = formData;
        const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
        try {
            await onSave({ ...rest, birthDate }, password);
        } catch (error) {
            console.error("Failed to save group:", error);
            setError("Falha ao salvar o grupo. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Generate options for date dropdowns
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - 16 - i); // Must be at least 16 years old

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">{initialData ? 'Editar Grupo' : 'Criar Novo Grupo Empresarial'}</h2>

            <div>
                <label className="block text-sm font-medium text-dark-secondary mb-2">Banner do Grupo (1200x300px)</label>
                <div className="w-full h-32 flex items-center justify-center bg-dark-background border-2 border-dashed border-dark-border rounded-md overflow-hidden">
                    {bannerPreview ? (
                        <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                    ) : (
                        <UploadIcon className="w-8 h-8 text-dark-secondary" />
                    )}
                </div>
                <label htmlFor="banner-upload" className="mt-2 cursor-pointer inline-block bg-dark-border/50 hover:bg-dark-border text-dark-text font-medium py-2 px-4 rounded-md transition-colors text-sm">
                    <span>Selecionar Banner</span>
                </label>
                <input id="banner-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" />
            </div>
            
            <input name="name" placeholder="Nome do Grupo Empresarial" value={formData.name} onChange={handleChange} className="input-field" required />

            <fieldset className="border border-dark-border p-4 rounded-lg mt-4">
                <legend className="px-2 font-semibold text-dark-text">Dados do Responsável</legend>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 flex-shrink-0 rounded-full bg-dark-background border-2 border-dashed border-dark-border flex items-center justify-center overflow-hidden">
                        {photoPreview ? <img src={photoPreview} alt="Foto Preview" className="w-full h-full object-cover" /> : <UserCircleIcon className="w-8 h-8 text-dark-secondary" />}
                    </div>
                    <label htmlFor="photo-upload" className="cursor-pointer bg-dark-border/50 hover:bg-dark-border text-dark-text font-medium py-2 px-4 rounded-md transition-colors text-sm">
                        <span>Selecionar Foto</span>
                    </label>
                    <input id="photo-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'photo')} accept="image/*" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="responsibleName" placeholder="Nome do Responsável" value={formData.responsibleName} onChange={handleChange} className="input-field" required />
                    <input name="accessEmail" type="email" placeholder="E-mail de Acesso" value={formData.accessEmail} onChange={handleChange} className="input-field" required />
                    <input name="phone" placeholder="Telefone" value={formData.phone} onChange={handleChange} className="input-field" required />
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-dark-secondary mb-1">Data de Nascimento</label>
                        <div className="grid grid-cols-3 gap-2">
                            <select name="birthDay" value={formData.birthDay} onChange={handleChange} className="input-field" required><option value="">Dia</option>{days.map(d => <option key={d} value={d}>{d}</option>)}</select>
                            <select name="birthMonth" value={formData.birthMonth} onChange={handleChange} className="input-field" required><option value="">Mês</option>{months.map(m => <option key={m} value={m}>{m}</option>)}</select>
                            <select name="birthYear" value={formData.birthYear} onChange={handleChange} className="input-field" required><option value="">Ano</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select>
                        </div>
                    </div>
                    {!initialData && (
                        <>
                           <input name="password" type="password" placeholder="Crie uma Senha" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
                           <input name="confirmPassword" type="password" placeholder="Confirme a Senha" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" />
                        </>
                    )}
                </div>
            </fieldset>

            {error && <p className="text-center text-sm text-red-400 mt-2">{error}</p>}

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-dark-border/50 hover:bg-dark-border transition-colors">Cancelar</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-md bg-dark-primary text-dark-background font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
                    {isLoading ? 'Salvando...' : 'Salvar Grupo'}
                </button>
            </div>
             <style>{`.input-field {position: relative; display: block; width: 100%; padding: 0.75rem 1rem; border: 1px solid #243049; color: #E0E0E0; background-color: #0A0F1E; border-radius: 0.5rem;}.input-field:focus {outline: none; box-shadow: 0 0 0 2px #00D1FF;}`}</style>
        </form>
    );
};

export default GrupoEmpresarialForm;