import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { getScheduleCalendar, getDaySchedule } from '@/lib/api';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const EventsCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, {events_count: number; available_spots: number}>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySchedules, setDaySchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayLoading, setDayLoading] = useState(false);

  useEffect(() => {
    loadCalendar();
  }, [currentDate]);

  const loadCalendar = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const monthString = `${year}-${month}`;
      
      const data = await getScheduleCalendar({ month: monthString });
      
      const calendarMap: Record<string, {events_count: number; available_spots: number}> = {};
      data.calendar.forEach(day => {
        calendarMap[day.date] = {
          events_count: day.events_count,
          available_spots: day.available_spots
        };
      });
      
      setCalendarData(calendarMap);
    } catch (error) {
      console.error('Failed to load calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDaySchedule = async (date: string) => {
    setDayLoading(true);
    try {
      const data = await getDaySchedule(date);
      setDaySchedules(data.schedules || []);
      setSelectedDate(date);
    } catch (error) {
      console.error('Failed to load day schedule:', error);
    } finally {
      setDayLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const formatDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      weekday: 'long'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const days = getDaysInMonth(currentDate);
  const today = formatDateKey(new Date());

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">Календарь событий</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Выберите удобную дату для посещения мероприятий
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => changeMonth(-1)}
                >
                  <Icon name="ChevronLeft" className="h-4 w-4" />
                </Button>
                
                <CardTitle className="font-serif text-2xl">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => changeMonth(1)}
                >
                  <Icon name="ChevronRight" className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Загрузка календаря...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {WEEKDAYS.map(day => (
                      <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((day, index) => {
                      if (!day) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                      }
                      
                      const dateKey = formatDateKey(day);
                      const dayData = calendarData[dateKey];
                      const isToday = dateKey === today;
                      const isSelected = dateKey === selectedDate;
                      const hasEvents = dayData && dayData.events_count > 0;
                      
                      return (
                        <button
                          key={dateKey}
                          onClick={() => hasEvents && loadDaySchedule(dateKey)}
                          disabled={!hasEvents}
                          className={`
                            aspect-square rounded-lg border-2 transition-all relative
                            ${isToday ? 'border-primary' : 'border-transparent'}
                            ${isSelected ? 'bg-primary text-white' : 'bg-card hover:bg-accent'}
                            ${hasEvents ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-50'}
                          `}
                        >
                          <div className="flex flex-col items-center justify-center h-full">
                            <span className="text-lg font-semibold">{day.getDate()}</span>
                            {hasEvents && (
                              <div className="flex gap-1 mt-1">
                                <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`} />
                                {dayData.available_spots > 0 && (
                                  <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`} />
                                )}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span>Есть события</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Есть места</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="font-serif text-xl">
                {selectedDate ? formatDisplayDate(selectedDate) : 'Выберите дату'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <div className="text-center py-8">
                  <Icon name="Calendar" className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">
                    Нажмите на день с событиями, чтобы увидеть расписание
                  </p>
                </div>
              ) : dayLoading ? (
                <div className="text-center py-8">
                  <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Загрузка расписания...</p>
                </div>
              ) : daySchedules.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="CalendarOff" className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">На эту дату нет доступных событий</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {daySchedules.map((schedule) => (
                    <Card key={schedule.id} className="border">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3 mb-3">
                          {schedule.service.image_url && (
                            <img 
                              src={schedule.service.image_url}
                              alt={schedule.service.title}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <Link 
                              to={`/events/${schedule.service.slug}`}
                              className="font-semibold hover:text-primary transition-colors line-clamp-2"
                            >
                              {schedule.service.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Icon name="Clock" className="h-3 w-3" />
                              <span>{formatTime(schedule.start_datetime)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-primary">{schedule.price} ₽</p>
                            <p className="text-xs text-muted-foreground">
                              Мест: {schedule.capacity_available}/{schedule.capacity_total}
                            </p>
                          </div>
                          <Link to={`/events/${schedule.service.slug}`}>
                            <Button size="sm" disabled={schedule.capacity_available === 0}>
                              {schedule.capacity_available > 0 ? 'Записаться' : 'Мест нет'}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventsCalendarPage;
