
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserX } from 'lucide-react';
import { UserProfile } from '../types';
import { usePermissions } from '@/hooks/usePermissions';
import { CONFIGURABLE_ROLES, resolveConfigurableRole } from '@/hooks/useRolePermissionsConfig';

interface UserRoleSummaryCardsProps {
  users: UserProfile[];
}

const ROLE_ICON_COLORS: Record<string, string> = {
  admin: 'text-red-500',
  manager: 'text-blue-500',
  section_head: 'text-indigo-500',
  supervisor: 'text-teal-500',
  technician: 'text-cyan-500',
  external: 'text-orange-500',
  guest: 'text-purple-500',
};

export const UserRoleSummaryCards = ({ users }: UserRoleSummaryCardsProps) => {
  const { roleLabels } = usePermissions();

  const roleKeys: Array<'admin' | typeof CONFIGURABLE_ROLES[number]> = ['admin', ...CONFIGURABLE_ROLES];

  const countForRole = (role: string) =>
    users.filter((user) => (user.role === 'admin' ? 'admin' : resolveConfigurableRole(user.role)) === role).length;

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
      {roleKeys.map((role, idx) => (
        <Card key={role} className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{roleLabels[role]}</CardTitle>
            <User className={`h-4 w-4 ${ROLE_ICON_COLORS[role] ?? 'text-gray-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold animate-count-up" style={{ animationDelay: `${0.1 * idx}s` }}>
              {countForRole(role)}
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tidak Aktif</CardTitle>
          <UserX className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold animate-count-up text-red-600" style={{ animationDelay: `${0.1 * roleKeys.length}s` }}>
            {users.filter(user => !user.is_active).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
