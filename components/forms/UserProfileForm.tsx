import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { TeamMember } from '../../types';
import { useData } from '../../hooks/useMockData';
import { UploadIcon } from '../icons/UploadIcon';

interface UserProfileFormProps {
  initialData: TeamMember;
  onClose: () => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ initialData, onClose }) => {
    const { updateTeamMember } = useData();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                email: initialData.email,
                phone: initialData.phone || '',
            });
            setAvatarUrl(initialData.avatarUrl);
            setAvatarPreview(initialData.avatarUrl);
        }
    }, [initialData]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setAvatarPreview(base64String);
                setAvatarUrl(base64String); // This will be the base64 string
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const updatedMember: TeamMember = {
            ...initialData,
            ...formData,
            avatarUrl: avatarUrl,
        };
        updateTeamMember(updatedMember);
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
            <h2 className="text-2xl font-bold text-center mb-6">Editar Meu Perfil</h2>
            
            <div>
                <label className="block text-sm font-medium text-dark-secondary mb-2">Foto de Perfil</label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 flex-shrink-0 rounded-full bg-dark-background border-2 border-dashed border-dark-border flex items-center justify-center overflow-hidden">
                        {avatarPreview ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" /> : <UploadIcon className="w-8 h-8 text-dark-secondary" />}
                    </div>
                    <label htmlFor="avatar-upload" className="cursor-pointer bg-dark-border/50 hover:bg-dark-border text-dark-text font-medium py-2 px-4 rounded-md transition-colors text-sm">
                        <span>Alterar Foto</span>
                    </label>
                    <input id="avatar-upload" name="avatar-upload" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/png, image/jpeg" />
                </div>
            </div>

            <div>
                <label htmlFor="name" className="label-style">Nome Completo</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-style" />
            </div>
            <div>
                <label htmlFor="email" className="label-style">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-style disabled:bg-dark-background/50 disabled:cursor-not-allowed" disabled />
            </div>
            <div>
                <label htmlFor="phone" className="label-style">Telefone (WhatsApp)</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(11) 99999-9999" className="input-style" />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-dark-border/50 hover:bg-dark-border font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-dark-primary text-dark-background font-bold hover:opacity-90">Salvar Alterações</button>
            </div>

            <style>{`
                .label-style { display: block; font-size: 0.875rem; font-weight: 500; color: #8A93A3; margin-bottom: 0.25rem; }
                .input-style { width: 100%; padding: 0.5rem 0.75rem; background-color: #0A0F1E; border: 1px solid #243049; border-radius: 0.375rem; color: #E0E0E0; }
                .input-style:focus { outline: none; box-shadow: 0 0 0 2px #00D1FF; }
            `}</style>
        </form>
    );
};

export default UserProfileForm;