import React from 'react';
import type { TeamMember } from '../types';
import Card from './Card';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface TeamMemberCardProps {
  user: TeamMember;
  onEdit: () => void;
  onDelete: () => void;
  style?: React.CSSProperties;
}

const PhoneIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ user, onEdit, onDelete, style }) => {
  return (
    <Card 
        className="p-4 transition-transform duration-300 hover:scale-105 hover:border-dark-primary/50 animate-stagger opacity-0"
        style={style}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full" />
            <div>
              <h4 className="font-bold text-dark-text">{user.name}</h4>
               <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: user.role === 'Vendedor' ? '#8A93A3' : '#00D1FF' }}>
                  {user.role}
              </p>
              <p className="text-sm text-dark-secondary mt-1">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-dark-secondary flex items-center gap-1.5 mt-1">
                  <PhoneIcon /> {user.phone}
                </p>
              )}
            </div>
        </div>
         <div className="flex items-center gap-1">
            <button onClick={onEdit} className="p-2 rounded-full text-dark-secondary hover:bg-dark-border transition-colors"><PencilIcon className="w-4 h-4" /></button>
            <button onClick={onDelete} className="p-2 rounded-full text-red-500/70 hover:bg-dark-border hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
          </div>
      </div>
    </Card>
  );
};

export default TeamMemberCard;