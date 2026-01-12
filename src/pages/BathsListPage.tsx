import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { getBaths, Bath } from '@/lib/api';

const BathsListPage = () => {
  const [baths, setBaths] = useState<Bath[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterDistrict, setFilterDistrict] = useState<string>('all');
  const [filterCapacity, setFilterCapacity] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('rating');

  useEffect(() => {
    getBaths()
      .then(data => setBaths(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const extractDistrict = (address: string) => {
    const match = address.match(/р-н\s+([^,]+)/);
    return match ? match[1].trim() : 'Другой';
  };

  const districts = Array.from(new Set(baths.map(b => extractDistrict(b.address))));

  const filteredBaths = baths
    .filter(bath => {
      if (filterDistrict !== 'all' && extractDistrict(bath.address) !== filterDistrict) return false;
      if (filterCapacity === '10+' && bath.capacity < 10) return false;
      if (filterCapacity === '15+' && bath.capacity < 15) return false;
      if (filterCapacity === '20+' && bath.capacity < 20) return false;
      if (filterRating === '4+' && bath.rating < 4) return false;
      if (filterRating === '4.5+' && bath.rating < 4.5) return false;
      if (searchQuery && !bath.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-asc') return a.price_per_hour - b.price_per_hour;
      if (sortBy === 'price-desc') return b.price_per_hour - a.price_per_hour;
      if (sortBy === 'capacity') return b.capacity - a.capacity;
      return 0;
    });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">Бани-партнеры</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Лучшие бани Москвы с проверенным качеством и традициями
      </p>

      <div className="space-y-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Поиск</label>
            <Input
              placeholder="Поиск бани по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Район</label>
            <Select value={filterDistrict} onValueChange={setFilterDistrict}>
              <SelectTrigger>
                <SelectValue placeholder="Все районы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все районы</SelectItem>
                {districts.map(district => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Вместимость</label>
            <Select value={filterCapacity} onValueChange={setFilterCapacity}>
              <SelectTrigger>
                <SelectValue placeholder="Вместимость" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любая</SelectItem>
                <SelectItem value="10+">От 10 человек</SelectItem>
                <SelectItem value="15+">От 15 человек</SelectItem>
                <SelectItem value="20+">От 20 человек</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Рейтинг</label>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger>
                <SelectValue placeholder="Рейтинг" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любой</SelectItem>
                <SelectItem value="4+">От 4.0</SelectItem>
                <SelectItem value="4.5+">От 4.5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Сортировка</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">По рейтингу</SelectItem>
                <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
                <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
                <SelectItem value="capacity">По вместимости</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Найдено: {filteredBaths.length} {filteredBaths.length === 1 ? 'баня' : 'бань'}</span>
          {(filterDistrict !== 'all' || filterCapacity !== 'all' || filterRating !== 'all' || searchQuery) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setFilterDistrict('all');
                setFilterCapacity('all');
                setFilterRating('all');
                setSearchQuery('');
              }}
            >
              <Icon name="X" size={16} className="mr-1" />
              Сбросить фильтры
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBaths.map((bath) => (
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
                    <span className="line-clamp-1">{bath.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Users" size={16} className="flex-shrink-0" />
                    <span>До {bath.capacity} человек</span>
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
                    <p className="text-2xl font-bold text-primary">{bath.price_per_hour} ₽</p>
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

      {filteredBaths.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Home" size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Бани не найдены</h3>
          <p className="text-muted-foreground mb-4">Попробуйте изменить фильтры или поисковый запрос</p>
          <Button 
            variant="outline"
            onClick={() => {
              setFilterDistrict('all');
              setFilterCapacity('all');
              setFilterRating('all');
              setSearchQuery('');
            }}
          >
            Сбросить фильтры
          </Button>
        </div>
      )}
    </div>
  );
};

export default BathsListPage;