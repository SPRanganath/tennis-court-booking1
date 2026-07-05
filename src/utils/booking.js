// Slots are hourly. duration is in whole hours (1 or 2).
export function generateTimeSlots(openHour, closeHour) {
  const slots = [];
  for (let hour = openHour; hour < closeHour; hour++) {
    slots.push(hour);
  }
  return slots;
}

export function formatHour(hour) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

export function todayISODate() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

// occupiedSlots is a list of { hour, duration } already scoped to one court/date.
export function isSlotBooked(occupiedSlots, hour, duration) {
  return occupiedSlots.some((slot) => hour < slot.hour + slot.duration && slot.hour < hour + duration);
}

export function isPastSlot(date, hour) {
  const now = new Date();
  const slotDate = new Date(`${date}T00:00:00`);
  slotDate.setHours(hour);
  return slotDate < now;
}
