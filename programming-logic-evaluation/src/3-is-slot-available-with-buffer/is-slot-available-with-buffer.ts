import { CalendarAvailability, CalendarEvent, CalendarSlot } from '../types';

export const isSlotAvailableWithBuffer = (
  availability: CalendarAvailability,
  events: Array<CalendarEvent>,
  slot: CalendarSlot,
): boolean => {
  const { start: slotStart, durationM } = slot;
  const slotEnd = new Date(slotStart.getTime() + durationM * 60000);
  const slotWeekday = slotStart.getUTCDay();

  const dayAvailability = availability.include.find(avail => avail.weekday === slotWeekday);
  if (!dayAvailability) return false;

  const isWithinAvailability = dayAvailability.range.some(({ hours, minutes }) => {
    const availabilityStart = new Date(slotStart);
    availabilityStart.setUTCHours(hours, minutes, 0, 0);
    const availabilityEnd = new Date(availabilityStart.getTime() + 60 * 60000);
    return slotStart >= availabilityStart && slotEnd <= availabilityEnd;
  });

  if (!isWithinAvailability) return false;

  return !events.some(event => {
    const eventStartWithBuffer = new Date(event.start.getTime() - (event.buffer?.before || 0) * 60000);
    const eventEndWithBuffer = new Date(event.end.getTime() + (event.buffer?.after || 0) * 60000);
    return slotStart < eventEndWithBuffer && slotEnd > eventStartWithBuffer;
  });
};
