# Task 05 - List available slots multiple person

In the `src/5-list-available-30-minute-slots-multiple-person/list-available-30-minute-slots-multiple-person.ts` file, you need to implement a function that returns the slots to which ALL doctors are available between a specific date range.

Similar to `src/4-list-available-30-minute-slots/list-available-30-minute-slots.ts`, but now you have to deal with multiple doctors. For example:

```ts
const doctorJames = {
  // Every Tuesday 9:00—14:00
  availability: {
    include: [
      {
        weekday: Weekday.tuesday,
        range: [
          { hours: 9, minutes: 0 },
          { hours: 14, minutes: 0 }
        ]
      }
    ]
  },
  events: [
    // January 16th 2024, Tuesday 12:00—13:00, with no buffer
    {
      start: new Date(`2024-01-16T12:00`),
      end: new Date(`2024-01-16T13:00`),
      buffer: { before: 0, after: 0 }
    }
  ]
};

const doctorLarissa = {
  // Every Tuesday 12:00—18:00
  availability: {
    include: [
      {
        weekday: Weekday.tuesday,
        range: [
          { hours: 12, minutes: 0 },
          { hours: 18, minutes: 0 }
        ]
      }
    ]
  },
  events: []
};

// January 15th 2024, Monday 00:00 -> January 16th 2024, Tuesday 23:59
const range: [Date, Date] = [
  new Date(`2024-01-15T00:00`),
  new Date(`2024-01-16T23:59`)
];

listAvailableSlotsMultiplePerson([doctorJames, doctorLarissa], range);
//=> Should return the slots where James and Larissa are available:
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
// Função para listar slots de 30 minutos disponíveis para múltiplas pessoas
export const listAvailable30MinuteSlotsMultiplePerson = (
  attendees: Array<{
    availability: CalendarAvailability;
    events: Array<CalendarEvent>;
  }>,
  range: [Date, Date], // Intervalo de tempo em que buscamos slots disponíveis
): Array<CalendarSlot> => {
  const availableSlots: CalendarSlot[] = []; // Array para armazenar slots disponíveis

  // Função auxiliar para verificar se um slot está disponível
  const isSlotAvailable = (start: Date, durationM: number): boolean => {
    // Verifica se todos os participantes têm disponibilidade
    return attendees.every(({ availability, events }) => {
      const isAvailable = availability.include.some(({ weekday, range: timeRange }) => {
        const dayOfWeek = start.getUTCDay(); // Obtém o dia da semana do slot

        // Verifica se o dia da semana corresponde à disponibilidade do participante
        if (dayOfWeek !== weekday) return false;

        const [startTime, endTime] = timeRange; // Horário de início e fim da disponibilidade
        const startRange = new Date(start);
        startRange.setUTCHours(startTime.hours, startTime.minutes); // Início do intervalo de disponibilidade
        const endRange = new Date(start);
        endRange.setUTCHours(endTime.hours, endTime.minutes); // Fim do intervalo de disponibilidade

        // Verifica se o slot está dentro do intervalo de disponibilidade
        if (start < startRange || start >= endRange) return false;

        const slotEnd = new Date(start);
        slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + durationM); // Define o horário de término do slot

        // Verifica se há conflitos com eventos já agendados
        return !events.some(event => {
          const eventStart = new Date(event.start); // Início do evento
          const eventEnd = new Date(event.end); // Fim do evento

          // Aplica o buffer, se existir
          if (event.buffer) {
            eventStart.setUTCMinutes(eventStart.getUTCMinutes() - event.buffer.before);
            eventEnd.setUTCMinutes(eventEnd.getUTCMinutes() + event.buffer.after);
          }

          // Retorna true se houver conflito de horários
          return (start < eventEnd && slotEnd > eventStart);
        });
      });

      return isAvailable; // Retorna true se o slot estiver disponível para este participante
    });
  };

  // Loop para verificar os slots de 30 minutos dentro do intervalo especificado
  let current = new Date(range[0]);
  while (current < range[1]) {
    // Se o slot atual estiver disponível, adiciona à lista
    if (isSlotAvailable(current, 30)) {
      availableSlots.push({ start: new Date(current), durationM: 30 });
    }
    current.setUTCMinutes(current.getUTCMinutes() + 30); // Avança 30 minutos para o próximo slot
  }

  return availableSlots; // Retorna a lista de slots disponíveis
};
```