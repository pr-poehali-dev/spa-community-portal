import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/adminApi';
import { ROLE_LABELS, type RoleApplication } from '@/types/roles';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const AdminRoleApplicationsPage = () => {
  const { toast } = useToast();
  const [applications, setApplications] = useState<RoleApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<RoleApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await adminApi.roles.getApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заявки',
        variant: 'destructive',
      });
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!selectedApp || !reviewAction) return;

    try {
      await adminApi.roles.reviewApplication(selectedApp.id, {
        reviewer_id: 1,
        status: reviewAction,
        notes: reviewNotes,
      });

      toast({
        title: reviewAction === 'approved' ? 'Заявка одобрена' : 'Заявка отклонена',
        description: 'Статус заявки обновлён',
      });

      setSelectedApp(null);
      setReviewNotes('');
      setReviewAction(null);
      loadApplications();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить заявку',
        variant: 'destructive',
      });
    }
  };

  const pendingApps = applications.filter((a) => a.status === 'pending');
  const reviewedApps = applications.filter((a) => a.status !== 'pending');

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  if (applications.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-orange-900">Заявки на роли</h2>
        <div className="text-center py-12">
          <Icon name="Inbox" className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">Заявок пока нет</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-900">Заявки на роли</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-yellow-50">
            <Icon name="Clock" className="h-3 w-3 mr-1" />
            На рассмотрении: {pendingApps.length}
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            <Icon name="CheckCircle" className="h-3 w-3 mr-1" />
            Рассмотрено: {reviewedApps.length}
          </Badge>
        </div>
      </div>

      {pendingApps.length > 0 && (
        <>
          <h3 className="text-xl font-semibold text-orange-800">На рассмотрении</h3>
          <div className="grid grid-cols-1 gap-4">
            {pendingApps.map((app) => (
              <Card key={app.id} className="border-orange-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-600">
                          {ROLE_LABELS[app.role_type]}
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                          <Icon name="Clock" className="h-3 w-3 mr-1" />
                          Ожидает проверки
                        </Badge>
                      </div>

                      <div className="space-y-2 text-gray-600 mb-4">
                        {app.name && (
                          <div className="flex items-center gap-2">
                            <Icon name="User" className="h-4 w-4" />
                            <span className="font-medium">{app.name}</span>
                          </div>
                        )}
                        {app.email && (
                          <div className="flex items-center gap-2">
                            <Icon name="Mail" className="h-4 w-4" />
                            <span>{app.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Icon name="Calendar" className="h-4 w-4" />
                          <span>Дата подачи: {new Date(app.created_at).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>

                      {app.application_data && Object.keys(app.application_data).length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Данные заявки:</p>
                          <div className="space-y-1 text-sm text-gray-600">
                            {Object.entries(app.application_data).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{formatFieldName(key)}:</span>{' '}
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setSelectedApp(app);
                          setReviewAction('approved');
                        }}
                      >
                        <Icon name="Check" className="h-4 w-4 mr-1" />
                        Одобрить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setSelectedApp(app);
                          setReviewAction('rejected');
                        }}
                      >
                        <Icon name="X" className="h-4 w-4 mr-1" />
                        Отклонить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {reviewedApps.length > 0 && (
        <>
          <h3 className="text-xl font-semibold text-orange-800 mt-8">История рассмотрения</h3>
          <div className="grid grid-cols-1 gap-4">
            {reviewedApps.map((app) => (
              <Card key={app.id} className="border-gray-200 shadow-sm opacity-75">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline">{ROLE_LABELS[app.role_type]}</Badge>
                        <Badge
                          variant="outline"
                          className={
                            app.status === 'approved'
                              ? 'bg-green-50 text-green-700 border-green-300'
                              : 'bg-red-50 text-red-700 border-red-300'
                          }
                        >
                          <Icon
                            name={app.status === 'approved' ? 'CheckCircle' : 'XCircle'}
                            className="h-3 w-3 mr-1"
                          />
                          {app.status === 'approved' ? 'Одобрена' : 'Отклонена'}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-gray-600 text-sm">
                        {app.name && <div className="font-medium">{app.name}</div>}
                        {app.email && <div>{app.email}</div>}
                        <div>Рассмотрел: {app.reviewer_name || 'Администратор'}</div>
                        {app.reviewer_notes && (
                          <div className="bg-gray-50 rounded p-2 mt-2">
                            <span className="font-medium">Комментарий:</span> {app.reviewer_notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {applications.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Icon name="Inbox" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>Пока нет заявок на роли</p>
        </div>
      )}

      <Dialog open={selectedApp !== null} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approved' ? 'Одобрить заявку' : 'Отклонить заявку'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Вы собираетесь{' '}
                <span className="font-bold">
                  {reviewAction === 'approved' ? 'одобрить' : 'отклонить'}
                </span>{' '}
                заявку на роль <span className="font-bold">{selectedApp && ROLE_LABELS[selectedApp.role_type]}</span>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Комментарий {reviewAction === 'rejected' ? '(обязательно)' : '(необязательно)'}
              </label>
              <Textarea
                placeholder="Добавьте комментарий к решению..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)}>
              Отмена
            </Button>
            <Button
              className={
                reviewAction === 'approved'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
              onClick={handleReview}
              disabled={reviewAction === 'rejected' && !reviewNotes.trim()}
            >
              {reviewAction === 'approved' ? 'Одобрить' : 'Отклонить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function formatFieldName(key: string): string {
  const names: Record<string, string> = {
    motivation: 'Мотивация',
    formats: 'Форматы',
    experience: 'Опыт',
    specializations: 'Специализации',
    portfolio: 'Портфолио',
    sauna_name: 'Название бани',
    address: 'Адрес',
    rooms: 'Количество залов',
    writing_experience: 'Опыт написания',
    samples: 'Примеры работ',
  };
  return names[key] || key;
}

export default AdminRoleApplicationsPage;