import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';

const jabatanOptions = [
  'Manager Maintenance Execution I',
  'Manager Maintenance Execution II',
  'Pengawas Pekerjaan',
];

const subAreaOptions = [
  'SH Maintenance Area 5',
  'SH Maintenance Area 6',
  'SH Maintenance Area 7',
  'Workshop',
];

interface DireksiPekerjaanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: any | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const DireksiPekerjaanFormDialog = ({
  open,
  onOpenChange,
  item,
  onSubmit,
  isLoading = false
}: DireksiPekerjaanFormDialogProps) => {
  const [formData, setFormData] = useState({ nama: '', jabatan: '', sub_area: '' });

  useEffect(() => {
    if (item) {
      setFormData({
        nama: item.nama || '',
        jabatan: item.jabatan || '',
        sub_area: item.sub_area || '',
      });
    } else {
      setFormData({ nama: '', jabatan: '', sub_area: '' });
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting direksi pekerjaan form:', error);
    }
  };

  const isPengawas = formData.jabatan === 'Pengawas Pekerjaan';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Direksi Pekerjaan' : 'Tambah Direksi Pekerjaan'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nama">Nama *</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Masukkan nama"
              required
            />
          </div>

          <div>
            <Label htmlFor="jabatan">Jabatan *</Label>
            <Select
              value={formData.jabatan}
              onValueChange={(value) => setFormData({ ...formData, jabatan: value, sub_area: value === 'Pengawas Pekerjaan' ? formData.sub_area : '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jabatan" />
              </SelectTrigger>
              <SelectContent>
                {jabatanOptions.map((j) => (
                  <SelectItem key={j} value={j}>{j}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isPengawas && (
            <div>
              <Label htmlFor="sub_area">Sub Area *</Label>
              <Select
                value={formData.sub_area}
                onValueChange={(value) => setFormData({ ...formData, sub_area: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih sub area" />
                </SelectTrigger>
                <SelectContent>
                  {subAreaOptions.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : item ? 'Update' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
