# Task 03 - Is slot available with buffer?

Every `CalendarEvent` can optionally have a buffer, which is reserved a block of time before and/or after the event in which no other event can be scheduled. For example: the meeting is 4pm–5pm but let's also block 30 minutes earlier for preparation, and 1 hour after in case the meeting takes longer than expected. The data structure is in `src/types/calendar-event`:

```ts
export type Buffer = {
  /** Pre-event buffer, in minutes */
  before: number;
  /** Post-event buffer, in minutes */
  after: number;
};

export type CalendarEvent = {
  start: Date;
  end: Date;
  buffer?: Buffer; // Optional Buffer
};
```

In the `src/3-is-slot-available-with-buffer/is-slot-available-with-buffer.ts` file, you need to implement a function that determines if a given calendar slot is available or not while also considering other `CalendarEvent`s that are already scheduled and may have `Buffer`.

Similar to `src/2-is-slot-available-with-events/is-slot-available-with-events.ts`, but now you have to deal with potential buffers. For example:

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
  // January 16th 2024, Tuesday 18:00—19:00, with 30m of buffer before and 60m of buffer after
  {
    start: new Date(`2024-01-16T18:00`),
    end: new Date(`2024-01-16T19:00`),
    buffer: { before: 30, after: 60 }
  }
];

// January 16th 2024, Tuesday 19:00—19:30
const slot: CalendarSlot = {
  start: new Date(`2024-01-16T19:00`), // January 16th 2024, Tuesday 19:00
  durationM: 30 // 30 minutes
};

isSlotAvailableWithBuffer(availability, events, slot);
//=> Should return `false` because the `buffer.after` is blocking the doctor's calendar
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
export const isSlotAvailableWithBuffer = (
  availability: CalendarAvailability,
  events: Array<CalendarEvent>,
  slot: CalendarSlot,
): boolean => {
  // Extrai o horário de início e a duração do slot
  const { start: slotStart, durationM } = slot;

  // Calcula o horário de término do slot
  const slotEnd = new Date(slotStart.getTime() + durationM * 60000);
  const slotWeekday = slotStart.getUTCDay();

  // Verifica a disponibilidade para o dia da semana do slot
  const dayAvailability = availability.include.find(avail => avail.weekday === slotWeekday);
  if (!dayAvailability) return false; // Retorna falso se não houver disponibilidade para o dia

  // Verifica se o slot está dentro do intervalo de horário disponível
  const isWithinAvailability = dayAvailability.range.some(({ hours, minutes }) => {
    const availabilityStart = new Date(slotStart);
    availabilityStart.setUTCHours(hours, minutes, 0, 0); // Define o horário de início da disponibilidade
    const availabilityEnd = new Date(availabilityStart.getTime() + 60 * 60000); // Define o horário de término (uma hora depois)
    return slotStart >= availabilityStart && slotEnd <= availabilityEnd; // Verifica se o slot está dentro da disponibilidade
  });

  if (!isWithinAvailability) return false; // Retorna falso se o slot não estiver dentro do intervalo disponível

  // Verifica se o slot conflita com eventos existentes, considerando os buffers
  return !events.some(event => {
    // Calcula o início e o fim do evento com buffer
    const eventStartWithBuffer = new Date(event.start.getTime() - (event.buffer?.before || 0) * 60000);
    const eventEndWithBuffer = new Date(event.end.getTime() + (event.buffer?.after || 0) * 60000);
    
    // Retorna verdadeiro se houver conflito
    return slotStart < eventEndWithBuffer && slotEnd > eventStartWithBuffer;
  });
};
```