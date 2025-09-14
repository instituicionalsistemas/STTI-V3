import React, { useState, FormEvent } from 'react';
import { useData } from '../../hooks/useMockData';

const ChangePasswordTab: React.FC = () => {
  const { updateAdminPassword } = useData();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    const result = await updateAdminPassword(currentPassword, newPassword);

    if (result.success) {
        setSuccess(result.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    } else {
        setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-center">Alterar Minha Senha</h3>
      <div>
        <label htmlFor="adminCurrentPassword" className="label-style">Senha Atual</label>
        <input type="password" name="adminCurrentPassword" id="adminCurrentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="input-style" />
      </div>
      <div>
        <label htmlFor="adminNewPassword" className="label-style">Nova Senha</label>
        <input type="password" name="adminNewPassword" id="adminNewPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="input-style" />
      </div>
      <div>
        <label htmlFor="adminConfirmPassword" className="label-style">Confirmar Nova Senha</label>
        <input type="password" name="adminConfirmPassword" id="adminConfirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-style" />
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      {success && <p className="text-sm text-green-400 text-center">{success}</p>}

      <div className="flex justify-end pt-4">
        <button 
            type="submit" 
            disabled={isLoading} 
            className="px-4 py-2 rounded-md bg-dark-primary text-dark-background font-bold hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

       <style>{`
        .label-style { display: block; font-size: 0.875rem; font-weight: 500; color: #8A93A3; margin-bottom: 0.25rem; }
        .input-style { width: 100%; padding: 0.5rem 0.75rem; background-color: #0A0F1E; border: 1px solid #243049; border-radius: 0.375rem; color: #E0E0E0; }
        .input-style:focus { outline: none; box-shadow: 0 0 0 2px #00D1FF; }
      `}</style>
    </form>
  );
};

export default ChangePasswordTab;