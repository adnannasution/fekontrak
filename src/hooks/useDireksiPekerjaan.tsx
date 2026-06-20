import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export const useDireksiPekerjaan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: direksiPekerjaanList = [], isLoading, error } = useQuery({
    queryKey: ['direksi-pekerjaan'],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/direksi-pekerjaan`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal ambil data direksi pekerjaan");

      return data.map((d: any) => ({
        id_direksi_pekerjaan: d.idDireksiPekerjaan,
        nama: d.nama,
        jabatan: d.jabatan,
        sub_area: d.subArea,
        created_at: d.createdAt,
        updated_at: d.updatedAt,
      }));
    }
  });

  const createDireksiPekerjaan = useMutation({
    mutationFn: async (item: any) => {
      const token = localStorage.getItem("token");

      const payload = {
        nama: item.nama,
        jabatan: item.jabatan,
        subArea: item.sub_area,
      };

      const res = await fetch(`${API_URL}/direksi-pekerjaan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direksi-pekerjaan'] });
      toast({ title: "Berhasil", description: "Direksi Pekerjaan berhasil ditambahkan" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menambahkan Direksi Pekerjaan", variant: "destructive" });
    }
  });

  const updateDireksiPekerjaan = useMutation({
    mutationFn: async ({ id, ...item }: any) => {
      const token = localStorage.getItem("token");

      const payload = {
        nama: item.nama,
        jabatan: item.jabatan,
        subArea: item.sub_area,
      };

      const res = await fetch(`${API_URL}/direksi-pekerjaan/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direksi-pekerjaan'] });
      toast({ title: "Berhasil", description: "Direksi Pekerjaan berhasil diperbarui" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal memperbarui Direksi Pekerjaan", variant: "destructive" });
    }
  });

  const deleteDireksiPekerjaan = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/direksi-pekerjaan/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Gagal hapus Direksi Pekerjaan");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['direksi-pekerjaan'] });
      toast({ title: "Berhasil", description: "Direksi Pekerjaan berhasil dihapus" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menghapus Direksi Pekerjaan", variant: "destructive" });
    }
  });

  return {
    direksiPekerjaanList,
    isLoading,
    error,
    createDireksiPekerjaan,
    updateDireksiPekerjaan,
    deleteDireksiPekerjaan,
  };
};
