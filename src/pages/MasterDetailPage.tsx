import { useParams, Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { mockMasters } from '@/data/mockData';

const MasterDetailPage = () => {
  const { slug } = useParams();
  const master = mockMasters.find(m => m.slug === slug);
  
  if (!master) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="animate-fade-in">
      <div 
        className="relative h-[50vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${master.avatar})` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <Link to="/masters" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <Icon name="ArrowLeft" size={20} />
              <span>Назад к мастерам</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              {master.name}
            </h1>
            <div className="flex flex-wrap gap-4 items-center text-white">
              <Badge className="bg-primary/90 hover:bg-primary text-white">{master.specialization}</Badge>
              <div className="flex items-center gap-2">
                <Icon name="Star" size={20} className="text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{master.rating}</span>
                <span className="text-white/80">({master.reviewsCount} отзывов)</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Award" size={20} />
                <span>{master.experience} лет опыта</span>
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
                <CardTitle className="font-serif text-2xl">О мастере</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {master.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Услуги и цены</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {master.services.map((service, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.duration} минут</p>
                        </div>
                        <p className="text-xl font-bold text-primary">{service.price} ₽</p>
                      </div>
                      {index < master.services.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Отзывы клиентов</CardTitle>
                <CardDescription>Что говорят о работе мастера</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">Дмитрий</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Icon key={i} name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Профессионал своего дела! Чувствуется многолетний опыт. 
                        Парение было очень мягким и эффективным. Обязательно вернусь!
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
                        <p className="font-semibold">Анна</p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(i => (
                            <Icon key={i} name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Замечательный мастер! Внимательный, деликатный, знает своё дело на отлично.
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
                <CardTitle className="font-serif text-2xl">Запись к мастеру</CardTitle>
                <CardDescription>Выберите удобное время для сеанса</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium mb-2">Стоимость услуг:</p>
                  {master.services.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{service.name}</span>
                      <span className="font-semibold">{service.price} ₽</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full" size="lg">
                  Записаться к мастеру
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

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <Icon name="Info" size={16} className="inline mr-1" />
                    Рекомендуем записываться заранее — у мастера высокая загрузка
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDetailPage;
