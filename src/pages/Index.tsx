import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/components/HomePage';
import { EventsPage } from '@/components/EventsPage';
import { AboutPage } from '@/components/AboutPage';
import { ContactsPage } from '@/components/ContactsPage';
import { Event } from '@/components/EventCard';

const mockEvents: Event[] = [
  {
    id: 1,
    title: 'Традиционный мужской парной день',
    date: '2026-01-18',
    time: '14:00',
    location: 'Баня на Пресне',
    type: 'men',
    price: 1500,
    availableSpots: 3,
    totalSpots: 10,
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/73ab70f9-0949-4d1d-b65d-9025415051e9.jpg'
  },
  {
    id: 2,
    title: 'Женское wellness-парение',
    date: '2026-01-20',
    time: '16:00',
    location: 'Банный клуб Арбат',
    type: 'women',
    price: 1800,
    availableSpots: 5,
    totalSpots: 8,
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/6e3e3866-e28e-4859-bb1d-4c95b1d02ac0.jpg'
  },
  {
    id: 3,
    title: 'Совместный банный ритуал',
    date: '2026-01-25',
    time: '18:00',
    location: 'Баня у реки',
    type: 'mixed',
    price: 2000,
    availableSpots: 7,
    totalSpots: 12,
    image: 'https://cdn.poehali.dev/projects/ef3c479a-8168-43df-a113-89d5072d1123/files/c78efb25-6330-4360-9373-6451dd986f0a.jpg'
  },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookingData, setBookingData] = useState({ name: '', phone: '', telegram: '' });
  const [filterType, setFilterType] = useState<'all' | 'men' | 'women' | 'mixed'>('all');

  const handleBooking = (event: Event) => {
    setSelectedEvent(event);
  };

  const submitBooking = () => {
    console.log('Booking:', { event: selectedEvent, data: bookingData });
    alert('Заявка отправлена! Мы свяжемся с вами в Telegram для подтверждения.');
    setSelectedEvent(null);
    setBookingData({ name: '', phone: '', telegram: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      {activeSection === 'home' && (
        <HomePage
          events={mockEvents}
          bookingData={bookingData}
          onBookingChange={setBookingData}
          onSubmitBooking={submitBooking}
          onBookingClick={handleBooking}
          onNavigateToEvents={() => setActiveSection('events')}
        />
      )}

      {activeSection === 'events' && (
        <EventsPage
          events={mockEvents}
          filterType={filterType}
          onFilterChange={setFilterType}
          bookingData={bookingData}
          onBookingChange={setBookingData}
          onSubmitBooking={submitBooking}
          onBookingClick={handleBooking}
        />
      )}

      {activeSection === 'about' && <AboutPage />}

      {activeSection === 'contacts' && <ContactsPage />}

      <Footer />
    </div>
  );
};

export default Index;
