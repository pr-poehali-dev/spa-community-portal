import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RoleSwitcher from '@/components/RoleSwitcher';
import { type RoleType } from '@/types/roles';
import ParticipantDashboard from './dashboard/ParticipantDashboard';
import MasterDashboard from './dashboard/MasterDashboard';
import OrganizerDashboard from './dashboard/OrganizerDashboard';

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
          {currentRole === null && <ParticipantDashboard />}
          {currentRole === 'organizer' && <OrganizerDashboard />}
          {currentRole === 'master' && <MasterDashboard />}
          {currentRole === 'partner' && (
            <div className="text-center py-12 text-gray-500">
              Кабинет партнёра в разработке
            </div>
          )}
          {currentRole === 'editor' && (
            <div className="text-center py-12 text-gray-500">
              Кабинет редактора в разработке
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
