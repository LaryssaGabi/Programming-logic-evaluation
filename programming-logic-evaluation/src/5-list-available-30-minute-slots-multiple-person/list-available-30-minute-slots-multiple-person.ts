import { CalendarAvailability, CalendarEvent, CalendarSlot } from '../types';

export const listAvailable30MinuteSlotsMultiplePerson = (
  attendees: Array<{
    availability: CalendarAvailability;
    events: Array<CalendarEvent>;
  }>,
  range: [Date, Date],
): Array<CalendarSlot> => {
  const availableSlots: CalendarSlot[] = [];

  const isSlotAvailable = (start: Date, durationM: number): boolean => {
    return attendees.every(({ availability, events }) => {
      const isAvailable = availability.include.some(({ weekday, range: timeRange }) => {
        const dayOfWeek = start.getUTCDay();
        if (dayOfWeek !== weekday) return false;

        const [startTime, endTime] = timeRange;
        const startRange = new Date(start);
        startRange.setUTCHours(startTime.hours, startTime.minutes);
        const endRange = new Date(start);
        endRange.setUTCHours(endTime.hours, endTime.minutes);

        if (start < startRange || start >= endRange) return false;

        const slotEnd = new Date(start);
        slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + durationM);

        return !events.some(event => {
          const eventStart = new Date(event.start);
          const eventEnd = new Date(event.end);

          if (event.buffer) {
            eventStart.setUTCMinutes(eventStart.getUTCMinutes() - event.buffer.before);
            eventEnd.setUTCMinutes(eventEnd.getUTCMinutes() + event.buffer.after);
          }

          return (start < eventEnd && slotEnd > eventStart);
        });
      });

      return isAvailable; 
    });
  };

  let current = new Date(range[0]);
  while (current < range[1]) {
    if (isSlotAvailable(current, 30)) {
      availableSlots.push({ start: new Date(current), durationM: 30 });
    }
    current.setUTCMinutes(current.getUTCMinutes() + 30); // Avança 30 minutos
  }

  return availableSlots;
};
