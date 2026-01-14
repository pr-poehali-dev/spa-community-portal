import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuSections = [
    {
      title: 'Управление контентом',
      items: [
        { name: 'События', path: '/admin/events', icon: 'Calendar' },
        { name: 'Бани', path: '/admin/saunas', icon: 'Home' },
        { name: 'Мастера', path: '/admin/masters', icon: 'Users' },
        { name: 'Блог', path: '/admin/blog', icon: 'FileText' },
      ]
    },
    {
      title: 'Пользователи',
      items: [
        { name: 'Участники', path: '/admin/users', icon: 'User' },
        { name: 'Заявки на роли', path: '/admin/role-applications', icon: 'UserPlus' },
        { name: 'Партнеры', path: '/admin/partners', icon: 'Briefcase' },
        { name: 'Администраторы', path: '/admin/admins', icon: 'Shield' },
      ]
    },
    {
      title: 'Финансы',
      items: [
        { name: 'Транзакции', path: '/admin/transactions', icon: 'CreditCard' },
        { name: 'Выплаты', path: '/admin/payouts', icon: 'DollarSign' },
        { name: 'Отчетность', path: '/admin/reports', icon: 'BarChart3' },
        { name: 'Комиссии', path: '/admin/commissions', icon: 'Percent' },
      ]
    },
    {
      title: 'Бронирования',
      items: [
        { name: 'Все записи', path: '/admin/bookings', icon: 'ClipboardList' },
        { name: 'Конфликты', path: '/admin/conflicts', icon: 'AlertTriangle' },
      ]
    },
    {
      title: 'Система',
      items: [
        { name: 'Настройки', path: '/admin/settings', icon: 'Settings' },
        { name: 'Аналитика', path: '/admin/analytics', icon: 'TrendingUp' },
        { name: 'Логи', path: '/admin/logs', icon: 'FileCode' },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="flex">
        <aside className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-orange-100 transition-all duration-300 z-40",
          sidebarOpen ? "w-64" : "w-16"
        )}>
          <div className="flex items-center justify-between p-4 border-b border-orange-100">
            {sidebarOpen && (
              <Link to="/admin" className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                  <Icon name="Shield" className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-orange-900">Админ</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-orange-50"
            >
              <Icon name={sidebarOpen ? "PanelLeftClose" : "PanelLeftOpen"} className="h-5 w-5" />
            </Button>
          </div>

          <nav className="p-2 overflow-y-auto h-[calc(100vh-64px)]">
            {menuSections.map((section) => (
              <div key={section.title} className="mb-6">
                {sidebarOpen && (
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                    {section.title}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isActive(item.path)
                          ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                          : "text-gray-700 hover:bg-orange-50"
                      )}
                      title={!sidebarOpen ? item.name : undefined}
                    >
                      <Icon name={item.icon} className="h-5 w-5 flex-shrink-0" />
                      {sidebarOpen && <span className="font-medium">{item.name}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <div className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}>
          <header className="bg-white border-b border-orange-100 px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-orange-900">
                Административная панель
              </h1>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="border-orange-200 hover:bg-orange-50"
                >
                  <Icon name="ExternalLink" className="h-4 w-4 mr-2" />
                  На сайт
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="border-orange-200 hover:bg-orange-50"
                >
                  <Icon name="User" className="h-4 w-4 mr-2" />
                  Профиль
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            {location.pathname === '/admin' ? (
              <div className="space-y-6">
                <Card className="border-orange-100 shadow-sm">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <Icon name="Users" className="h-8 w-8 opacity-80" />
                          <span className="text-3xl font-bold">1,234</span>
                        </div>
                        <p className="text-orange-100">Пользователей</p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <Icon name="Calendar" className="h-8 w-8 opacity-80" />
                          <span className="text-3xl font-bold">42</span>
                        </div>
                        <p className="text-blue-100">Событий</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <Icon name="DollarSign" className="h-8 w-8 opacity-80" />
                          <span className="text-3xl font-bold">₽89k</span>
                        </div>
                        <p className="text-green-100">Доход за месяц</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <Icon name="ClipboardList" className="h-8 w-8 opacity-80" />
                          <span className="text-3xl font-bold">156</span>
                        </div>
                        <p className="text-purple-100">Бронирований</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-orange-100 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                        <Icon name="TrendingUp" className="h-5 w-5" />
                        Быстрые действия
                      </h3>
                      <div className="space-y-2">
                        <Button
                          className="w-full justify-start bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                          onClick={() => navigate('/admin/events')}
                        >
                          <Icon name="Plus" className="h-4 w-4 mr-2" />
                          Создать событие
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigate('/admin/masters')}
                        >
                          <Icon name="UserCheck" className="h-4 w-4 mr-2" />
                          Верифицировать мастера
                        </Button>
                        <Button
                          className="w-full justify-start"
                          variant="outline"
                          onClick={() => navigate('/admin/saunas')}
                        >
                          <Icon name="CheckCircle" className="h-4 w-4 mr-2" />
                          Модерация бань
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-100 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                        <Icon name="Bell" className="h-5 w-5" />
                        Требует внимания
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                          <Icon name="AlertTriangle" className="h-5 w-5 text-red-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">3 конфликта бронирований</p>
                            <p className="text-sm text-gray-600">Требуется решение</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                          <Icon name="Clock" className="h-5 w-5 text-yellow-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">5 заявок на верификацию</p>
                            <p className="text-sm text-gray-600">Мастера ожидают одобрения</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Icon name="DollarSign" className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">12 выплат в обработке</p>
                            <p className="text-sm text-gray-600">На общую сумму ₽45,600</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;