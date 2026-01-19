import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Event {
  id: number;
  slug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'men' | 'women' | 'mixed';
  price: number;
  available_spots: number;
  total_spots: number;
  image_url?: string;
  bathhouse_id?: number | null;
  master_id?: number | null;
}

interface EventCardProps {
  event: Event;
  bathName?: string;
  masterName?: string;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
}

const getTypeBadge = (type: string) => {
  const config = {
    men: { label: 'Мужское', variant: 'default' as const },
    women: { label: 'Женское', variant: 'secondary' as const },
    mixed: { label: 'Смешанное', variant: 'outline' as const },
  };
  const typeConfig = config[type as keyof typeof config];
  return <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>;
};

const EventCard = ({ event, bathName, masterName, onEdit, onDelete }: EventCardProps) => {
  return (
    <Card className="border-orange-100 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-orange-900">{event.title}</h3>
              {getTypeBadge(event.type)}
            </div>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" className="h-4 w-4" />
                <span>{new Date(event.date).toLocaleDateString('ru-RU')} в {event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="MapPin" className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              {bathName && (
                <div className="flex items-center gap-2">
                  <Icon name="Home" className="h-4 w-4 text-primary" />
                  <span className="text-primary font-medium">{bathName}</span>
                </div>
              )}
              {masterName && (
                <div className="flex items-center gap-2">
                  <Icon name="User" className="h-4 w-4 text-primary" />
                  <span className="text-primary font-medium">{masterName}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Icon name="Users" className="h-4 w-4" />
                <span>
                  {event.total_spots - event.available_spots} / {event.total_spots} участников
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Coins" className="h-4 w-4" />
                <span>{event.price} ₽</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => window.open(`/events/${event.slug}`, '_blank')}
            >
              <Icon name="Eye" className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onEdit(event)}
            >
              <Icon name="Pencil" className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(event.id)}
            >
              <Icon name="Trash2" className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;