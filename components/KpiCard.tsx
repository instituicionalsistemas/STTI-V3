import React, { ReactNode } from 'react';
import Card from './Card';

interface KpiCardProps {
  title: string;
  value: string;
  trend?: string;
  isLoss?: boolean;
  icon?: ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend, isLoss = false, icon }) => {
  return (
    <Card className="p-5 animate-stagger opacity-0 flex flex-col" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-center gap-2">
        {icon && <span className="text-dark-secondary">{icon}</span>}
        <p className="text-base font-semibold text-dark-text">{title}</p>
      </div>
      <div className="flex flex-col flex-grow justify-center items-center gap-2 mt-2">
        <p className="text-4xl font-bold text-dark-text">{value}</p>
        {trend && (
            <p className={`text-xs font-medium px-2 py-0.5 rounded-full ${isLoss ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{trend}</p>
        )}
      </div>
    </Card>
  );
};

export default KpiCard;