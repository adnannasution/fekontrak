import { Kontrak } from '@/types/database';

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