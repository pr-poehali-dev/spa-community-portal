import { useParams, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { mockBaths } from '@/data/mockData';

const BathDetailPage = () => {
  const { slug } = useParams();
  const bath = mockBaths.find(b => b.slug === slug);
  
  if (!bath) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="animate-fade-in">
      <div 
        className="relative h-[50vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${bath.images[0]})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <Link to="/bany" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <Icon name="ArrowLeft" size={20} />
              <span>Назад к баням</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              {bath.name}
            </h1>
            <div className="flex flex-wrap gap-4 items-center text-white">
              <div className="flex items-center gap-2">
                <Icon name="Star" size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{bath.rating}</span>
                <span className="text-white/80">({bath.reviewsCount} отзывов)</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={20} />
                <span>{bath.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Users" size={20} />
                <span>До {bath.capacity} человек</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">О бане</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {bath.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Особенности и удобства</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {bath.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Icon name="Check" size={20} className="text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Отзывы гостей</CardTitle>
                <CardDescription>Что говорят посетители о бане</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">Александр</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Icon key={i} name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Отличная традиционная баня! Дровяная печь создаёт неповторимую атмосферу. 
                        Персонал дружелюбный, всё чисто и ухожено.
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">Мария</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Icon key={i} name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ходим сюда всей семьёй уже несколько лет. Идеальное сочетание цены и качества.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Бронирование</CardTitle>
                <CardDescription>Забронируйте баню для вашей компании</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Стоимость:</span>
                    <span className="text-2xl font-bold text-primary">{bath.pricePerHour} ₽/час</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Вместимость:</span>
                    <span>До {bath.capacity} человек</span>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Забронировать баню
                </Button>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Контакты</h4>
                  <a href="tel:+79991234567" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Icon name="Phone" size={16} />
                    <span>+7 (999) 123-45-67</span>
                  </a>
                  <a href="https://t.me/sparkomrf" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Icon name="Send" size={16} />
                    <span>@sparkomrf</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BathDetailPage;
