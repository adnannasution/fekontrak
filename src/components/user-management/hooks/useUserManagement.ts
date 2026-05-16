import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile, UserFormData } from '../types';

const API_URL = "http://localhost:5152/api";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

// Map backend ProfileDto → FE UserProfile
const mapUser = (u: any): UserProfile => ({
  id: u.id,
  email: u.email,
  full_name: u.fullName ?? u.full_name ?? '',
  role: (u.role === 'user' ? 'viewer' : u.role) as 'admin' | 'pic' | 'viewer',
  company_name: '',
  phone: '',
  is_active: u.isActive ?? u.is_active ?? true,  // ← ambil dari backend
  created_at: u.createdAt ?? u.created_at,
  updated_at: u.updatedAt ?? u.updated_at,
});

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    role: 'viewer',
    company_name: '',
    phone: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; user: UserProfile | null }>({
    open: false,
    user: null
  });

  const { toast } = useToast();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  // ==================== FETCH ALL USERS ====================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: authHeaders()
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setUsers((data || []).map(mapUser));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data pengguna",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================== TOGGLE STATUS ====================
  // PATCH /api/profile/{id}/status
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!isAdmin) return;

    if (userId === userProfile?.id) {
      toast({
        title: "Aksi Tidak Diperbolehkan",
        description: "Anda tidak dapat mengubah status akun sendiri.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/profile/${userId}/status`, {
        method: 'PATCH',
        headers: authHeaders()
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Gagal mengubah status');

      toast({
        title: "Berhasil",
        description: `User berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal mengubah status user.",
        variant: "destructive",
      });
    }
  };

  // ==================== EDIT USER ====================
  const handleEditUser = (user: UserProfile) => {
    if (user.id === userProfile?.id) {
      toast({
        title: "Aksi Tidak Diperbolehkan",
        description: "Anda tidak dapat mengedit akun Anda sendiri.",
        variant: "destructive",
      });
      return;
    }

    setSelectedUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      company_name: '',
      phone: ''
    });
    setIsEditDialogOpen(true);
  };

  // ==================== UPDATE USER ====================
  // PUT /api/profile/{id}
  const handleUpdateUser = async () => {
    if (!selectedUser || !isAdmin) return;

    if (selectedUser.id === userProfile?.id) {
      toast({
        title: "Aksi Tidak Diperbolehkan",
        description: "Tidak dapat mengedit akun sendiri.",
        variant: "destructive",
      });
      return;
    }

    const cleanName = formData.full_name.trim();
    if (!cleanName) {
      toast({ title: "Validasi Error", description: "Nama tidak boleh kosong.", variant: "destructive" });
      return;
    }

    try {
      const dbRole = formData.role === 'viewer' ? 'user' : formData.role;

      const res = await fetch(`${API_URL}/profile/${selectedUser.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ fullName: cleanName, role: dbRole })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Gagal memperbarui user');

      toast({ title: "Berhasil", description: "Data pengguna berhasil diperbarui" });
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: "Gagal memperbarui data pengguna.", variant: "destructive" });
    }
  };

  // ==================== ADD USER ====================
  // POST /api/auth/register
  const handleAddUser = async () => {
    if (!isAdmin) return;

    const cleanEmail = formData.email.trim();
    const cleanName = formData.full_name.trim();

    if (!cleanEmail || !cleanName) {
      toast({ title: "Validasi Error", description: "Email dan nama wajib diisi.", variant: "destructive" });
      return;
    }

    try {
      const dbRole = formData.role === 'viewer' ? 'user' : formData.role;

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          email: cleanEmail,
          fullName: cleanName,
          role: dbRole,
          password: 'Password123!'
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 400 && data?.message?.toLowerCase().includes('terdaftar')) {
        toast({ title: "User sudah ada", description: "Email sudah terdaftar.", variant: "destructive" });
        return;
      }

      if (!res.ok) throw new Error(data?.message || 'Gagal menambah user');

      toast({
        title: "Berhasil",
        description: "User baru ditambahkan. Password default: Password123!",
      });

      setIsAddDialogOpen(false);
      setFormData({ email: '', full_name: '', role: 'viewer', company_name: '', phone: '' });
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: "Gagal menambah user baru.", variant: "destructive" });
    }
  };

  // ==================== DELETE USER ====================
  // DELETE /api/profile/{id}
  const handleDeleteUser = async (user: UserProfile) => {
    setDeleteConfirm({ open: true, user });
  };

  const confirmDelete = async () => {
    const user = deleteConfirm.user;
    setDeleteConfirm({ open: false, user: null });

    if (!isAdmin || !user) return;

    if (user.id === userProfile?.id) {
      toast({
        title: "Aksi Tidak Diperbolehkan",
        description: "Tidak dapat menghapus akun sendiri.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/profile/${user.id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Gagal menghapus user');

      toast({ title: "User Dihapus", description: "User berhasil dihapus." });
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Error", description: "Gagal menghapus user.", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    formData,
    setFormData,
    deleteConfirm,
    setDeleteConfirm,
    isAdmin,
    handleToggleUserStatus,
    handleEditUser,
    handleUpdateUser,
    handleAddUser,
    handleDeleteUser,
    confirmDelete
  };
};