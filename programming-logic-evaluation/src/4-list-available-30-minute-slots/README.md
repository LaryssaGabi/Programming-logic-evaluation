# Task 04 - List available slots

In the `src/4-list-available-30-minute-slots/list-available-30-minute-slots.ts` file, you need to implement a function that returns the available 30-minute slots in a doctor's calendar availability between a specific date range. For example: which 30-minute slots the doctor has available between Monday and Tuesday?

```ts
// Every Tuesday 9:00—14:00
const availability: CalendarAvailability = {
  include: [
    {
      weekday: Weekday.tuesday,
      range: [
        { hours: 9, minutes: 0 },
        { hours: 14, minutes: 0 }
      ]
    }
  ]
};

const events: Array<CalendarEvent> = [
  // January 16th 2024, Tuesday 10:00—11:00, with 30m of buffer before and 60m of buffer after
  {
    start: new Date(`2024-01-16T10:00`),
    end: new Date(`2024-01-16T11:00`),
    buffer: { before: 30, after: 60 }
  }
];

// January 15th 2024, Monday 00:00 -> January 16th 2024, Tuesday 23:59
const range: [Date, Date] = [
  new Date(`2024-01-15T00:00`),
  new Date(`2024-01-16T23:59`)
];

listAvailableSlots(availability, events, range);
//=> Should return:
//=>     - Tuesday 9:00
//=>     - Tuesday 12:00
//=>     - Tuesday 12:30
//=>     - Tuesday 13:00
//=>     - Tuesday 13:30
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
export const listAvailable30MinuteSlots = (
  availability: CalendarAvailability,
  events: CalendarEvent[],
  range: [Date, Date]
): CalendarSlot[] => {
  const availableSlots: CalendarSlot[] = [];

  // Itera sobre os dias e horários disponíveis na configuração de disponibilidade
  availability.include.forEach(({ weekday, range: timeRange }) => {
    const [startHour, endHour] = timeRange.map(({ hours, minutes }) => {
      // Define o horário de início e fim com base no horário UTC
      const date = new Date(range[0]);
      date.setUTCHours(hours, minutes);
      return date;
    });

    const startDate = new Date(range[0]);
    const endDate = new Date(range[1]);
    let current = new Date(startDate);

    // Loop sobre cada dia no intervalo especificado
    while (current <= endDate) {
      // Verifica se o dia atual corresponde ao dia disponível
      if (current.getUTCDay() === weekday) {
        let slotStart = new Date(current);
        slotStart.setUTCHours(startHour.getUTCHours(), startHour.getUTCMinutes());

        // Cria slots de 30 minutos enquanto o slot de início for menor que o horário de fim
        while (slotStart < endHour) {
          const slotEnd = new Date(slotStart);
          slotEnd.setUTCMinutes(slotStart.getUTCMinutes() + 30);

          // Verifica se o slot se sobrepõe a algum evento existente
          const isOccupied = events.some(({ start, end, buffer }) => {
            const eventStart = new Date(start);
            const eventEnd = new Date(end);
            const beforeBuffer = buffer?.before ?? 0;
            const afterBuffer = buffer?.after ?? 0;

            // Ajusta o início e fim do evento com os buffers definidos
            eventStart.setUTCMinutes(eventStart.getUTCMinutes() - beforeBuffer);
            eventEnd.setUTCMinutes(eventEnd.getUTCMinutes() + afterBuffer);

            // Verifica se há sobreposição entre o slot e o evento
            return (
              (slotStart >= eventStart && slotStart < eventEnd) ||
              (slotEnd > eventStart && slotEnd <= eventEnd) ||
              (slotStart <= eventStart && slotEnd >= eventEnd)
            );
          });

          // Se o slot não estiver ocupado, adiciona-o à lista de slots disponíveis
          if (!isOccupied) {
            availableSlots.push({ start: new Date(slotStart), durationM: 30 });
          }

          // Avança para o próximo slot de 30 minutos
          slotStart.setUTCMinutes(slotStart.getUTCMinutes() + 30);
        }
      }
      // Avança para o próximo dia
      current.setUTCDate(current.getUTCDate() + 1);
    }
  });

  return availableSlots; // Retorna a lista de slots disponíveis
};
```