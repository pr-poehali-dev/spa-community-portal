import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminAnalyticsPage = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [period]);

  const userGrowthData = [
    { date: '01.01', users: 45, registrations: 12 },
    { date: '05.01', users: 58, registrations: 13 },
    { date: '10.01', users: 73, registrations: 15 },
    { date: '15.01', users: 89, registrations: 16 },
    { date: '20.01', users: 104, registrations: 15 },
    { date: '25.01', users: 121, registrations: 17 },
    { date: '30.01', users: 143, registrations: 22 },
  ];

  const revenueData = [
    { date: '01.01', revenue: 15000, bookings: 8 },
    { date: '05.01', revenue: 22000, bookings: 12 },
    { date: '10.01', revenue: 28000, bookings: 15 },
    { date: '15.01', revenue: 35000, bookings: 18 },
    { date: '20.01', revenue: 41000, bookings: 21 },
    { date: '25.01', revenue: 53000, bookings: 27 },
    { date: '30.01', revenue: 67000, bookings: 34 },
  ];

  const eventTypesData = [
    { name: 'Баня с мастером', value: 45, color: '#f97316' },
    { name: 'Свободная аренда', value: 30, color: '#3b82f6' },
    { name: 'Банные ритуалы', value: 15, color: '#10b981' },
    { name: 'Корпоративы', value: 10, color: '#8b5cf6' },
  ];

  const topBathsData = [
    { name: 'Сандуны', bookings: 34, revenue: 89000 },
    { name: 'На Мосфильмовской', bookings: 28, revenue: 72000 },
    { name: 'Селезнёвские', bookings: 21, revenue: 54000 },
    { name: 'Воронцовские', bookings: 18, revenue: 45000 },
    { name: 'Астраханские', bookings: 15, revenue: 38000 },
  ];

  const topMastersData = [
    { name: 'Иван Петров', sessions: 28, rating: 4.9, revenue: 56000 },
    { name: 'Мария Сидорова', sessions: 24, rating: 4.8, revenue: 48000 },
    { name: 'Алексей Козлов', sessions: 19, rating: 4.7, revenue: 38000 },
    { name: 'Ольга Новикова', sessions: 16, rating: 4.9, revenue: 32000 },
    { name: 'Дмитрий Смирнов', sessions: 14, rating: 4.6, revenue: 28000 },
  ];

  const stats = [
    {
      title: 'Активные пользователи',
      value: '143',
      change: '+22%',
      trend: 'up',
      icon: 'Users',
      color: 'from-orange-500 to-amber-600'
    },
    {
      title: 'Выручка за период',
      value: '₽67,000',
      change: '+15%',
      trend: 'up',
      icon: 'DollarSign',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Всего бронирований',
      value: '156',
      change: '+18%',
      trend: 'up',
      icon: 'ClipboardList',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Средний чек',
      value: '₽1,970',
      change: '+3%',
      trend: 'up',
      icon: 'TrendingUp',
      color: 'from-purple-500 to-purple-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Icon name="Loader2" className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-2" />
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-900">Аналитика</h1>
          <p className="text-muted-foreground mt-1">Статистика и метрики платформы</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(value: 'week' | 'month' | 'year') => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
              <SelectItem value="year">Год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Icon name="Download" className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon name={stat.icon} className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <Icon name={stat.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} className="h-3 w-3" />
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" className="h-5 w-5 text-orange-500" />
              Рост пользователей
            </CardTitle>
            <CardDescription>Динамика регистраций и активности</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#f97316" strokeWidth={2} name="Всего пользователей" />
                <Line type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={2} name="Новые регистрации" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="DollarSign" className="h-5 w-5 text-green-500" />
              Выручка
            </CardTitle>
            <CardDescription>Динамика доходов и бронирований</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Выручка (₽)" />
                <Bar dataKey="bookings" fill="#3b82f6" name="Бронирования" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="PieChart" className="h-5 w-5 text-purple-500" />
              Типы мероприятий
            </CardTitle>
            <CardDescription>Распределение по категориям</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-orange-100 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Home" className="h-5 w-5 text-orange-500" />
              Топ бань
            </CardTitle>
            <CardDescription>По количеству бронирований и выручке</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topBathsData.map((bath, index) => (
                <div key={bath.name} className="flex items-center gap-4 p-3 rounded-lg border border-orange-100 hover:bg-orange-50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{bath.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" className="h-3 w-3" />
                        {bath.bookings} бронирований
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="DollarSign" className="h-3 w-3" />
                        ₽{bath.revenue.toLocaleString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Award" className="h-5 w-5 text-purple-500" />
            Топ мастеров
          </CardTitle>
          <CardDescription>Рейтинг по проведённым сеансам и выручке</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-orange-100">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Мастер</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Сеансы</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Рейтинг</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Выручка</th>
                </tr>
              </thead>
              <tbody>
                {topMastersData.map((master, index) => (
                  <tr key={master.name} className="border-b border-orange-50 hover:bg-orange-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{master.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{master.sessions}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Icon name="Star" className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium text-gray-900">{master.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      ₽{master.revenue.toLocaleString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsPage;
