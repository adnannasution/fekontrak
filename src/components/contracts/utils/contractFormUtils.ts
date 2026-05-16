
import { Kontrak } from '@/types/database';

export interface ContractFormData {
  // Basic Info
  judul_kontrak: string;
  no_dokumen_kontrak?: string;
  no_po_pr?: string;
  tipe_kontrak: string;
  status_kontrak: string;
  nilai_awal: string;
  tanggal_terima_dokumen: string;
  tanggal_maksimal_kom: string;
  tanggal_kom: string;

  // Technical Details
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  durasi_kontrak_hari?: number;
  direksi_pekerjaan?: string;
  disiplin?: string;
  tkdn_percentage?: number;

  // Vendor Info
  id_vendor?: string;
  pic_name?: string;
  pic_contact?: string;
  vendor_score?: number;

  // Progress
  progress_plan?: number;
  progress_actual?: number;
  aktivitas_saat_ini?: string;
  kendala?: string;
  tanggal_lkp?: string;

  // Amendment
  has_amendment: boolean;
  no_amandemen?: string;
  tanggal_amandemen?: string;
  jenis_amandemen?: string;
  nilai_kontrak_baru?: string;
  durasi_amandemen?: string;
  tanggal_mulai_baru?: string;
  tanggal_selesai_baru?: string;
  alasan_perubahan?: string;

  // Documents
  contract_documents?: any[];
  amendment_documents?: any[];
}

export const initialFormData: ContractFormData = {
  judul_kontrak: '',
  no_dokumen_kontrak: '',
  no_po_pr: '',
  tipe_kontrak: '',
  status_kontrak: 'Pre-KOM',
  nilai_awal: '',
  tanggal_terima_dokumen: '',
  tanggal_maksimal_kom: '',
  tanggal_kom: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  durasi_kontrak_hari: 0,
  direksi_pekerjaan: '',
  disiplin: '',
  tkdn_percentage: 0,
  id_vendor: '',
  pic_name: '',
  pic_contact: '',
  vendor_score: 0,
  progress_plan: 0,
  progress_actual: 0,
  aktivitas_saat_ini: '',
  kendala: '',
  tanggal_lkp: '',
  has_amendment: false,
  no_amandemen: '',
  tanggal_amandemen: '',
  jenis_amandemen: '',
  nilai_kontrak_baru: '',
  durasi_amandemen: '',
  tanggal_mulai_baru: '',
  tanggal_selesai_baru: '',
  alasan_perubahan: '',
  contract_documents: [],
  amendment_documents: []
};

export const normalizeTipeKontrak = (tipeKontrak: string): string => {
  // Normalize semua variasi TSA ke 'TSA'
  if (tipeKontrak === 'TSA' || tipeKontrak === 'LTSA' || tipeKontrak === 'TSA/LTSA' || tipeKontrak === 'LTSA/TSA') {
    console.log('🔄 Normalizing contract type from', tipeKontrak, 'to TSA');
    return 'TSA';
  }
  return tipeKontrak;
};

export const createFormDataFromContract = (contract: Kontrak): ContractFormData => {
  console.log('🔄 Converting contract to form data:', contract.id_kontrak);
  console.log('🔄 Contract data:', {
    id: contract.id_kontrak,
    judul: contract.judul_kontrak,
    tipe: contract.tipe_kontrak,
    status: contract.status_kontrak,
    vendor: contract.id_vendor
  });
  console.log('🔍 Original contract tipe_kontrak:', contract.tipe_kontrak);
  console.log('🔍 Original contract documents:', {
    contract_documents: contract.contract_documents,
    amendment_documents: contract.amendment_documents
  });
  
  // Normalize tipe kontrak
  const normalizedTipeKontrak = normalizeTipeKontrak(contract.tipe_kontrak || '');
  console.log('🔄 Normalized tipe_kontrak:', normalizedTipeKontrak);

  const formData: ContractFormData = {
    // Basic Info
    judul_kontrak: contract.judul_kontrak || '',
    no_dokumen_kontrak: contract.no_dokumen_kontrak || '',
    no_po_pr: contract.no_po_pr || '',
    tipe_kontrak: normalizedTipeKontrak,
    status_kontrak: contract.status_kontrak || 'Pre-KOM',
    nilai_awal: contract.nilai_awal?.toString() || '',
    tanggal_terima_dokumen: contract.tanggal_terima_dokumen || '',
    tanggal_maksimal_kom: contract.tanggal_maksimal_kom || '',
    tanggal_kom: contract.tanggal_kom || '',

    // Technical Details
    tanggal_mulai: contract.tanggal_mulai || '',
    tanggal_selesai: contract.tanggal_selesai || '',
    durasi_kontrak_hari: contract.durasi_kontrak_hari || 0,
    direksi_pekerjaan: contract.direksi_pekerjaan || '',
    disiplin: contract.disiplin || '',
    tkdn_percentage: contract.tkdn_percentage || 0,

    // Vendor Info - will be populated by ContractVendorForm
    id_vendor: contract.id_vendor || '',
    pic_name: '',
    pic_contact: '',
    vendor_score: 0,

    // Progress
    progress_plan: contract.progress_plan || 0,
    progress_actual: contract.progress_actual || 0,
    aktivitas_saat_ini: contract.aktivitas_saat_ini || '',
    kendala: contract.kendala || '',
    tanggal_lkp: contract.tanggal_lkp || '',

    // Amendment
    has_amendment: contract.has_amendment || false,
    no_amandemen: contract.no_amandemen || '',
    tanggal_amandemen: contract.tanggal_amandemen || '',
    jenis_amandemen: contract.jenis_amandemen || '',
    nilai_kontrak_baru: contract.nilai_kontrak_baru?.toString() || '',
    durasi_amandemen: contract.durasi_amandemen?.toString() || '',
    tanggal_mulai_baru: contract.tanggal_mulai_baru || '',
    tanggal_selesai_baru: contract.tanggal_selesai_baru || '',
    alasan_perubahan: contract.alasan_perubahan || '',

    // Documents - Load from database
    contract_documents: Array.isArray(contract.contract_documents) ? contract.contract_documents : [],
    amendment_documents: Array.isArray(contract.amendment_documents) ? contract.amendment_documents : []
  };

  console.log('✅ Form data created with documents:', {
    contract_documents_count: formData.contract_documents?.length || 0,
    amendment_documents_count: formData.amendment_documents?.length || 0
  });
  return formData;
};

export const createContractFromFormData = (formData: ContractFormData) => {
  console.log('🔄 Creating contract from form data:', formData);
  console.log('🔍 Form tipe_kontrak:', formData.tipe_kontrak);
  console.log('🔍 Form documents:', {
    contract_documents: formData.contract_documents?.length || 0,
    amendment_documents: formData.amendment_documents?.length || 0
  });

  // Ensure tipe_kontrak is properly set
  const tipeKontrak = normalizeTipeKontrak(formData.tipe_kontrak);
  console.log('🔄 Final tipe_kontrak for database:', tipeKontrak);

  return {
    // Basic Info
    judul_kontrak: formData.judul_kontrak,
    no_dokumen_kontrak: formData.no_dokumen_kontrak || null,
    no_po_pr: formData.no_po_pr || null,
    tipe_kontrak: tipeKontrak,
    status_kontrak: formData.status_kontrak,
    nilai_awal: formData.nilai_awal ? parseFloat(formData.nilai_awal) : 0,
    tanggal_terima_dokumen: formData.tanggal_terima_dokumen,
    tanggal_maksimal_kom: formData.tanggal_maksimal_kom || null,
    tanggal_kom: formData.tanggal_kom || null,

    // Technical Details
    tanggal_mulai: formData.tanggal_mulai || null,
    tanggal_selesai: formData.tanggal_selesai || null,
    durasi_kontrak_hari: formData.durasi_kontrak_hari || null,
    direksi_pekerjaan: formData.direksi_pekerjaan || null,
    disiplin: formData.disiplin || null,
    tkdn_percentage: formData.tkdn_percentage || null,

    // Vendor Info
    id_vendor: formData.id_vendor,
    
    // Progress
    progress_plan: formData.progress_plan || 0,
    progress_actual: formData.progress_actual || 0,
    aktivitas_saat_ini: formData.aktivitas_saat_ini || null,
    kendala: formData.kendala || null,
    tanggal_lkp: formData.tanggal_lkp || null,

    // Amendment
    has_amendment: formData.has_amendment || false,
    no_amandemen: formData.no_amandemen || null,
    tanggal_amandemen: formData.tanggal_amandemen || null,
    jenis_amandemen: formData.jenis_amandemen || null,
    nilai_kontrak_baru: formData.nilai_kontrak_baru ? parseFloat(formData.nilai_kontrak_baru) : null,
    durasi_amandemen: formData.durasi_amandemen ? parseInt(formData.durasi_amandemen) : null,
    tanggal_mulai_baru: formData.tanggal_mulai_baru || null,
    tanggal_selesai_baru: formData.tanggal_selesai_baru || null,
    alasan_perubahan: formData.alasan_perubahan || null,

    // Documents - Include in database update
    contract_documents: formData.contract_documents || [],
    amendment_documents: formData.amendment_documents || [],

    // Required fields for database
    tanggal_spb_diterima: formData.tanggal_terima_dokumen,
    sla_kom_hari: 14,
    estimasi_tanggal_kom: formData.tanggal_maksimal_kom || null,
    kom_terlambat: null
  };
};
