import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { mockMasters } from '@/data/mockData';

const MastersListPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">Наши мастера</h1>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Профессиональные пармастера с многолетним опытом и сертификацией
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockMasters.map((master) => (
          <Card key={master.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <Link to={`/masters/${master.slug}`}>
              <div 
                className="h-56 bg-cover bg-center"
                style={{ backgroundImage: `url(${master.avatar})` }}
              />
            </Link>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Link to={`/masters/${master.slug}`}>
                  <CardTitle className="font-serif text-xl hover:text-primary transition-colors">
                    {master.name}
                  </CardTitle>
                </Link>
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{master.rating}</span>
                </div>
              </div>
              <CardDescription>
                <div className="space-y-2">
                  <Badge variant="secondary">{master.specialization}</Badge>
                  <p className="text-sm">{master.experience} лет опыта</p>
                  <p className="text-sm line-clamp-2">{master.description}</p>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon name="Award" size={16} />
                  <span>{master.reviewsCount} отзывов</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">от</p>
                    <p className="text-xl font-bold text-primary">
                      {Math.min(...master.services.map(s => s.price))} ₽
                    </p>
                  </div>
                  <Link to={`/masters/${master.slug}`}>
                    <Button>Записаться</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MastersListPage;
