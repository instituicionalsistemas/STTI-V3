import React, { useState, FormEvent, ChangeEvent } from 'react';
import { GrupoEmpresarial } from '../../types';
import { useData } from '../../hooks/useMockData';
import { UploadIcon } from '../icons/UploadIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';

interface GrupoUserProfileFormProps {
    currentUser: GrupoEmpresarial;
    onSave: (updatedUser: GrupoEmpresarial) => void;
    onClose: () => void;
}

const GrupoUserProfileForm: React.FC<GrupoUserProfileFormProps> = ({ currentUser, onSave, onClose }) => {
    const { updateGrupoUserProfile } = useData();
    const [bannerUrl, setBannerUrl] = useState(currentUser.bannerUrl);
    const [photoUrl, setPhotoUrl] = useState(currentUser.responsiblePhotoUrl);
    const [bannerPreview, setBannerPreview] = useState<string | null>(currentUser.bannerUrl);
    const [photoPreview, setPhotoPreview] = useState<string | null>(currentUser.responsiblePhotoUrl);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'banner' | 'photo') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                if (type === 'banner') {
                    setBannerPreview(base64String);
                    setBannerUrl(base64String);
                } else {
                    setPhotoPreview(base64String);
                    setPhotoUrl(base64String);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const updatedUser = await updateGrupoUserProfile(currentUser.id, {
                bannerUrl: bannerUrl,
                responsiblePhotoUrl: photoUrl,
            });
            if (updatedUser) {
                onSave(updatedUser);
            } else {
                throw new Error("Falha ao receber dados atualizados do servidor.");
            }
        } catch (err) {
            console.error(err);
            setError("Não foi possível salvar as alterações. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
            <h2 className="text-2xl font-bold text-center mb-6">Editar Perfil</h2>
            
            <div>
                <label className="block text-sm font-medium text-dark-secondary mb-2">Banner do Grupo (1200x300px)</label>
                <div className="w-full h-32 flex items-center justify-center bg-dark-background border-2 border-dashed border-dark-border rounded-md overflow-hidden">
                    {bannerPreview ? <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" /> : <UploadIcon className="w-8 h-8 text-dark-secondary" />}
                </div>
                <label htmlFor="banner-upload" className="mt-2 btn-secondary inline-block cursor-pointer">
                    <span>Alterar Banner</span>
                </label>
                <input id="banner-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" />
            </div>

            <div>
                <label className="block text-sm font-medium text-dark-secondary mb-2">Sua Foto de Perfil</label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 flex-shrink-0 rounded-full bg-dark-background border-2 border-dashed border-dark-border flex items-center justify-center overflow-hidden">
                        {photoPreview ? <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" /> : <UserCircleIcon className="w-8 h-8 text-dark-secondary" />}
                    </div>
                    <label htmlFor="photo-upload" className="btn-secondary cursor-pointer">
                        <span>Alterar Foto</span>
                    </label>
                    <input id="photo-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'photo')} accept="image/*" />
                </div>
            </div>
            
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
                <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Salvando...' : 'Salvar Alterações'}</button>
            </div>
             <style>{`
                .btn-primary { padding: 0.5rem 1rem; border-radius: 0.375rem; background-color: #00D1FF; color: #0A0F1E; font-weight: bold; transition: opacity 0.2s; }
                .btn-primary:hover { opacity: 0.9; }
                .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .btn-secondary { padding: 0.5rem 1rem; border-radius: 0.375rem; background-color: #243049; color: #E0E0E0; font-weight: bold; transition: background-color 0.2s; }
                .btn-secondary:hover { background-color: #3e4c6e; }
            `}</style>
        </form>
    );
};

export default GrupoUserProfileForm;