import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useKonfigurasiSistem, useUpdateKonfigurasi } from '@/hooks/useKonfigurasiSistem';
import { useToast } from '@/hooks/use-toast';

export type ConfigurableRole = 'pic' | 'viewer' | 'vendor';

export type RoleLabels = Record<ConfigurableRole, string>;

export const DEFAULT_ROLE_LABELS: RoleLabels = {
  pic: 'PIC',
  viewer: 'Viewer',
  vendor: 'Vendor',
};

export interface RolePermissionFlags {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canManageVendors: boolean;
  canUploadDokumen: boolean;
  canApprovalDokumen: boolean;
  visibleMenus: string[];
}

export type RolePermissionMatrix = Record<ConfigurableRole, RolePermissionFlags>;

export const PERMISSION_LABELS: Record<
  Exclude<keyof RolePermissionFlags, 'visibleMenus'>,
  string
> = {
  canCreate: 'Tambah Data',
  canEdit: 'Ubah Data',
  canDelete: 'Hapus Data',
  canManageUsers: 'Kelola Pengguna',
  canManageVendors: 'Kelola Vendor',
  canUploadDokumen: 'Upload Dokumen',
  canApprovalDokumen: 'Approval Dokumen',
};

/**
 * Menu yang aksesnya hanya dijaga oleh visibilitas sidebar (bukan oleh guard
 * khusus di halaman), sehingga aman dijadikan configurable per role. Menu
 * admin-only seperti Vendor, Pengguna, Manajemen Data, Pengaturan Admin, dan
 * Pengaturan Role sengaja TIDAK dimasukkan di sini - tetap selalu admin-only.
 */
export const CONFIGURABLE_MENU_ITEMS: { key: string; label: string; group: string }[] = [
  { key: 'dashboard', label: 'Executive Dashboard', group: 'Monitoring & Analytics' },
  { key: 'contract-performance', label: 'Performance Monitoring', group: 'Monitoring & Analytics' },
  { key: 'kontrak-lumpsum', label: 'Kontrak Lumpsum', group: 'Contract Management' },
  { key: 'kontrak-unit-price', label: 'Kontrak Unit Price', group: 'Contract Management' },
  { key: 'kontrak-tsa-ltsa', label: 'Kontrak TSA/LTSA', group: 'Contract Management' },
  { key: 'amandemen', label: 'Amandemen', group: 'Contract Management' },
  { key: 'invoices', label: 'Tagihan', group: 'Operations' },
  { key: 'user-purchase', label: 'User Purchase (PADI)', group: 'Operations' },
  { key: 'approval', label: 'Approval Dokumen', group: 'Operations' },
  { key: 'laporan-harian', label: 'Laporan Harian', group: 'Operations' },
];

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMatrix = {
  pic: {
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canManageVendors: false,
    canUploadDokumen: true,
    canApprovalDokumen: true,
    visibleMenus: CONFIGURABLE_MENU_ITEMS.map((m) => m.key),
  },
  viewer: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canManageVendors: false,
    canUploadDokumen: false,
    canApprovalDokumen: false,
    visibleMenus: CONFIGURABLE_MENU_ITEMS.map((m) => m.key),
  },
  vendor: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canManageVendors: false,
    canUploadDokumen: false,
    canApprovalDokumen: false,
    visibleMenus: ['kontrak-lumpsum', 'kontrak-unit-price', 'kontrak-tsa-ltsa'],
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

interface PersistedRoleConfig {
  matrix: Partial<RolePermissionMatrix>;
  labels: Partial<RoleLabels>;
}

/**
 * Sebelum fitur nama jenis akun ditambahkan, nilai yang disimpan adalah
 * RolePermissionMatrix secara langsung (tanpa pembungkus { matrix, labels }).
 * Deteksi bentuk lama itu supaya data yang sudah tersimpan tidak hilang.
 */
const normalizePersisted = (parsed: unknown): PersistedRoleConfig => {
  if (parsed && typeof parsed === 'object' && 'matrix' in (parsed as Record<string, unknown>)) {
    const obj = parsed as { matrix?: Partial<RolePermissionMatrix>; labels?: Partial<RoleLabels> };
    return { matrix: obj.matrix ?? {}, labels: obj.labels ?? {} };
  }
  return { matrix: (parsed as Partial<RolePermissionMatrix>) ?? {}, labels: {} };
};

const readLocalOverride = (): PersistedRoleConfig | null => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? normalizePersisted(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

/** Deep-merge per role+field, supaya data lama (sebelum field baru ditambahkan) tidak rusak. */
const mergeWithDefaults = (saved: Partial<RolePermissionMatrix>): RolePermissionMatrix => {
  const roles = Object.keys(DEFAULT_ROLE_PERMISSIONS) as ConfigurableRole[];
  return roles.reduce((acc, role) => {
    acc[role] = { ...DEFAULT_ROLE_PERMISSIONS[role], ...(saved[role] ?? {}) };
    return acc;
  }, {} as RolePermissionMatrix);
};

const mergeLabelsWithDefaults = (saved: Partial<RoleLabels>): RoleLabels => ({
  ...DEFAULT_ROLE_LABELS,
  ...saved,
});

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

  const persisted = useMemo<PersistedRoleConfig | null>(() => {
    if (remoteConfig?.nilai_setting) {
      try {
        return normalizePersisted(JSON.parse(remoteConfig.nilai_setting));
      } catch {
        // ignore malformed remote value, fall through to local/default
      }
    }
    return readLocalOverride();
  }, [remoteConfig]);

  const matrix = useMemo<RolePermissionMatrix>(
    () => mergeWithDefaults(persisted?.matrix ?? {}),
    [persisted]
  );

  const labels = useMemo<RoleLabels>(
    () => mergeLabelsWithDefaults(persisted?.labels ?? {}),
    [persisted]
  );

  return {
    matrix,
    labels,
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

  const save = async (matrix: RolePermissionMatrix, labels: RoleLabels) => {
    const value = JSON.stringify({ matrix, labels } satisfies PersistedRoleConfig);

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
