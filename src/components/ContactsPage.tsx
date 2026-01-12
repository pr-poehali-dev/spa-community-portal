import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export const ContactsPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in max-w-2xl">
      <h2 className="text-4xl font-serif font-bold text-center mb-8">Контакты</h2>
      
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-serif font-semibold mb-4">Свяжитесь с нами</h3>
            <p className="text-muted-foreground mb-6">
              Мы всегда рады ответить на ваши вопросы и помочь с организацией посещения
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Icon name="Send" size={24} className="text-primary flex-shrink-0" />
              <div>
                <p className="font-medium">Telegram</p>
                <a href="https://t.me/sparkomrf" className="text-primary hover:underline">@sparkomrf</a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Icon name="Phone" size={24} className="text-primary flex-shrink-0" />
              <div>
                <p className="font-medium">Телефон</p>
                <a href="tel:+79991234567" className="text-primary hover:underline">+7 (999) 123-45-67</a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Icon name="Mail" size={24} className="text-primary flex-shrink-0" />
              <div>
                <p className="font-medium">Email</p>
                <a href="mailto:hello@sparkom.rf" className="text-primary hover:underline">hello@sparkom.rf</a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Icon name="MapPin" size={24} className="text-primary flex-shrink-0" />
              <div>
                <p className="font-medium">Адрес</p>
                <p className="text-muted-foreground">Москва, мероприятия проходят в разных банях города</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t">
            <h4 className="font-semibold mb-3">График работы</h4>
            <p className="text-muted-foreground">Мероприятия проводятся еженедельно. Подробное расписание смотрите в разделе "События".</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
