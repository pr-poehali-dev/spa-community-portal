const API_URL = 'https://functions.poehali.dev/4d4444ef-63b0-4b5a-8985-915f1ad69e1c';
const EVENTS_API_URL = 'https://functions.poehali.dev/4d4444ef-63b0-4b5a-8985-915f1ad69e1c';
const SCHEDULE_API_URL = 'https://functions.poehali.dev/4d4444ef-63b0-4b5a-8985-915f1ad69e1c';

export interface Event {
  id: string;
  slug: string;
  title: string;
  description?: string;
  duration_minutes: number;
  price: number;
  gender_type: 'male' | 'female' | 'mixed';
  city?: string;
  image_url?: string;
  images?: Array<{url: string}>;
  program?: string[];
  rules?: string[];
  bathhouse?: {
    id: number;
    slug?: string;
    name: string;
    address: string;
    description?: string;
    rating?: number;
    reviews_count?: number;
  };
  master?: {
    id: number;
    slug?: string;
    name: string;
    avatar_url: string;
    specialization?: string;
    experience?: number;
    rating?: number;
    reviews_count?: number;
  };
  organizer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    telegram?: string;
  };
  schedules_count: number;
  nearest_datetime?: string;
  available_spots: number;
  created_at?: string;
}

export interface ServiceSchedule {
  id: string;
  start_datetime: string;
  end_datetime: string;
  capacity_total: number;
  capacity_available: number;
  price?: number;
  status: 'active' | 'cancelled' | 'completed';
}

export interface Bath {
  id: number;
  slug: string;
  name: string;
  address: string;
  description: string;
  capacity: number;
  price_per_hour: number;
  features: string[];
  images: string[];
  rating: number;
  reviews_count: number;
}

export interface Master {
  id: number;
  slug: string;
  name: string;
  specialization: string;
  experience: number;
  description: string;
  avatar_url: string;
  services: { name: string; price: number; duration: number }[];
  rating: number;
  reviews_count: number;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'rituals' | 'health' | 'diy' | 'history';
  author: string;
  date: string;
  image_url: string;
}

export async function getEvents(filters?: {
  search?: string;
  city?: string;
  gender_type?: string;
  date_from?: string;
  date_to?: string;
  available_only?: boolean;
  sort?: string;
}): Promise<{items: Event[]; total: number}> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, String(value));
    });
  }
  
  const response = await fetch(`${EVENTS_API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch events');
  const data = await response.json();
  return data;
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const response = await fetch(`${EVENTS_API_URL}?slug=${slug}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch event');
  }
  return response.json();
}

export async function getEventSchedules(eventId: string, params?: {
  date_from?: string;
  date_to?: string;
  status?: string;
}): Promise<{schedules: ServiceSchedule[]}> {
  const queryParams = new URLSearchParams({
    id: eventId,
    action: 'schedule',
    ...params
  } as Record<string, string>);
  
  const response = await fetch(`${EVENTS_API_URL}?${queryParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch event schedules');
  return response.json();
}

export async function getScheduleCalendar(params?: {
  month?: string;
  city?: string;
  service_type?: string;
}): Promise<{month: string; calendar: Array<{date: string; events_count: number; available_spots: number}>}> {
  const queryParams = new URLSearchParams({endpoint: 'calendar', ...params} as Record<string, string>);
  
  const response = await fetch(`${SCHEDULE_API_URL}?${queryParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch calendar');
  return response.json();
}

export async function getDaySchedule(date: string, params?: {
  city?: string;
  service_type?: string;
}): Promise<{date: string; schedules: Array<any>}> {
  const queryParams = new URLSearchParams({endpoint: 'day', date, ...params} as Record<string, string>);
  
  const response = await fetch(`${SCHEDULE_API_URL}?${queryParams.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch day schedule');
  return response.json();
}

export async function getBaths(): Promise<Bath[]> {
  const params = new URLSearchParams({ resource: 'baths' });
  
  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch baths');
  return response.json();
}

export async function getBathBySlug(slug: string): Promise<Bath | null> {
  const params = new URLSearchParams({ resource: 'baths', slug });
  
  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch bath');
  return response.json();
}

export async function getMasters(): Promise<Master[]> {
  const params = new URLSearchParams({ resource: 'masters' });
  
  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch masters');
  return response.json();
}

export async function getMasterBySlug(slug: string): Promise<Master | null> {
  const params = new URLSearchParams({ resource: 'masters', slug });
  
  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch master');
  return response.json();
}

export async function getBlogPosts(category?: string): Promise<BlogPost[]> {
  const params = new URLSearchParams({ resource: 'blog' });
  if (category) params.append('category', category);
  
  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch blog posts');
  return response.json();
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const params = new URLSearchParams({ resource: 'blog', slug });
  
  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch blog post');
  return response.json();
}

export async function createBooking(data: {
  event_id: number;
  name: string;
  phone: string;
  telegram?: string;
}): Promise<{ success: boolean; booking_id: number }> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_booking', ...data })
  });
  
  if (!response.ok) throw new Error('Failed to create booking');
  return response.json();
}