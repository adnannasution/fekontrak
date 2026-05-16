
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TechnicalDetailsFormProps {
  formData: {
    status_kontrak: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    disiplin: string;
    direksi_pekerjaan: string;
    tkdn_percentage: string;
    aktivitas_saat_ini: string;
    kendala: string;
  };
  setFormData: (data: any) => void;
}

export const TechnicalDetailsForm = ({ formData, setFormData }: TechnicalDetailsFormProps) => {
  const isContractActive = formData.status_kontrak !== 'Pre-KOM';

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Detail Teknis</h3>
      
      {isContractActive && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Periode Kontrak</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
              <Input
                id="tanggal_mulai"
                type="date"
                value={formData.tanggal_mulai || ''}
                onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
              <Input
                id="tanggal_selesai"
                type="date"
                value={formData.tanggal_selesai || ''}
                onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="disiplin">Disiplin</Label>
          <Select
            value={formData.disiplin}
            onValueChange={(value) => setFormData({ ...formData, disiplin: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih disiplin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Instrumentasi">Instrumentasi</SelectItem>
              <SelectItem value="Stationary">Stationary</SelectItem>
              <SelectItem value="Electrical">Electrical</SelectItem>
              <SelectItem value="Rotating">Rotating</SelectItem>
              <SelectItem value="Alat Berat">Alat Berat</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="direksi_pekerjaan">Direksi Pekerjaan</Label>
          <Select
            value={formData.direksi_pekerjaan}
            onValueChange={(value) => setFormData({ ...formData, direksi_pekerjaan: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih direksi pekerjaan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MA5">MA5</SelectItem>
              <SelectItem value="MA6">MA6</SelectItem>
              <SelectItem value="MA7">MA7</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="tkdn_percentage">TKDN (%)</Label>
        <Input
          id="tkdn_percentage"
          type="number"
          min="0"
          max="100"
          value={formData.tkdn_percentage}
          onChange={(e) => setFormData({ ...formData, tkdn_percentage: e.target.value })}
          placeholder="Masukkan persentase TKDN"
        />
      </div>
    </div>
  );
};
