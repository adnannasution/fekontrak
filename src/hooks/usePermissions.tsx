import { useAuth } from '@/hooks/useAuth';
import { useRolePermissionsConfig, ConfigurableRole } from '@/hooks/useRolePermissionsConfig';

/**
 * Role matrix bawaan (lihat src/hooks/useRolePermissionsConfig.tsx untuk default
 * dan halaman /role-settings untuk mengubahnya):
 * Admin  → canCreate, canEdit, canDelete, semua menu (tidak bisa diubah)
 * PIC    → canCreate, canEdit, NO delete, NO user management, NO vendor CRUD
 * Viewer → hanya lihat, tidak bisa apa-apa
 * Vendor → hanya lihat kontrak milik sendiri
 */
export const usePermissions = () => {
  const { userProfile } = useAuth();
  const { matrix } = useRolePermissionsConfig();
  const role = userProfile?.role ?? 'viewer';

  const isAdmin  = role === 'admin';
  const isPic    = role === 'pic';
  const isViewer = role === 'viewer' || role === 'user';
  const isVendor = role === 'vendor';

  const configurableRole: ConfigurableRole | null = isPic
    ? 'pic'
    : isVendor
    ? 'vendor'
    : isViewer
    ? 'viewer'
    : null;

  const flags = isAdmin
    ? {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManageUsers: true,
        canManageVendors: true,
        canUploadDokumen: true,
        canApprovalDokumen: true,
      }
    : configurableRole
    ? matrix[configurableRole]
    : matrix.viewer;

  return {
    role,
    isAdmin,
    isPic,
    isViewer,
    isVendor,

    // Data operations
    canCreate : flags.canCreate,
    canEdit   : flags.canEdit,
    canDelete : flags.canDelete,

    // Module access
    canManageUsers   : flags.canManageUsers,
    canManageVendors : flags.canManageVendors,
    canUploadDokumen : flags.canUploadDokumen,
    canApprovalDokumen: flags.canApprovalDokumen,

    // Vendor-specific
    vendorId: userProfile?.id_vendor ?? null,
  };
};