import { useAuth } from '@/hooks/useAuth';

/**
 * Role matrix:
 * Admin  → canCreate, canEdit, canDelete, semua menu
 * PIC    → canCreate, canEdit, NO delete, NO user management, NO vendor CRUD
 * Viewer → hanya lihat, tidak bisa apa-apa
 * Vendor → hanya lihat kontrak milik sendiri
 */
export const usePermissions = () => {
  const { userProfile } = useAuth();
  const role = userProfile?.role ?? 'viewer';

  console.log('🔐 userProfile:', userProfile);
  console.log('🔐 role:', role);

  const isAdmin  = role === 'admin';
  const isPic    = role === 'pic';
  const isViewer = role === 'viewer' || role === 'user';
  const isVendor = role === 'vendor';

  return {
    role,
    isAdmin,
    isPic,
    isViewer,
    isVendor,

    // Data operations
    canCreate : isAdmin || isPic,
    canEdit   : isAdmin || isPic,
    canDelete : isAdmin,

    // Module access
    canManageUsers   : isAdmin,
    canManageVendors : isAdmin,
    canUploadDokumen : isAdmin || isPic,
    canApprovalDokumen: isAdmin || isPic,

    // Vendor-specific
    vendorId: userProfile?.id_vendor ?? null,
  };
};