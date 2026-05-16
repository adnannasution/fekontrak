
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserX } from 'lucide-react';
import { UserProfile } from '../types';

interface UserRoleSummaryCardsProps {
  users: UserProfile[];
}

export const UserRoleSummaryCards = ({ users }: UserRoleSummaryCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-4 animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Admin</CardTitle>
          <User className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold animate-count-up">
            {users.filter(user => user.role === 'admin').length}
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">PIC</CardTitle>
          <User className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold animate-count-up" style={{ animationDelay: '0.1s' }}>
            {users.filter(user => user.role === 'pic').length}
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Viewer</CardTitle>
          <User className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold animate-count-up" style={{ animationDelay: '0.2s' }}>
            {users.filter(user => user.role === 'viewer').length}
          </div>
        </CardContent>
      </Card>
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tidak Aktif</CardTitle>
          <UserX className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold animate-count-up text-red-600" style={{ animationDelay: '0.3s' }}>
            {users.filter(user => !user.is_active).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
