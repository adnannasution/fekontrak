import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useKonfigurasiSistem, useUpdateKonfigurasi } from '@/hooks/useKonfigurasiSistem';
import { useToast } from '@/hooks/use-toast';

export type ConfigurableRole = 'pic' | 'viewer' | 'vendor';

export interface RolePermissionFlags {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canManageVendors: boolean;
  canUploadDokumen: boolean;
  canApprovalDokumen: boolean;
}

export type RolePermissionMatrix = Record<ConfigurableRole, RolePermissionFlags>;

export const PERMISSION_LABELS: Record<keyof RolePermissionFlags, string> = {
  canCreate: 'Tambah Data',
  canEdit: 'Ubah Data',
  canDelete: 'Hapus Data',
  canManageUsers: 'Kelola Pengguna',
  canManageVendors: 'Kelola Vendor',
  canUploadDokumen: 'Upload Dokumen',
  canApprovalDokumen: 'Approval Dokumen',
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMatrix = {
  pic: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canManageVendors: false,
    canUploadDokumen: true,
    canApprovalDokumen: true,
  },
  viewer: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canManageVendors: false,
    canUploadDokumen: false,
    canApprovalDokumen: false,
  },
  vendor: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canManageVendors: false,
    canUploadDokumen: false,
    canApprovalDokumen: false,
  },
};

const CONFIG_SETTING_NAME = 'Role_Permission_Matrix';
const LOCAL_STORAGE_KEY = 'fekontrak_role_permission_matrix';

interface KonfigurasiItem {
  id_setting: string;
  nama_setting: string;
  nilai_setting: string;
  deskripsi?: string;
  updated_at?: string;
}

const readLocalOverride = (): RolePermissionMatrix | null => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Pengaturan role disimpan terpusat lewat endpoint /konfigurasi (nama_setting =
 * "Role_Permission_Matrix") jika baris itu sudah ada di backend. Jika belum ada
 * (backend belum di-seed), fallback ke localStorage di perangkat ini saja.
 */
export const useRolePermissionsConfig = () => {
  const { konfigurasi = [], isLoading } = useKonfigurasiSistem();

  const remoteConfig = (konfigurasi as KonfigurasiItem[]).find(
    (c) => c.nama_setting === CONFIG_SETTING_NAME
  );

  const matrix = useMemo<RolePermissionMatrix>(() => {
    if (remoteConfig?.nilai_setting) {
      try {
        return { ...DEFAULT_ROLE_PERMISSIONS, ...JSON.parse(remoteConfig.nilai_setting) };
      } catch {
        // ignore malformed remote value, fall through to local/default
      }
    }
    const local = readLocalOverride();
    if (local) return { ...DEFAULT_ROLE_PERMISSIONS, ...local };
    return DEFAULT_ROLE_PERMISSIONS;
  }, [remoteConfig]);

  return {
    matrix,
    isLoading,
    isSyncedRemotely: Boolean(remoteConfig),
  };
};

export const useUpdateRolePermissions = () => {
  const { konfigurasi = [] } = useKonfigurasiSistem();
  const updateKonfigurasi = useUpdateKonfigurasi();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const remoteConfig = (konfigurasi as KonfigurasiItem[]).find(
    (c) => c.nama_setting === CONFIG_SETTING_NAME
  );

  const save = async (matrix: RolePermissionMatrix) => {
    const value = JSON.stringify(matrix);

    if (remoteConfig) {
      await updateKonfigurasi.mutateAsync({ id: remoteConfig.id_setting, nilai_setting: value });
      return;
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, value);
    queryClient.invalidateQueries({ queryKey: ['konfigurasi'] });
    toast({
      title: 'Disimpan secara lokal',
      description:
        'Backend belum memiliki baris konfigurasi "Role_Permission_Matrix", jadi perubahan hanya tersimpan di perangkat ini.',
    });
  };

  return { save, isPending: updateKonfigurasi.isPending };
};
