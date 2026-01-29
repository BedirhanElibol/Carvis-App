export const calculateDaysLeft = (dateString) => {
    if (!dateString) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const futureDate = new Date(dateString);
    futureDate.setHours(0, 0, 0, 0);

    const diffTime = futureDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Verilen tarihe yıl ekleyerek bir sonraki bitiş tarihini hesaplar.
 */
export const calculateDueDate = (lastDate, periodInYears) => {
    if (!lastDate) return null;
    const date = new Date(lastDate + 'T00:00:00');

    date.setFullYear(date.getFullYear() + periodInYears);

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};
