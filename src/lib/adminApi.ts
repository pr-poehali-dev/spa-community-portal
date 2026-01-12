const ADMIN_API_URL = 'https://functions.poehali.dev/b6fbba96-cc0b-4f59-b94d-e60ab18fe1b0';

async function request(method: string, resource: string, data?: any, id?: string | number) {
  const url = new URL(ADMIN_API_URL);
  url.searchParams.set('resource', resource);
  if (id) url.searchParams.set('id', String(id));

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url.toString(), options);
  return response.json();
}

export const adminApi = {
  events: {
    getAll: () => request('GET', 'events'),
    create: (data: any) => request('POST', 'events', data),
    update: (id: number, data: any) => request('PUT', 'events', data, id),
    delete: (id: number) => request('DELETE', 'events', undefined, id),
  },
  saunas: {
    getAll: () => request('GET', 'saunas'),
    create: (data: any) => request('POST', 'saunas', data),
    update: (id: number, data: any) => request('PUT', 'saunas', data, id),
    delete: (id: number) => request('DELETE', 'saunas', undefined, id),
  },
  masters: {
    getAll: () => request('GET', 'masters'),
    create: (data: any) => request('POST', 'masters', data),
    update: (id: number, data: any) => request('PUT', 'masters', data, id),
    delete: (id: number) => request('DELETE', 'masters', undefined, id),
  },
  users: {
    getAll: () => request('GET', 'users'),
    create: (data: any) => request('POST', 'users', data),
    update: (id: number, data: any) => request('PUT', 'users', data, id),
    delete: (id: number) => request('DELETE', 'users', undefined, id),
  },
  bookings: {
    getAll: () => request('GET', 'bookings'),
    update: (id: number, data: any) => request('PUT', 'bookings', data, id),
    delete: (id: number) => request('DELETE', 'bookings', undefined, id),
  },
};
