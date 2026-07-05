async function request(path, options) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export function getCourts() {
  return request('/api/courts');
}

export function getBookings() {
  return request('/api/bookings');
}

export function getAvailability(courtId, date) {
  return request(`/api/availability?courtId=${encodeURIComponent(courtId)}&date=${encodeURIComponent(date)}`);
}

export function createBooking(booking) {
  return request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(booking),
  });
}

export function cancelBooking(id) {
  return request(`/api/bookings/${id}`, { method: 'DELETE' });
}
