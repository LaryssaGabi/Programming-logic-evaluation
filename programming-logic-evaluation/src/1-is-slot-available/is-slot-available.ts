import { CalendarAvailability, CalendarSlot } from '../types';
import { getDay, getHours, getMinutes } from 'date-fns';

export const isSlotAvailable = (availability: CalendarAvailability, slot: CalendarSlot): boolean => {
  const weekdaySlot = getDay(slot.start);
  const availableDay = availability.include.find(avail => avail.weekday === weekdaySlot);

  if (!availableDay) {
    return false; 
  }

  const slotStartTimes = slot.start;
  const slotEndTimes = new Date(slotStartTimes.getTime() + slot.durationM * 60 * 1000);

  const [startRange, endRange] = availableDay.range;


  const isStartInRange =
    (getHours(slotStartTimes) > startRange.hours) || 
    (getHours(slotStartTimes) === startRange.hours && getMinutes(slotStartTimes) >= startRange.minutes);
  

  const isEndInRange = 
    (getHours(slotEndTimes) < endRange.hours) || 
    (getHours(slotEndTimes) === endRange.hours && getMinutes(slotEndTimes) <= endRange.minutes);

  return isStartInRange && isEndInRange;
};
