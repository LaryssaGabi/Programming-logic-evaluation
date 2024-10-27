# Task 01 - Is slot available?

Doctors have a `CalendarAvailability`, which is a definition of when they are available on a weekly basis (eg. Monday–Friday 9am–5pm). The data structure is in `src/types/calendar-availability`:

```ts
export type CalendarAvailability = {
  include: Array<{
    weekday: Weekday;
    range: [Time, Time];
  }>;
};
```

To schedule a consultation, patients must select a `CalendarSlot` (eg. January 15th 2024, Monday 3pm). The data structure is in `src/types/calendar-slot`:

```ts
export type CalendarSlot = {
  start: Date;
  /** The duration of the time slot, in minutes. */
  durationM: number;
};
```

In the `src/1-is-slot-available/is-slot-available.ts` file, you need to implement a function that determines if a given `CalendarSlot` is available for the given `CalendarAvailability`. For example:

```ts
// Every Tuesday 9:00—20:00
const availability: CalendarAvailability = {
  include: [
    {
      weekday: Weekday.tuesday,
      range: [
        { hours: 9, minutes: 0 },
        { hours: 20, minutes: 0 }
      ]
    }
  ]
};

// January 16th 2024, Tuesday 21:00—21:30
const slot: CalendarSlot = {
  start: new Date(`2024-01-16T21:00`), // January 16th 2024, Tuesday 21:00
  durationM: 30 // 30 minutes
};

isSlotAvailable(availability, slot);
//=> Should return `false` because the doctor is not available Tuesday 21:00–21:30
```

You can also look at the tests to see more examples of how the function should behave.


/**
 * Verifica se um slot de horário está disponível dentro da disponibilidade definida.
 *
 * @param {CalendarAvailability} availability - A disponibilidade do calendário, que inclui os dias e horários disponíveis.
 * @param {CalendarSlot} slot - O slot de horário que queremos verificar.
 * @returns {boolean} - Retorna verdadeiro se o slot estiver disponível, e falso caso contrário.
 */


```ts
export const isSlotAvailable = (availability: CalendarAvailability, slot: CalendarSlot): boolean => {
  // Obtemos o dia da semana do slot
  const weekdaySlot = getDay(slot.start);

  // Procuramos se há disponibilidade para esse dia da semana
  const availableDay = availability.include.find(avail => avail.weekday === weekdaySlot);

  // Se não houver disponibilidade para o dia, retornamos falso
  if (!availableDay) {
    return false; 
  }

  // Definimos o horário de início e fim do slot
  const slotStartTimes = slot.start;
  const slotEndTimes = new Date(slotStartTimes.getTime() + slot.durationM * 60 * 1000);

  // Extraímos o intervalo de horas disponíveis para o dia
  const [startRange, endRange] = availableDay.range;

  // Verificamos se o início do slot está dentro do intervalo disponível
  const isStartInRange =
    (getHours(slotStartTimes) > startRange.hours) || 
    (getHours(slotStartTimes) === startRange.hours && getMinutes(slotStartTimes) >= startRange.minutes);

  // Verificamos se o fim do slot está dentro do intervalo disponível
  const isEndInRange = 
    (getHours(slotEndTimes) < endRange.hours) || 
    (getHours(slotEndTimes) === endRange.hours && getMinutes(slotEndTimes) <= endRange.minutes);

  // Retornamos verdadeiro apenas se o início e o fim do slot estiverem dentro do intervalo disponível
  return isStartInRange && isEndInRange;
};
```