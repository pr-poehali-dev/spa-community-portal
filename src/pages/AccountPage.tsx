import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import RoleSwitcher from '@/components/RoleSwitcher';
import { type RoleType } from '@/types/roles';

export default function AccountPage() {
  const [currentRole, setCurrentRole] = useState<RoleType | null>(null);
  
  const userId = 1;
  const user = {
    id: 1,
    name: 'Иван Петров',
    email: 'ivan@example.com',
    phone: '+7 (999) 123-45-67',
    avatar_url: '',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-orange-100 sticky top-4">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.avatar_url} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-orange-900">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>

              <RoleSwitcher 
                userId={userId} 
                currentRole={currentRole}
                onRoleChange={setCurrentRole}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {currentRole === null && <ParticipantView user={user} />}
          {currentRole === 'organizer' && <OrganizerView />}
          {currentRole === 'master' && <MasterView />}
          {currentRole === 'partner' && <PartnerView />}
          {currentRole === 'editor' && <EditorView />}
        </div>
      </div>
    </div>
  );
}

function ParticipantView({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <Card className="border-orange-100">
        <CardHeader>
          <CardTitle className="text-orange-900 flex items-center gap-2">
            <Icon name="User" className="h-5 w-5" />
            Профиль участника
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Профиль</TabsTrigger>
              <TabsTrigger value="bookings">Мои записи</TabsTrigger>
              <TabsTrigger value="favorites">Избранное</TabsTrigger>
              <TabsTrigger value="reviews">Отзывы</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Телефон</label>
                  <p className="text-gray-900 mt-1">{user.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1">{user.email}</p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-amber-600">
                Редактировать профиль
              </Button>
            </TabsContent>

            <TabsContent value="bookings">
              <div className="text-center py-12 text-gray-500">
                <Icon name="Calendar" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>У вас пока нет записей на события</p>
                <Button variant="outline" className="mt-4">
                  Посмотреть события
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="favorites">
              <div className="text-center py-12 text-gray-500">
                <Icon name="Heart" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>У вас пока нет избранного</p>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="text-center py-12 text-gray-500">
                <Icon name="MessageSquare" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Вы еще не оставляли отзывов</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function OrganizerView() {
  return (
    <div className="space-y-6">
      <Card className="border-orange-100">
        <CardHeader>
          <CardTitle className="text-orange-900 flex items-center gap-2">
            <Icon name="Calendar" className="h-5 w-5" />
            Кабинет организатора
            <Badge className="ml-auto">Новичок</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="events">
            <TabsList className="mb-6">
              <TabsTrigger value="events">Мои события</TabsTrigger>
              <TabsTrigger value="create">Создать событие</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <div className="text-center py-12 text-gray-500">
                <Icon name="Calendar" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>У вас пока нет созданных событий</p>
                <Button className="mt-4 bg-gradient-to-r from-orange-500 to-amber-600">
                  Создать первое событие
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="create">
              <div className="space-y-4">
                <p className="text-gray-600">Форма создания события будет здесь</p>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-600">Событий проведено</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-600">Участников</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">—</div>
                    <div className="text-sm text-gray-600">Средний рейтинг</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function MasterView() {
  return (
    <div className="space-y-6">
      <Card className="border-orange-100">
        <CardHeader>
          <CardTitle className="text-orange-900 flex items-center gap-2">
            <Icon name="Award" className="h-5 w-5" />
            Кабинет мастера
            <Badge className="ml-auto">Подмастерье</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sessions">
            <TabsList className="mb-6">
              <TabsTrigger value="sessions">Мои сеансы</TabsTrigger>
              <TabsTrigger value="schedule">Расписание</TabsTrigger>
              <TabsTrigger value="portfolio">Портфолио</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
            </TabsList>

            <TabsContent value="sessions">
              <div className="text-center py-12 text-gray-500">
                <Icon name="Calendar" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>У вас пока нет запланированных сеансов</p>
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <p className="text-gray-600">Календарь расписания будет здесь</p>
            </TabsContent>

            <TabsContent value="portfolio">
              <p className="text-gray-600">Ваше портфолио будет здесь</p>
            </TabsContent>

            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-600">Сеансов проведено</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">—</div>
                    <div className="text-sm text-gray-600">Средний рейтинг</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-600">Отзывов</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function PartnerView() {
  return (
    <div className="space-y-6">
      <Card className="border-orange-100">
        <CardHeader>
          <CardTitle className="text-orange-900 flex items-center gap-2">
            <Icon name="Store" className="h-5 w-5" />
            Кабинет партнёра
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sauna">
            <TabsList className="mb-6">
              <TabsTrigger value="sauna">Моя баня</TabsTrigger>
              <TabsTrigger value="calendar">Календарь</TabsTrigger>
              <TabsTrigger value="bookings">Бронирования</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
            </TabsList>

            <TabsContent value="sauna">
              <p className="text-gray-600">Информация о вашей бане будет здесь</p>
            </TabsContent>

            <TabsContent value="calendar">
              <p className="text-gray-600">Календарь занятости будет здесь</p>
            </TabsContent>

            <TabsContent value="bookings">
              <div className="text-center py-12 text-gray-500">
                <Icon name="Calendar" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>У вас пока нет бронирований</p>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-600">Мероприятий</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">0₽</div>
                    <div className="text-sm text-gray-600">Заработано</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">—</div>
                    <div className="text-sm text-gray-600">Средний рейтинг</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function EditorView() {
  return (
    <div className="space-y-6">
      <Card className="border-orange-100">
        <CardHeader>
          <CardTitle className="text-orange-900 flex items-center gap-2">
            <Icon name="FileText" className="h-5 w-5" />
            Кабинет редактора
            <Badge className="ml-auto">Автор</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="articles">
            <TabsList className="mb-6">
              <TabsTrigger value="articles">Мои статьи</TabsTrigger>
              <TabsTrigger value="drafts">Черновики</TabsTrigger>
              <TabsTrigger value="create">Новая статья</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
            </TabsList>

            <TabsContent value="articles">
              <div className="text-center py-12 text-gray-500">
                <Icon name="FileText" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>У вас пока нет опубликованных статей</p>
                <Button className="mt-4 bg-gradient-to-r from-orange-500 to-amber-600">
                  Написать первую статью
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="drafts">
              <div className="text-center py-12 text-gray-500">
                <Icon name="FileText" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>У вас нет черновиков</p>
              </div>
            </TabsContent>

            <TabsContent value="create">
              <p className="text-gray-600">Редактор статей будет здесь</p>
            </TabsContent>

            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-600">Статей</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-600">Просмотров</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-orange-600">0</div>
                    <div className="text-sm text-gray-600">Комментариев</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
