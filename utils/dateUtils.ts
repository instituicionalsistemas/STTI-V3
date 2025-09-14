
export const getDaysRemaining = (entryDate: string, goalDays: number): number => {
    const entry = new Date(entryDate);
    const deadline = new Date(entry.setDate(entry.getDate() + goalDays));
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
};

export const getDaysInStock = (entryDate: string, saleDate?: string): number => {
    const entry = new Date(entryDate);
    const end = saleDate ? new Date(saleDate) : new Date();
    const diffTime = end.getTime() - entry.getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
};

export const formatTimeUntil = (dateString: string): string => {
    const appointmentDate = new Date(dateString);
    const now = new Date();
    const diffMs = appointmentDate.getTime() - now.getTime();

    if (diffMs <= 0) {
        return "agora";
    }

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const formattedTime = timeFormatter.format(appointmentDate);

    const isToday = appointmentDate.getDate() === now.getDate() &&
                    appointmentDate.getMonth() === now.getMonth() &&
                    appointmentDate.getFullYear() === now.getFullYear();

    const isTomorrow = appointmentDate.getDate() === now.getDate() + 1 &&
                       appointmentDate.getMonth() === now.getMonth() &&
                       appointmentDate.getFullYear() === now.getFullYear();

    if (isToday) {
        if (diffHours < 1) {
            return `em ${diffMinutes} minutos`;
        }
        if (diffHours < 4) {
            const minutesPart = diffMinutes % 60;
            return `em ${diffHours}h e ${minutesPart}m`;
        }
        return `hoje às ${formattedTime}`;
    }

    if (isTomorrow) {
        return `amanhã às ${formattedTime}`;
    }
    
    return `em ${diffDays} dias`;
};