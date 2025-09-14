
import React, { useState, FormEvent } from 'react';
import { useData } from '../../hooks/useMockData';

interface ChangePasswordFormProps {
  onClose: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onClose }) => {
  const { updateUserPassword } = useData();
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
    
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        setError('Sessão inválida. Por favor, faça login novamente.');
        setIsLoading(false);
        return;
    }
    
    const result = await updateUserPassword(userId, currentPassword, newPassword);
    
    if (result.success) {
        setSuccess(result.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
            onClose();
        }, 1500);
    } else {
        setError(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-2">
      <h2 className="text-2xl font-bold text-center mb-6">Alterar Senha</h2>
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-dark-secondary mb-1">
          Senha Atual
        </label>
        <input
          type="password"
          name="currentPassword"
          id="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary"
          required
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-dark-secondary mb-1">
          Nova Senha
        </label>
        <input
          type="password"
          name="newPassword"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary"
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-secondary mb-1">
          Confirmar Nova Senha
        </label>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 bg-dark-background border border-dark-border rounded-md focus:ring-dark-primary focus:border-dark-primary"
          required
        />
      </div>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      {success && <p className="text-sm text-green-400 text-center">{success}</p>}

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-md bg-dark-border/50 hover:bg-dark-border transition-colors font-bold"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-md bg-dark-primary text-dark-background font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
