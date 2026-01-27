import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([
    {
      id: 'TRX-001',
      user: 'Дмитрий Смирнов',
      type: 'booking',
      amount: 2500,
      status: 'completed',
      date: '2026-01-12',
      sauna: 'Русская баня на дровах',
    },
    {
      id: 'TRX-002',
      user: 'Елена Волкова',
      type: 'master',
      amount: 1500,
      status: 'completed',
      date: '2026-01-11',
      master: 'Иван Петров',
    },
    {
      id: 'TRX-003',
      user: 'Андрей Козлов',
      type: 'booking',
      amount: 3200,
      status: 'pending',
      date: '2026-01-10',
      sauna: 'Финская сауна Premium',
    },
    {
      id: 'TRX-004',
      user: 'Мария Новикова',
      type: 'refund',
      amount: -1800,
      status: 'completed',
      date: '2026-01-09',
      sauna: 'Турецкий хаммам',
    },
  ]);

  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Завершено', variant: 'default' as const },
      pending: { label: 'В обработке', variant: 'secondary' as const },
      failed: { label: 'Ошибка', variant: 'destructive' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      booking: { label: 'Бронирование', icon: 'Calendar' },
      master: { label: 'Мастер', icon: 'User' },
      refund: { label: 'Возврат', icon: 'RotateCcw' },
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <div className="flex items-center gap-1">
        <Icon name={config.icon} className="h-3 w-3" />
        <span>{config.label}</span>
      </div>
    );
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const totalRevenue = transactions
    .filter(tx => tx.status === 'completed' && tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalRefunds = Math.abs(transactions
    .filter(tx => tx.status === 'completed' && tx.amount < 0)
    .reduce((sum, tx) => sum + tx.amount, 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-900">Транзакции</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="TrendingUp" className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Всего доход</p>
                <p className="text-2xl font-bold text-green-600">₽{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Icon name="TrendingDown" className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Возвраты</p>
                <p className="text-2xl font-bold text-red-600">₽{totalRefunds.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="CreditCard" className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Транзакций</p>
                <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Поиск по ID или пользователю..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="booking">Бронирования</SelectItem>
            <SelectItem value="master">Мастера</SelectItem>
            <SelectItem value="refund">Возвраты</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="completed">Завершено</SelectItem>
            <SelectItem value="pending">В обработке</SelectItem>
            <SelectItem value="failed">Ошибка</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Icon name="Download" className="h-4 w-4 mr-2" />
          Экспорт
        </Button>
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((tx) => (
          <Card key={tx.id} className="border-orange-100 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Icon
                      name={tx.amount > 0 ? 'ArrowDownLeft' : 'ArrowUpRight'}
                      className={`h-6 w-6 ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{tx.id}</span>
                      {getStatusBadge(tx.status)}
                      <Badge variant="outline">{getTypeBadge(tx.type)}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{tx.user}</p>
                    <p className="text-xs text-gray-500">
                      {tx.sauna || tx.master} • {new Date(tx.date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-2xl font-bold ${
                    tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}₽{Math.abs(tx.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
