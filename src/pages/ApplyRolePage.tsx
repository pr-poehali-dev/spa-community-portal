import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, type RoleType } from '@/types/roles';
import { adminApi } from '@/lib/adminApi';

const ROLE_REQUIREMENTS: Record<RoleType, string[]> = {
  organizer: [
    'Минимум 18 лет',
    'Базовое знание банных традиций',
    'Готовность пройти тест (10 вопросов)',
    'Ответственность и пунктуальность',
  ],
  master: [
    'Опыт в парении от 1 года',
    'Портфолио работ (фото/видео)',
    'Пробный сеанс с участниками',
    'Минимальный рейтинг 4.0',
  ],
  partner: [
    'Владение баней',
    'Готовность принимать группы',
    'Подписание договора',
    'Выезд для проверки локации',
  ],
  editor: [
    'Опыт написания статей',
    'Грамотная письменная речь',
    'Тестовое задание',
    'Знание банной культуры',
  ],
};

export default function ApplyRolePage() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole) return;

    const userId = 1;

    try {
      setSubmitting(true);
      await adminApi.roles.applyForRole({
        user_id: userId,
        role_type: selectedRole,
        application_data: formData,
      });

      toast({
        title: 'Заявка отправлена!',
        description: 'Мы рассмотрим вашу заявку в ближайшее время.',
      });

      setSelectedRole(null);
      setFormData({});
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-orange-900 mb-2">Получить новую роль</h1>
          <p className="text-gray-600">Выберите роль и подайте заявку</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(ROLE_LABELS) as RoleType[]).map((roleType) => (
            <Card 
              key={roleType} 
              className="border-orange-100 hover:border-orange-300 transition-colors cursor-pointer"
              onClick={() => setSelectedRole(roleType)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Icon name={getRoleIcon(roleType)} className="h-5 w-5" />
                  {ROLE_LABELS[roleType]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{ROLE_DESCRIPTIONS[roleType]}</p>
                
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 uppercase">Требования:</p>
                  <ul className="space-y-1">
                    {ROLE_REQUIREMENTS[roleType].map((req, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                        <Icon name="Check" className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-600">
                  Подать заявку
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
          >
            <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Назад в профиль
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => setSelectedRole(null)}
      >
        <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
        Назад
      </Button>

      <Card className="border-orange-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Icon name={getRoleIcon(selectedRole)} className="h-6 w-6" />
            Заявка на роль: {ROLE_LABELS[selectedRole]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {selectedRole === 'organizer' && (
            <>
              <div>
                <Label>Почему вы хотите стать организатором?</Label>
                <Textarea
                  placeholder="Расскажите о своей мотивации..."
                  value={formData.motivation || ''}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Предпочтительные форматы</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['Мужские', 'Женские', 'Совместные'].map((format) => (
                    <Badge
                      key={format}
                      variant={formData.formats?.includes(format) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const formats = formData.formats || [];
                        const updated = formats.includes(format)
                          ? formats.filter((f: string) => f !== format)
                          : [...formats, format];
                        setFormData({ ...formData, formats: updated });
                      }}
                    >
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedRole === 'master' && (
            <>
              <div>
                <Label>Ваш опыт в парении (лет)</Label>
                <Input
                  type="number"
                  placeholder="3"
                  value={formData.experience || ''}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Специализации</Label>
                <Input
                  placeholder="Классическое парение, массаж вениками..."
                  value={formData.specializations || ''}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Ссылки на портфолио (фото/видео)</Label>
                <Textarea
                  placeholder="https://... (по одной ссылке на строку)"
                  value={formData.portfolio || ''}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </>
          )}

          {selectedRole === 'partner' && (
            <>
              <div>
                <Label>Название бани</Label>
                <Input
                  placeholder="Баня у реки"
                  value={formData.sauna_name || ''}
                  onChange={(e) => setFormData({ ...formData, sauna_name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Адрес</Label>
                <Input
                  placeholder="Москва, ул. Примерная, д. 1"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Количество залов</Label>
                <Input
                  type="number"
                  placeholder="2"
                  value={formData.rooms || ''}
                  onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                  className="mt-2"
                />
              </div>
            </>
          )}

          {selectedRole === 'editor' && (
            <>
              <div>
                <Label>Опыт написания статей</Label>
                <Textarea
                  placeholder="Расскажите о вашем опыте..."
                  value={formData.writing_experience || ''}
                  onChange={(e) => setFormData({ ...formData, writing_experience: e.target.value })}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Ссылки на примеры работ (необязательно)</Label>
                <Textarea
                  placeholder="https://... (по одной ссылке на строку)"
                  value={formData.samples || ''}
                  onChange={(e) => setFormData({ ...formData, samples: e.target.value })}
                  rows={3}
                  className="mt-2"
                />
              </div>
            </>
          )}

          <div className="pt-4 border-t border-gray-200">
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Отправка...' : 'Отправить заявку'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getRoleIcon(roleType: RoleType): string {
  const icons: Record<RoleType, string> = {
    organizer: 'Calendar',
    master: 'Award',
    partner: 'Store',
    editor: 'FileText',
  };
  return icons[roleType];
}
