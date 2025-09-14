import React from 'react';
import Card from './Card';
import { Vehicle } from '../types';
import { ExclamationIcon } from './icons/ExclamationIcon';
import { FilterIcon } from './icons/FilterIcon';
import { XIcon } from './icons/XIcon';


interface TaskListCardProps {
  title: string;
  items: Vehicle[];
  onFilterToggle: () => void;
  isFilterActive: boolean;
  onItemClick: (vehicleId: string) => void;
}

const TaskListCard: React.FC<TaskListCardProps> = ({ title, items, onFilterToggle, isFilterActive, onItemClick }) => {
  return (
    <Card className="p-5 animate-fade-in flex flex-col">
      <h3 className="font-bold text-xl mb-4 text-center text-dark-text">{title}</h3>
      {items.length > 0 ? (
        <>
          <div className="space-y-3 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id!)}
                className="w-full flex items-center gap-3 text-sm p-3 rounded-lg bg-dark-background border border-dark-border text-left hover:border-dark-primary transition-colors focus:outline-none focus:ring-2 focus:ring-dark-primary"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <ExclamationIcon className="w-5 h-5 text-red-400" />
                </div>
                 <div className="flex-1">
                  <span className="font-medium text-dark-text block">{item.model}</span>
                  <span className="text-xs text-dark-secondary">{item.plate}</span>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-dark-border">
             <button
                onClick={onFilterToggle}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-300 ${
                    isFilterActive
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                    : 'bg-dark-primary text-dark-background hover:opacity-90'
                }`}
            >
                {isFilterActive 
                    ? <><XIcon className="w-4 h-4" /> Limpar Filtro</>
                    : <><FilterIcon className="w-4 h-4" /> Filtrar {items.length} Prioritários</>
                }
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-center py-4 text-dark-secondary">Nenhum veículo prioritário.</p>
      )}
    </Card>
  );
};

export default TaskListCard;