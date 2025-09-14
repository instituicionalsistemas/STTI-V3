import React, { useState, useRef, useEffect } from 'react';
import { Notification } from '../types';
import { BellIcon } from './icons/BellIcon';

interface NotificationBellProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (id: string) => {
    onMarkAsRead(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-dark-card border border-dark-border text-dark-secondary hover:text-dark-primary transition-colors"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-30 animate-fade-in p-2">
          <div className="p-2 border-b border-dark-border flex justify-between items-center">
            <h4 className="font-bold text-dark-text">Notificações</h4>
             {unreadCount > 0 && <span className="text-xs font-bold bg-dark-primary text-dark-background px-2 py-0.5 rounded-full">{unreadCount} Nova(s)</span>}
          </div>
          <div className="py-1 max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.read ? 'opacity-60' : 'hover:bg-dark-border/50'
                  }`}
                >
                  {!notification.read && <span className="mt-1.5 block h-2 w-2 rounded-full bg-dark-primary flex-shrink-0" />}
                  <div className={notification.read ? 'pl-5' : ''}>
                    <p className="text-sm text-dark-text leading-snug">{notification.message}</p>
                    <p className="text-xs text-dark-secondary mt-1">{new Date(notification.date).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-dark-secondary p-4">Nenhuma notificação.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
