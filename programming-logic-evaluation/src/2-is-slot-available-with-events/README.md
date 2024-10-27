# Task 02 - Is slot available with events?

When a patient schedules a consultation, that creates a `CalendarEvent`. The data structure is in `src/types/calendar-event`:

```ts
export type CalendarEvent = {
  start: Date;
  end: Date;
  buffer?: Buffer; // Don't worry about this yet, this is not necessary for this task
};
```

A doctor can't be in two places at the same time, so `CalendarEvent`s should block the doctor's availability.

In the `src/2-is-slot-available-with-events/is-slot-available-with-events.ts` file, you need to implement a function that determines if a given calendar slot is available or not while also considering other `CalendarEvent`s that are already scheduled.

This is similar to `src/1-is-slot-available/is-slot-available.ts` but now you have to deal with calendar events. For example:

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

const events: Array<CalendarEvent> = [
  // January 16th 2024, Tuesday 18:00—19:00
  { start: new Date(`2024-01-16T18:00`), end: new Date(`2024-01-16T19:00`) }
];

// January 16th 2024, Tuesday 18:00—18:30
const slot: CalendarSlot = {
  start: new Date(`2024-01-16T18:00`), // January 16th 2024, Tuesday 18:00
  durationM: 30 // 30 minutes
};

isSlotAvailableWithEvents(availability, events, slot);
//=> Should return `false` because even though the doctor works at that time, there's already another calendar event blocking the doctor's calendar
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
export const isSlotAvailableWithEvents = (
  availability: CalendarAvailability,
  events: CalendarEvent[],
  slot: CalendarSlot
): boolean => {
  // Calcula o horário de término do slot, adicionando a duração ao horário de início
  const slotEnd = new Date(slot.start.getTime() + slot.durationM * 60000);

  // Verifica se o slot está dentro da disponibilidade definida
  const isWithinAvailability = availability.include.some((availableSlot) => {
    // Verifica se o dia da semana do slot é igual ao dia da disponibilidade
    const isCorrectDay = availableSlot.weekday === getDay(slot.start);
    
    // Cria um novo objeto de data para o início e fim da disponibilidade
    const availableStart = new Date(slot.start);
    availableStart.setHours(availableSlot.range[0].hours, availableSlot.range[0].minutes);

    const availableEnd = new Date(slot.start);
    availableEnd.setHours(availableSlot.range[1].hours, availableSlot.range[1].minutes);

    // Retorna verdadeiro se o slot está no dia correto e dentro do intervalo de horários disponíveis
    return isCorrectDay && slot.start >= availableStart && slotEnd <= availableEnd;
  });

  // Se o slot não estiver dentro da disponibilidade, retorna falso
  if (!isWithinAvailability) {
    return false;
  }

  // Verifica se o slot conflita com algum evento existente
  for (const event of events) {
    // Retorna falso se o slot começa antes do evento terminar e termina depois do evento começar
    if (slot.start < event.end && slotEnd > event.start) {
      return false;
    }
  }

  // Retorna verdadeiro se o slot está disponível e não conflita com eventos
  return true;
};
```