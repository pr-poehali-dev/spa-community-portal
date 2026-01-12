import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/adminApi';

interface Master {
  id: number;
  slug: string;
  name: string;
  specialization: string;
  experience: number;
  description: string;
  avatar_url?: string;
  rating: number;
  reviews_count: number;
  services?: any[];
}

const AdminMastersPage = () => {
  const { toast } = useToast();
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMasters();
  }, []);

  const loadMasters = async () => {
    try {
      const data = await adminApi.masters.getAll();
      setMasters(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить мастеров',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого мастера?')) return;
    
    try {
      await adminApi.masters.delete(id);
      toast({
        title: 'Мастер удален',
        description: 'Профиль мастера успешно удален',
      });
      loadMasters();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить мастера',
        variant: 'destructive',
      });
    }
  };

  const filteredMasters = masters.filter((master) =>
    master.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    master.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-orange-900">Управление мастерами</h2>
        <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700">
          <Icon name="Plus" className="h-4 w-4 mr-2" />
          Добавить мастера
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Поиск по имени или специализации..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredMasters.map((master) => (
          <Card key={master.id} className="border-orange-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={master.avatar_url} alt={master.name} />
                  <AvatarFallback className="bg-orange-100 text-orange-700">
                    {master.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-orange-900">{master.name}</h3>
                    <Badge variant="default">Верифицирован</Badge>
                  </div>
                  
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Icon name="Briefcase" className="h-4 w-4" />
                      <span>{master.specialization}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Award" className="h-4 w-4" />
                      <span>Опыт: {master.experience} лет</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Star" className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span>{master.rating.toFixed(1)} ({master.reviews_count} отзывов)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => window.open(`/masters/${master.slug}`, '_blank')}
                  >
                    <Icon name="Eye" className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(master.id)}
                  >
                    <Icon name="Trash2" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMasters.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Мастера не найдены
        </div>
      )}
    </div>
  );
};

export default AdminMastersPage;
