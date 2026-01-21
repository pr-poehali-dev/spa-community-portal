import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { getMasters, Master } from '@/lib/api';

const MastersListPage = () => {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    getMasters()
      .then(data => {
        if (isMounted) setMasters(data);
      })
      .catch(err => {
        if (isMounted) console.error(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const specializations = Array.from(new Set(masters.map(m => m.specialization)));

  const filteredMasters = masters
    .filter(master => {
      if (filterSpecialization !== 'all' && master.specialization !== filterSpecialization) return false;
      if (filterRating === '4+' && master.rating < 4) return false;
      if (filterRating === '4.5+' && master.rating < 4.5) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') return b.experience - a.experience;
      if (sortBy === 'reviews') return b.reviews_count - a.reviews_count;
      return 0;
    });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <p className="text-muted-foreground">Загрузка мастеров...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">Наши мастера</h1>
      <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
        Профессиональные пармастера с многолетним опытом и сертификацией
      </p>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Все специализации" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все специализации</SelectItem>
              {specializations.map(spec => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Все рейтинги" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все рейтинги</SelectItem>
              <SelectItem value="4+">От 4.0 и выше</SelectItem>
              <SelectItem value="4.5+">От 4.5 и выше</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Сортировка" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">По рейтингу</SelectItem>
            <SelectItem value="experience">По опыту</SelectItem>
            <SelectItem value="reviews">По отзывам</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMasters.map((master) => (
          <Card key={master.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <Link to={`/masters/${master.slug}`}>
              <div 
                className="h-56 bg-cover bg-center"
                style={{ backgroundImage: `url(${master.avatar_url})` }}
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
                  <span>{master.reviews_count} отзывов</span>
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

      {filteredMasters.length === 0 && (
        <div className="text-center py-12">
          <Icon name="UserX" size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Мастера не найдены</h3>
          <p className="text-muted-foreground">Попробуйте изменить фильтры</p>
        </div>
      )}
    </div>
  );
};

export default MastersListPage;