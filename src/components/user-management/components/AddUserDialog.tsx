import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { UserFormData } from '../types';

const API_URL = "https://bekontrak-production.up.railway.app/api";

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  onSubmit: () => void;
}

export const AddUserDialog = ({ isOpen, onOpenChange, formData, setFormData, onSubmit }: AddUserDialogProps) => {
  const [vendors, setVendors] = useState<{ idVendor: string; namaVendor: string }[]>([]);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(`${API_URL}/vendors`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) setVendors(await res.json());
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };
    if (isOpen) fetchVendors();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="btn-ripple hover:scale-105 transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah User Baru</DialogTitle>
          <DialogDescription>
            Tambahkan pengguna ke sistem. User baru akan dalam status tidak aktif dan perlu diaktifkan oleh admin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="add-name">Nama Lengkap</Label>
            <Input
              id="add-name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="add-email">Email</Label>
            <Input
              id="add-email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: any) => setFormData({ ...formData, role: value, id_vendor: '' })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="pic">PIC</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dropdown vendor — hanya muncul kalau role = vendor */}
          {formData.role === 'vendor' && (
            <div className="grid gap-2">
              <Label>Perusahaan Vendor <span className="text-red-500">*</span></Label>
              <Select
                value={formData.id_vendor || ''}
                onValueChange={(value) => setFormData({ ...formData, id_vendor: value })}
              >
                <SelectTrigger><SelectValue placeholder="Pilih vendor..." /></SelectTrigger>
                <SelectContent>
                  {vendors.map(v => (
                    <SelectItem key={v.idVendor} value={v.idVendor}>{v.namaVendor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={onSubmit}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};