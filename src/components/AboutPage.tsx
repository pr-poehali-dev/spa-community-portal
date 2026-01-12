import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in max-w-4xl">
      <h2 className="text-4xl font-serif font-bold text-center mb-8">О сообществе</h2>
      
      <div className="prose prose-lg mx-auto">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-serif font-semibold mb-4">Наша миссия</h3>
            <p className="text-muted-foreground leading-relaxed">
              Мы создаём пространство, где люди могут познакомиться с аутентичными банными традициями, 
              найти единомышленников и насладиться целебным эффектом качественного парения в дружелюбной атмосфере.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-serif font-semibold mb-4">Наши ценности</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <Icon name="Check" size={20} className="text-primary mt-1 flex-shrink-0" />
                <span><strong>Доступность:</strong> Организуем шеринг-мероприятия, чтобы банные ритуалы были доступны каждому</span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" size={20} className="text-primary mt-1 flex-shrink-0" />
                <span><strong>Профессионализм:</strong> Работаем только с сертифицированными пармастерами</span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" size={20} className="text-primary mt-1 flex-shrink-0" />
                <span><strong>Комьюнити:</strong> Создаём теплую атмосферу, где каждый чувствует себя частью большой семьи</span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="Check" size={20} className="text-primary mt-1 flex-shrink-0" />
                <span><strong>Традиции:</strong> Бережно храним и передаем знания о русских банных ритуалах</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-2xl font-serif font-semibold mb-4">Как это работает</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <p className="font-medium">Выбираете событие</p>
                  <p className="text-sm text-muted-foreground">Находите подходящее мероприятие в афише</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <p className="font-medium">Оставляете заявку</p>
                  <p className="text-sm text-muted-foreground">Заполняете простую форму с контактами</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <p className="font-medium">Получаете подтверждение</p>
                  <p className="text-sm text-muted-foreground">Мы связываемся с вами в Telegram и высылаем детали</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <p className="font-medium">Наслаждаетесь парением</p>
                  <p className="text-sm text-muted-foreground">Приходите на мероприятие и погружаетесь в атмосферу</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
