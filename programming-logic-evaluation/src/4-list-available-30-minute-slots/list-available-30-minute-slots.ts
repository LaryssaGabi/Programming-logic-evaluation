import { CalendarAvailability, CalendarEvent, CalendarSlot } from '../types';

export const listAvailable30MinuteSlots = (
  availability: CalendarAvailability,
  events: CalendarEvent[],
  range: [Date, Date]
): CalendarSlot[] => {
  const availableSlots: CalendarSlot[] = [];

  availability.include.forEach(({ weekday, range: timeRange }) => {
    const [startHour, endHour] = timeRange.map(({ hours, minutes }) => {
      const date = new Date(range[0]);
      date.setUTCHours(hours, minutes);
      return date;
    });

    const startDate = new Date(range[0]);
    const endDate = new Date(range[1]);
    let current = new Date(startDate);

    while (current <= endDate) {
      if (current.getUTCDay() === weekday) {
        let slotStart = new Date(current);
        slotStart.setUTCHours(startHour.getUTCHours(), startHour.getUTCMinutes());

        while (slotStart < endHour) {
          const slotEnd = new Date(slotStart);
          slotEnd.setUTCMinutes(slotStart.getUTCMinutes() + 30);

          const isOccupied = events.some(({ start, end, buffer }) => {
            const eventStart = new Date(start);
            const eventEnd = new Date(end);
            const beforeBuffer = buffer?.before ?? 0;
            const afterBuffer = buffer?.after ?? 0;

            eventStart.setUTCMinutes(eventStart.getUTCMinutes() - beforeBuffer);
            eventEnd.setUTCMinutes(eventEnd.getUTCMinutes() + afterBuffer);

            return (
              (slotStart >= eventStart && slotStart < eventEnd) ||
              (slotEnd > eventStart && slotEnd <= eventEnd) ||
              (slotStart <= eventStart && slotEnd >= eventEnd)
            );
          });

          if (!isOccupied) {
            availableSlots.push({ start: new Date(slotStart), durationM: 30 });
          }

          slotStart.setUTCMinutes(slotStart.getUTCMinutes() + 30);
        }
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }
  });

  return availableSlots;
};
