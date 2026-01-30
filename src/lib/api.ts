const API_URL = 'https://functions.poehali.dev/4d4444ef-63b0-4b5a-8985-915f1ad69e1c';

export interface Event {
  id: number;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'men' | 'women' | 'mixed';
  price: number;
  available_spots: number;
  total_spots: number;
  image_url: string;
  description?: string;
  program?: string[];
  rules?: string[];
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

export async function getEvents(type?: string): Promise<Event[]> {
  const params = new URLSearchParams({ resource: 'events' });
  if (type) params.append('type', type);
  
  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch events');
  return response.json();
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const params = new URLSearchParams({ resource: 'events', slug });
  
  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch event');
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