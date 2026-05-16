
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { UserProfile } from '../types';

interface UserTableRowProps {
  user: UserProfile;
  index: number;
  isAdmin: boolean;
  currentUserId?: string;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
  onEdit: (user: UserProfile) => void;
  onDelete: (user: UserProfile) => void;
}

export const UserTableRow = ({ 
  user, 
  index, 
  isAdmin, 
  currentUserId, 
  onToggleStatus, 
  onEdit, 
  onDelete 
}: UserTableRowProps) => {
  const getRoleBadge = (role: string) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'pic': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'viewer': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    } as const;

    const labels = {
      'admin': 'Admin',
      'pic': 'PIC',
      'viewer': 'Viewer'
    };

    return (
      <Badge className={colors[role as keyof typeof colors]}>
        {labels[role as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <UserCheck className="w-3 h-3 mr-1" />
          Aktif
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <UserX className="w-3 h-3 mr-1" />
          Tidak Aktif
        </Badge>
      );
    }
  };

  return (
    <TableRow className="animate-fade-in-scale" style={{ animationDelay: `${0.1 * index}s` }}>
      <TableCell className="font-medium">{user.full_name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{getRoleBadge(user.role)}</TableCell>
      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
      <TableCell>{user.company_name || '-'}</TableCell>
      {isAdmin && (
        <TableCell>
          <Switch
            checked={user.is_active}
            onCheckedChange={() => onToggleStatus(user.id, user.is_active)}
            disabled={user.id === currentUserId}
          />
        </TableCell>
      )}
      {isAdmin && (
        <TableCell>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(user)}
              disabled={user.id === currentUserId}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(user)}
              disabled={user.id === currentUserId}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};
