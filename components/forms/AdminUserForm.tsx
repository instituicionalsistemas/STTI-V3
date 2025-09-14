import React, { useState, useEffect, FormEvent } from 'react';
import { AdminUser } from '../../types';
import { useData } from '../../hooks/useMockData';

interface AdminUserFormProps {
    initialData?: AdminUser;
    onClose: () => void;
}

const AdminUserForm: React.FC<AdminUserFormProps> = ({ initialData, onClose }) => {
    const { addAdminUser, updateAdminUser } = useData();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setEmail(initialData.email);
        }
    }, [initialData]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!initialData && password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        
        if (initialData) {
            updateAdminUser({ ...initialData, name, email });
        } else {
            addAdminUser({ name, email, password });
        }

        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-center mb-6">{initialData ? 'Editar Admin' : 'Novo Admin'}</h2>
            <div>
                <label htmlFor="name" className="label-style">Nome</label>
                <input type="text" name="name" value={name} onChange={e => setName(e.target.value)} required className="input-style" />
            </div>
            <div>
                <label htmlFor="email" className="label-style">Email</label>
                <input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-style" />
            </div>
            <div>
                <label htmlFor="password" className="label-style">{initialData ? 'Nova Senha (opcional)' : 'Senha'}</label>
                <input type="password" name="password" value={password} onChange={e => setPassword(e.target.value)} required={!initialData} className="input-style" />
            </div>
            <div>
                <label htmlFor="confirmPassword" className="label-style">{initialData ? 'Confirmar Nova Senha' : 'Confirmar Senha'}</label>
                <input type="password" name="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required={!initialData} className="input-style" />
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-dark-border/50 hover:bg-dark-border font-bold">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-dark-primary text-dark-background font-bold hover:opacity-90">Salvar</button>
            </div>
             <style>{`
                .label-style { display: block; font-size: 0.875rem; font-weight: 500; color: #8A93A3; margin-bottom: 0.25rem; }
                .input-style { width: 100%; padding: 0.5rem 0.75rem; background-color: #0A0F1E; border: 1px solid #243049; border-radius: 0.375rem; color: #E0E0E0; }
                .input-style:focus { outline: none; box-shadow: 0 0 0 2px #00D1FF; }
            `}</style>
        </form>
    );
};

export default AdminUserForm;