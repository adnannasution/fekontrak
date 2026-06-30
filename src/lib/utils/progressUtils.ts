import { Kontrak } from '@/types/database';
import { getEffectiveTanggalSelesai } from '@/utils/contractDateUtils';

export interface ProgressStatusConfig {
  behindThreshold: number;
  aheadThreshold: number;
  normalRange: number;
  warningEnabled: boolean;
}

export interface ProgressStatus {
  status: 'Normal' | 'Behind' | 'Ahead';
  deviation: number;
  isWarning: boolean;
  text: string;
  variant: 'default' | 'destructive' | 'secondary';
  className: string;
}

export interface ContractProgressAnalysis {
  id_kontrak: string;
  judul_kontrak: string;
  vendor_name: string;
  tipe_kontrak: string;
  progress_plan: number;
  progress_actual: number;
  deviation: number;
  status: 'Normal' | 'Behind' | 'Ahead';
  isWarning: boolean;
}

/**
 * Check if contract is eligible for progress tracking
 * Only active contracts with Lumpsum or TSA type are tracked
 */
export const isContractEligibleForProgressTracking = (contract: Kontrak): boolean => {
  // Check if contract is active
  const normalizedStatus = normalizeContractStatus(contract.status_kontrak);
  const isActive = normalizedStatus === 'Active';
  
  // Check if contract type is Lumpsum or TSA
  const isEligibleType = contract.tipe_kontrak === 'Lumpsum' || contract.tipe_kontrak === 'TSA';
  
  // Check if progress data exists
  const hasProgressData = contract.progress_plan !== null && 
                          contract.progress_actual !== null &&
                          contract.progress_plan !== undefined && 
                          contract.progress_actual !== undefined;
  
  return isActive && isEligibleType && hasProgressData;
};

/**
 * Normalize contract status for consistency
 */
export const normalizeContractStatus = (status: string): string => {
  switch (status) {
    case 'Aktif': return 'Active';
    case 'Selesai': return 'Completed';
    case 'Pre-KOM': return 'Pre-KOM';
    case 'Terminated': return 'Terminated';
    default: return status || 'Pre-KOM';
  }
};

/**
 * Calculate progress status using configuration thresholds
 */
export const calculateProgressStatus = (
  actualProgress: number | null,
  planProgress: number | null,
  config: ProgressStatusConfig
): ProgressStatus => {
  const actual = Number(actualProgress) || 0;
  const plan = Number(planProgress) || 0;
  
  // Calculate deviation: positive = behind, negative = ahead
  const deviation = plan - actual;
  const absDeviation = Math.abs(deviation);
  
  let status: 'Normal' | 'Behind' | 'Ahead' = 'Normal';
  let isWarning = false;
  let text = 'Normal';
  let variant: 'default' | 'destructive' | 'secondary' = 'default';
  let className = 'bg-green-100 text-green-800';
  
  if (config.warningEnabled) {
    if (deviation >= config.behindThreshold) {
      status = 'Behind';
      isWarning = true;
      text = `Behind (${absDeviation.toFixed(1)}%)`;
      variant = 'destructive';
      className = 'bg-red-100 text-red-800';
    } else if (deviation <= -config.aheadThreshold) {
      status = 'Ahead';
      text = `Ahead (${absDeviation.toFixed(1)}%)`;
      variant = 'secondary';
      className = 'bg-blue-100 text-blue-800';
    } else {
      status = 'Normal';
      text = 'Normal';
      variant = 'default';
      className = 'bg-green-100 text-green-800';
    }
  } else {
    // Fallback to simple comparison when thresholds are disabled
    if (actual < plan) {
      status = 'Behind';
      text = 'Behind';
      variant = 'destructive';
      className = 'bg-red-100 text-red-800';
    } else {
      status = 'Normal';
      text = 'On Track';
      variant = 'default';
      className = 'bg-green-100 text-green-800';
    }
  }
  
  return {
    status,
    deviation: absDeviation,
    isWarning,
    text,
    variant,
    className
  };
};

/**
 * Analyze all contracts for progress deviations
 */
export const analyzeContractProgressDeviations = (
  contracts: Kontrak[],
  config: ProgressStatusConfig
): ContractProgressAnalysis[] => {
  return contracts
    .filter(isContractEligibleForProgressTracking)
    .map(contract => {
      const progressPlan = contract.progress_plan || 0;
      const progressActual = contract.progress_actual || 0;
      const progressStatus = calculateProgressStatus(progressActual, progressPlan, config);
      
      return {
        id_kontrak: contract.id_kontrak,
        judul_kontrak: contract.judul_kontrak,
        vendor_name: contract.vendor?.nama_vendor || 'Unknown',
        tipe_kontrak: contract.tipe_kontrak || '',
        progress_plan: progressPlan,
        progress_actual: progressActual,
        deviation: progressStatus.deviation,
        status: progressStatus.status,
        isWarning: progressStatus.isWarning
      };
    });
};

export type ContractAlertLevel = 'Good' | 'Warning' | 'Alert' | 'Danger';

export interface ContractAlertStatus {
  level: ContractAlertLevel;
  text: string;
  className: string;
  reason: 'waktu' | 'progress' | 'aman';
}

const ALERT_RANK: Record<ContractAlertLevel, number> = {
  Good: 0,
  Warning: 1,
  Alert: 2,
  Danger: 3,
};

const ALERT_STYLE: Record<ContractAlertLevel, { text: string; className: string }> = {
  Good: { text: 'Good', className: 'bg-green-100 text-green-800' },
  Warning: { text: 'Warning', className: 'bg-yellow-100 text-yellow-800' },
  Alert: { text: 'Alert', className: 'bg-orange-100 text-orange-800' },
  Danger: { text: 'Habis/Danger', className: 'bg-red-100 text-red-800' },
};

const monthsUntil = (dateString?: string | null): number | null => {
  if (!dateString) return null;
  const target = new Date(dateString);
  if (isNaN(target.getTime())) return null;
  const diffMs = target.getTime() - Date.now();
  return diffMs / (1000 * 60 * 60 * 24 * 30);
};

/**
 * Status waktu berdasarkan sisa bulan sampai tanggal_selesai kontrak.
 * < 8 bulan: Warning, < 6 bulan: Alert, sudah lewat: Danger (Habis).
 */
export const calculateTimeAlertLevel = (contract: Kontrak): ContractAlertLevel => {
  const remainingMonths = monthsUntil(getEffectiveTanggalSelesai(contract));
  if (remainingMonths === null) return 'Good';
  if (remainingMonths <= 0) return 'Danger';
  if (remainingMonths < 6) return 'Alert';
  if (remainingMonths < 8) return 'Warning';
  return 'Good';
};

/**
 * Status progress berdasarkan progress_actual.
 * < 50%: Warning, < 20%: Alert, < 5%: Danger.
 */
export const calculateProgressAlertLevel = (contract: Kontrak): ContractAlertLevel => {
  const actual = Number(contract.progress_actual) || 0;
  if (actual < 5) return 'Danger';
  if (actual < 20) return 'Alert';
  if (actual < 50) return 'Warning';
  return 'Good';
};

/**
 * Status gabungan waktu & progress kontrak. Mengambil level paling parah
 * dari kedua kriteria (sesuai aturan: kalau salah satu kriteria buruk,
 * statusnya ikut buruk; hanya Good kalau waktu > 6 bulan & progress > 50%).
 */
export const calculateContractAlertStatus = (contract: Kontrak): ContractAlertStatus => {
  const timeLevel = calculateTimeAlertLevel(contract);
  const progressLevel = calculateProgressAlertLevel(contract);

  const level = ALERT_RANK[timeLevel] >= ALERT_RANK[progressLevel] ? timeLevel : progressLevel;
  const reason: ContractAlertStatus['reason'] =
    level === 'Good' ? 'aman' : ALERT_RANK[timeLevel] >= ALERT_RANK[progressLevel] ? 'waktu' : 'progress';

  return { level, reason, ...ALERT_STYLE[level] };
};

/**
 * Get progress status configuration from system settings
 */
export const getProgressStatusConfig = (konfigurasi: any[]): ProgressStatusConfig => {
  const warningEnabled = konfigurasi.find(config => config.nama_setting === 'Progress_Deviation_Warning_Enabled');
  const behindThreshold = konfigurasi.find(config => config.nama_setting === 'Progress_Deviation_Behind_Threshold');
  const aheadThreshold = konfigurasi.find(config => config.nama_setting === 'Progress_Deviation_Ahead_Threshold');
  const normalRange = konfigurasi.find(config => config.nama_setting === 'Progress_Deviation_Normal_Range');
  
  return {
    warningEnabled: warningEnabled ? warningEnabled.nilai_setting === 'true' : true,
    behindThreshold: behindThreshold ? parseInt(behindThreshold.nilai_setting) : 20,
    aheadThreshold: aheadThreshold ? parseInt(aheadThreshold.nilai_setting) : 5,
    normalRange: normalRange ? parseInt(normalRange.nilai_setting) : 5
  };
};