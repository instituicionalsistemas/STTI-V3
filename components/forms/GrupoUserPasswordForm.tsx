
import React, { useState, FormEvent } from 'react';
import { useData } from '../../hooks/useMockData';

interface GrupoUserPasswordFormProps {
  userId: string;
  onClose: () => void;
}

const GrupoUserPasswordForm: React.FC<GrupoUserPasswordFormProps> = ({ userId, onClose }) => {
  const { updateGrupoUserPassword } = useData();
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
    
    const result = await updateGrupoUserPassword(userId, currentPassword, newPassword);
    
    if (result.success) {
        setSuccess(result.message);
        setTimeout(() => onClose(), 1500);
    } else {
        setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2">
      <h2 className="text-2xl font-bold text-center mb-6">Alterar Senha</h2>
      <div>
        {/* FIX: Replaced class with className */}
        <label htmlFor="currentPassword" className="label-style">Senha Atual</label>
        {/* FIX: Replaced class with className */}
        <input type="password" name="currentPassword" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="input-style" />
      </div>
      <div>
        {/* FIX: Replaced class with className */}
        <label htmlFor="newPassword" className="label-style">Nova Senha</label>
        {/* FIX: Replaced class with className */}
        <input type="password" name="newPassword" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="input-style" />
      </div>
      <div>
        {/* FIX: Replaced class with className */}
        <label htmlFor="confirmPassword" className="label-style">Confirmar Nova Senha</label>
        {/* FIX: Replaced class with className */}
        <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-style" />
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      {success && <p className="text-sm text-green-400 text-center">{success}</p>}

      <div className="flex justify-end gap-3 pt-4">
        {/* FIX: Replaced class with className */}
        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
        {/* FIX: Replaced class with className */}
        <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Salvando...' : 'Salvar'}</button>
      </div>

       <style>{`
        .label-style { display: block; font-size: 0.875rem; font-weight: 500; color: #8A93A3; margin-bottom: 0.25rem; }
        .input-style { width: 100%; padding: 0.5rem 0.75rem; background-color: #0A0F1E; border: 1px solid #243049; border-radius: 0.375rem; color: #E0E0E0; }
        .input-style:focus { outline: none; box-shadow: 0 0 0 2px #00D1FF; }
        .btn-primary { padding: 0.5rem 1rem; border-radius: 0.375rem; background-color: #00D1FF; color: #0A0F1E; font-weight: bold; transition: opacity 0.2s; }
        .btn-primary:hover { opacity: 0.9; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary { padding: 0.5rem 1rem; border-radius: 0.375rem; background-color: #243049; color: #E0E0E0; font-weight: bold; transition: background-color 0.2s; }
        .btn-secondary:hover { background-color: #3e4c6e; }
      `}</style>
    </form>
  );
};

export default GrupoUserPasswordForm;