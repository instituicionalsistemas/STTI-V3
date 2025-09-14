import type { Vehicle } from '../types';
import { getDaysInStock } from './dateUtils';

export const calculateDailyLoss = (vehicle: Vehicle): number => {
    return vehicle.dailyCost;
};

export const calculateTotalLoss = (vehicle: Vehicle): number => {
    const daysInStock = getDaysInStock(vehicle.entryDate);
    const dailyCostLoss = daysInStock * vehicle.dailyCost;
    let totalLoss = dailyCostLoss + vehicle.adCost;

    // Adiciona o custo do IPVA ao prejuízo se estiver vencido
    if (vehicle.ipvaCost && vehicle.ipvaDueDate) {
        const ipvaDueDate = new Date(vehicle.ipvaDueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera o horário para comparar apenas a data

        if (ipvaDueDate < today) {
            totalLoss += vehicle.ipvaCost;
        }
    }

    return totalLoss;
};

export const formatCurrency = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) {
        value = 0;
    }
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};


export const parseCurrency = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    
    const cleaned = value
        .replace('R$', '')
        .trim()
        .replace(/\./g, '')
        .replace(',', '.');
        
    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : number;
};