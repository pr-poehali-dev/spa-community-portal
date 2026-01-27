import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const AdminSettingsPage = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: 'BathHub',
    siteDescription: 'Платформа для банной культуры',
    contactEmail: 'info@bathhub.ru',
    contactPhone: '+7 (999) 123-45-67',
    commission: 15,
    masterCommission: 20,
    emailNotifications: true,
    smsNotifications: false,
    autoApproval: false,
    maintenanceMode: false,
  });

  const handleSave = () => {
    toast({
      title: 'Настройки сохранены',
      description: 'Изменения применены успешно',
    });
  };

  const handleBackup = () => {
    toast({
      title: 'Резервная копия создана',
      description: 'Данные сохранены',
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-orange-900">Настройки системы</h2>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Общие</TabsTrigger>
          <TabsTrigger value="payments">Платежи</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="system">Система</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="border-orange-100 shadow-sm">
            <CardHeader>
              <CardTitle>Информация о сайте</CardTitle>
              <CardDescription>Основные данные платформы</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Название сайта</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="siteDescription">Описание</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email для связи</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Телефон</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 shadow-sm">
            <CardHeader>
              <CardTitle>SEO настройки</CardTitle>
              <CardDescription>Метаданные для поисковых систем</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  placeholder="BathHub - Платформа банной культуры"
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="Найдите лучшие бани, мастеров парения и события..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="metaKeywords">Ключевые слова</Label>
                <Input
                  id="metaKeywords"
                  placeholder="баня, сауна, парение, хаммам"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card className="border-orange-100 shadow-sm">
            <CardHeader>
              <CardTitle>Комиссии</CardTitle>
              <CardDescription>Процент от транзакций</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="commission">Комиссия с бронирований (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  value={settings.commission}
                  onChange={(e) => setSettings({ ...settings, commission: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="masterCommission">Комиссия с услуг мастеров (%)</Label>
                <Input
                  id="masterCommission"
                  type="number"
                  value={settings.masterCommission}
                  onChange={(e) => setSettings({ ...settings, masterCommission: Number(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 shadow-sm">
            <CardHeader>
              <CardTitle>Платежные системы</CardTitle>
              <CardDescription>Настройка интеграций</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stripeKey">Stripe API Key</Label>
                <Input
                  id="stripeKey"
                  type="password"
                  placeholder="sk_test_..."
                />
              </div>
              <div>
                <Label htmlFor="yookassaKey">ЮKassa Shop ID</Label>
                <Input
                  id="yookassaKey"
                  placeholder="123456"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-orange-100 shadow-sm">
            <CardHeader>
              <CardTitle>Уведомления пользователей</CardTitle>
              <CardDescription>Настройте каналы связи</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email уведомления</Label>
                  <p className="text-sm text-gray-600">Отправлять письма о бронированиях</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS уведомления</Label>
                  <p className="text-sm text-gray-600">Отправлять СМС напоминания</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 shadow-sm">
            <CardHeader>
              <CardTitle>SMTP настройки</CardTitle>
              <CardDescription>Сервер для отправки почты</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input id="smtpHost" placeholder="smtp.gmail.com" />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input id="smtpPort" placeholder="587" />
                </div>
              </div>
              <div>
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input id="smtpUser" type="email" />
              </div>
              <div>
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input id="smtpPassword" type="password" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card className="border-orange-100 shadow-sm">
            <CardHeader>
              <CardTitle>Режимы работы</CardTitle>
              <CardDescription>Управление доступом к платформе</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Автоматическое одобрение</Label>
                  <p className="text-sm text-gray-600">Мгновенная публикация новых объявлений</p>
                </div>
                <Switch
                  checked={settings.autoApproval}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoApproval: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-red-600">Режим обслуживания</Label>
                  <p className="text-sm text-gray-600">Сайт недоступен для обычных пользователей</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 shadow-sm">
            <CardHeader>
              <CardTitle>Резервное копирование</CardTitle>
              <CardDescription>Сохранение данных</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Последняя копия</p>
                  <p className="text-sm text-gray-600">12 января 2026, 03:00</p>
                </div>
                <Button onClick={handleBackup} variant="outline">
                  <Icon name="Download" className="h-4 w-4 mr-2" />
                  Создать копию
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-100 shadow-sm border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Опасная зона</CardTitle>
              <CardDescription>Необратимые действия</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                <Icon name="Trash2" className="h-4 w-4 mr-2" />
                Очистить все логи
              </Button>
              <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                <Icon name="AlertTriangle" className="h-4 w-4 mr-2" />
                Сбросить все настройки
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
        >
          <Icon name="Save" className="h-4 w-4 mr-2" />
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
