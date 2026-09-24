
/**
 * Converts HH:mm (or HH:mm:ss) into total minutes from midnight.
 */
export const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Formats total minutes from midnight into standard 12-hour AM/PM format.
 */
export const minutesToFormattedTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60) % 24;
    const mins = totalMinutes % 60;
    const pad = (n) => String(n).padStart(2, '0');
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${pad(mins)} ${ampm}`;
};

/**
 * Recalculates and shifts period times based on a newly selected break placement.
 * 
 * @param {Array} baseSlots - Array of period objects [{ period_number, duration_minutes, ... }]
 * @param {Number} breakAfterPeriod - The period number after which the break sits
 * @param {Number} breakDurationMinutes - Duration of the break in minutes (e.g., 30)
 * @param {String} startTimeStr - Initial start time of Period 1 (e.g., "08:00")
 * @returns {Array} Updated slots with recalculated start_time and end_time
 */
export const recalculateTimings = (
    baseSlots,
    breakAfterPeriod,
    breakDurationMinutes = 30,
    startTimeStr = "08:00"
) => {
    let currentCursor = timeToMinutes(startTimeStr);

    return baseSlots.map((slot) => {
        const slotDuration = slot.duration_minutes || 45;

        // Start time for current period
        const startMinutes = currentCursor;
        const endMinutes = startMinutes + slotDuration;
        
        // Move cursor past this period
        currentCursor = endMinutes;

        const updatedSlot = {
            ...slot,
            start_time: minutesToFormattedTime(startMinutes),
            end_time: minutesToFormattedTime(endMinutes),
        };

        // Inject/account for the break time immediately after the designated period
        if (Number(slot.period_number) === Number(breakAfterPeriod)) {
            currentCursor += breakDurationMinutes;
        }

        return updatedSlot;
    });
};