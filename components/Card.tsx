import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', style, id, onClick }) => {
  return (
    <div
      id={id}
      className={`bg-dark-card rounded-2xl shadow-lg shadow-black/20 border border-dark-border ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;