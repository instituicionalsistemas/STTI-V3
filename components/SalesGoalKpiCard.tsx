import React from 'react';
import Card from './Card';

interface SalesGoalKpiCardProps {
  title: string;
  currentValue: number;
  goalValue: number;
}

// Funções auxiliares para desenhar o arco do SVG
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};


const SalesGoalKpiCard: React.FC<SalesGoalKpiCardProps> = ({ title, currentValue, goalValue }) => {
  const percentage = goalValue > 0 ? (currentValue / goalValue) * 100 : 0;
  // O ângulo total é 180 graus, de -90 (esquerda) para 90 (direita)
  const angle = -90 + (Math.min(percentage, 100) * 180) / 100;
  const midGoal = goalValue > 0 ? Math.round(goalValue / 2) : 0;

  // Posições dos números dentro do arco para evitar sobreposição
  const startLabelPos = polarToCartesian(50, 50, 30, -85);
  const midLabelPos = polarToCartesian(50, 50, 30, 0);
  const endLabelPos = polarToCartesian(50, 50, 30, 85);

  return (
    <Card className="p-5 animate-stagger opacity-0 flex flex-col justify-between" style={{ animationFillMode: 'forwards' }}>
      <div className="text-center">
        <p className="text-base font-semibold text-dark-text">{title}</p>
      </div>
      <div className="relative flex justify-center items-center my-2">
        <svg viewBox="0 0 100 65" className="w-full">
          {/* Arcs de cor fixa */}
          <path d={describeArc(50, 50, 40, -90, -30)} fill="none" stroke="#EF4444" strokeWidth="10" strokeLinecap="round" />
          <path d={describeArc(50, 50, 40, -30, 30)} fill="none" stroke="#FBBF24" strokeWidth="10" strokeLinecap="round" />
          <path d={describeArc(50, 50, 40, 30, 90)} fill="none" stroke="#22C55E" strokeWidth="10" strokeLinecap="round" />

          {/* Marcadores de texto (números) */}
          <text x={startLabelPos.x} y={startLabelPos.y} textAnchor="middle" dy="4" fill="#8A93A3" fontSize="10">0</text>
          <text x={midLabelPos.x} y={midLabelPos.y} textAnchor="middle" dy="4" fill="#8A93A3" fontSize="10">{midGoal}</text>
          <text x={endLabelPos.x} y={endLabelPos.y} textAnchor="middle" dy="4" fill="#8A93A3" fontSize="10">{goalValue}</text>

          {/* Ponteiro (agulha) */}
          <g 
            style={{ 
                transform: `rotate(${angle}deg)`, 
                transformOrigin: '50px 50px',
                transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
              <path d="M 50 15 L 48.5 46 L 51.5 46 Z" fill="#E0E0E0" />
          </g>
          
          {/* Ponto de pivô */}
          <circle cx="50" cy="50" r="5" fill="#10182C" stroke="#E0E0E0" strokeWidth="2" />
          <circle cx="50" cy="50" r="2" fill="#E0E0E0" />
        </svg>
      </div>
      <div className="text-center mt-2">
        <p className="text-sm font-medium text-dark-secondary">
          <span className="font-bold text-dark-text text-lg">{currentValue}</span> de <span className="font-bold text-dark-text">{goalValue}</span> veículos
        </p>
      </div>
    </Card>
  );
};

export default SalesGoalKpiCard;