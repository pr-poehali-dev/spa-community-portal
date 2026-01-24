import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { mockBaths } from '@/data/mockData';

const BathsListPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">Бани-партнеры</h1>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Лучшие бани Москвы с проверенным качеством и традициями
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBaths.map((bath) => (
          <Card key={bath.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <Link to={`/bany/${bath.slug}`}>
              <div 
                className="h-56 bg-cover bg-center"
                style={{ backgroundImage: `url(${bath.images[0]})` }}
              />
            </Link>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Link to={`/bany/${bath.slug}`}>
                  <CardTitle className="font-serif text-xl hover:text-primary transition-colors">
                    {bath.name}
                  </CardTitle>
                </Link>
                <div className="flex items-center gap-1">
                  <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">{bath.rating}</span>
                </div>
              </div>
              <CardDescription>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <Icon name="MapPin" size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{bath.address}</span>
                  </div>
                  <p className="text-sm line-clamp-2">{bath.description}</p>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {bath.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {bath.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{bath.features.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-2xl font-bold text-primary">{bath.pricePerHour} ₽</p>
                    <p className="text-xs text-muted-foreground">за час</p>
                  </div>
                  <Link to={`/bany/${bath.slug}`}>
                    <Button>Подробнее</Button>
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

export default BathsListPage;
