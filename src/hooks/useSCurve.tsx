import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface SCurveActivity {
  id: string;
  nama: string;
  bobot: number;
}

export interface SCurvePeriodActivity {
  activityId: string;
  plan: number;
  actual: number | null;
}

export interface SCurvePeriod {
  periode: string;
  activities: SCurvePeriodActivity[];
}

export interface SCurveData {
  activities: SCurveActivity[];
  periods: SCurvePeriod[];
}

const defaultSCurveData: SCurveData = { activities: [], periods: [] };

// Hitung weighted progress satu periode
export const calcWeightedProgress = (
  periodActivities: SCurvePeriodActivity[],
  activities: SCurveActivity[],
  type: 'plan' | 'actual'
): number => {
  return periodActivities.reduce((sum, pa) => {
    const act = activities.find(a => a.id === pa.activityId);
    if (!act) return sum;
    const val = type === 'plan' ? pa.plan : (pa.actual ?? 0);
    return sum + (val * act.bobot) / 100;
  }, 0);
};

// Hitung cumulative progress dari semua periode
const calcCumulativeProgress = (data: SCurveData) => {
  let cumPlan = 0;
  let cumActual = 0;
  let lastActual = 0;

  data.periods.forEach(p => {
    cumPlan += calcWeightedProgress(p.activities, data.activities, 'plan');
    const hasActual = p.activities.some(pa => pa.actual !== null);
    if (hasActual) {
      cumActual += calcWeightedProgress(p.activities, data.activities, 'actual');
      lastActual = cumActual;
    }
  });

  return {
    plan: parseFloat(Math.min(cumPlan, 100).toFixed(2)),
    actual: parseFloat(Math.min(lastActual, 100).toFixed(2)),
  };
};

export const useSCurve = (idKontrak?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sCurveData, isLoading } = useQuery({
    queryKey: ['scurve', idKontrak],
    queryFn: async () => {
      if (!idKontrak) return defaultSCurveData;
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/Contracts/${idKontrak}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal ambil data");
      const data = await res.json();
      const raw = data.sCurveData || data.s_curve_data;
      if (!raw) return defaultSCurveData;
      try { return JSON.parse(raw) as SCurveData; }
      catch { return defaultSCurveData; }
    },
    enabled: !!idKontrak,
  });

  const saveSCurve = useMutation({
    mutationFn: async (newData: SCurveData) => {
      const token = localStorage.getItem("token");

      // 1. Simpan S-Curve data
      const res = await fetch(`${API_URL}/Contracts/${idKontrak}/scurve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sCurveData: JSON.stringify(newData) })
      });
      if (!res.ok) throw new Error("Gagal simpan S-Curve");

      // 2. Hitung progress kumulatif terakhir
      const { plan, actual } = calcCumulativeProgress(newData);

      // 3. Update progress_plan dan progress_actual di kontrak
      await fetch(`${API_URL}/Contracts/${idKontrak}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          progressPlan: plan,
          progressActual: actual,
        })
      });

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scurve', idKontrak] });
      queryClient.invalidateQueries({ queryKey: ['contract', idKontrak] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast({ title: "Berhasil", description: "S-Curve & progress kontrak berhasil diperbarui" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menyimpan S-Curve", variant: "destructive" });
    }
  });

  return { sCurveData: sCurveData ?? defaultSCurveData, isLoading, saveSCurve };
};