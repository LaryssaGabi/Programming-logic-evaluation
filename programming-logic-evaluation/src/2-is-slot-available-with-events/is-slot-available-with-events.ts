import { getDay } from 'date-fns';
import { CalendarAvailability, CalendarEvent, CalendarSlot } from '../types';

export const isSlotAvailableWithEvents = (
  availability: CalendarAvailability,
  events: CalendarEvent[],
  slot: CalendarSlot
): boolean => {
  const slotEnd = new Date(slot.start.getTime() + slot.durationM * 60000);

  const isWithinAvailability = availability.include.some((availableSlot) => {
    const isCorrectDay = availableSlot.weekday === getDay(slot.start);
    
    const availableStart = new Date(slot.start);
    availableStart.setHours(availableSlot.range[0].hours, availableSlot.range[0].minutes);

    const availableEnd = new Date(slot.start);
    availableEnd.setHours(availableSlot.range[1].hours, availableSlot.range[1].minutes);

    return isCorrectDay && slot.start >= availableStart && slotEnd <= availableEnd;
  });

  if (!isWithinAvailability) {
    return false;
  }

  for (const event of events) {
    if (slot.start < event.end && slotEnd > event.start) {
      return false;
    }
  }

  return true;
};
