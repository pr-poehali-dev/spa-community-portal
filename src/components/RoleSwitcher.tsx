import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { 
  ROLE_LABELS, 
  ROLE_DESCRIPTIONS, 
  REPUTATION_LEVELS, 
  type UserRole, 
  type UserReputation,
  type RoleType 
} from '@/types/roles';

interface RoleSwitcherProps {
  userId: number;
  currentRole?: RoleType;
  onRoleChange: (role: RoleType | null) => void;
}

export default function RoleSwitcher({ userId, currentRole, onRoleChange }: RoleSwitcherProps) {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRoles();
  }, [userId]);

  const loadUserRoles = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/b6fbba96-cc0b-4f59-b94d-e60ab18fe1b0?resource=roles&user_id=${userId}`
      );
      const data = await response.json();
      setRoles(data.roles || []);
      setReputation(data.reputation);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeRoles = roles.filter(r => r.status === 'active');
  const reputationLevel = reputation?.level || 'newcomer';
  const reputationData = REPUTATION_LEVELS[reputationLevel];

  if (loading) {
    return <div className="text-center py-4">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      {reputation && (
        <Card className="border-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                  {reputation.total_score}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-900">{reputationData.label}</span>
                    <Badge 
                      variant="outline" 
                      className={`bg-${reputationData.color}-100 text-${reputationData.color}-700 border-${reputationData.color}-300`}
                    >
                      {reputation.total_score} баллов
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-4">
                    <span><Icon name="Calendar" className="h-3 w-3 inline mr-1" />{reputation.events_attended} событий</span>
                    <span><Icon name="Users" className="h-3 w-3 inline mr-1" />{reputation.events_organized} организовано</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Мои роли</h3>
        
        <Button
          variant={currentRole === null ? 'default' : 'outline'}
          className="w-full justify-start"
          onClick={() => onRoleChange(null)}
        >
          <Icon name="User" className="h-4 w-4 mr-2" />
          Участник (основной профиль)
        </Button>

        {activeRoles.length === 0 && (
          <Card className="border-dashed border-orange-200">
            <CardContent className="p-4 text-center text-gray-500 text-sm">
              <Icon name="Info" className="h-5 w-5 mx-auto mb-2" />
              У вас пока нет дополнительных ролей.
              <br />
              Подайте заявку, чтобы стать организатором или мастером!
            </CardContent>
          </Card>
        )}

        {activeRoles.map((role) => (
          <Button
            key={role.id}
            variant={currentRole === role.role_type ? 'default' : 'outline'}
            className="w-full justify-start"
            onClick={() => onRoleChange(role.role_type)}
          >
            <Icon 
              name={getRoleIcon(role.role_type)} 
              className="h-4 w-4 mr-2" 
            />
            {ROLE_LABELS[role.role_type]}
            {role.level_data && (
              <Badge variant="secondary" className="ml-auto">
                {getLevelLabel(role.role_type, role.level_data)}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <Button 
          variant="outline" 
          className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50"
          onClick={() => window.location.href = '/account/apply-role'}
        >
          <Icon name="Plus" className="h-4 w-4 mr-2" />
          Получить новую роль
        </Button>
      </div>
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

function getLevelLabel(roleType: RoleType, levelData: any): string {
  if (!levelData) return '';
  
  if (roleType === 'organizer' && levelData.level) {
    const levels = { novice: 'Новичок', experienced: 'Опытный', leading: 'Ведущий' };
    return levels[levelData.level as keyof typeof levels] || '';
  }
  
  if (roleType === 'master' && levelData.level) {
    const levels = { apprentice: 'Подмастерье', master: 'Мастер', mentor: 'Наставник' };
    return levels[levelData.level as keyof typeof levels] || '';
  }
  
  if (roleType === 'editor' && levelData.level) {
    const levels = { 
      proofreader: 'Корректор', 
      author: 'Автор', 
      section_editor: 'Редактор', 
      chief_editor: 'Главред' 
    };
    return levels[levelData.level as keyof typeof levels] || '';
  }
  
  return '';
}
