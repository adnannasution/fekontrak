
import { Calendar, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ContractTimeInfoProps {
  contract: any;
  fieldText: (val: any) => React.ReactNode;
}

export const ContractTimeInfo = ({ contract, fieldText }: ContractTimeInfoProps) => {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDurationProgress = () => {
    if (!contract.tanggal_mulai || !contract.tanggal_selesai) return { progress: 0, daysRemaining: 0, totalDays: 0 };
    
    const startDate = new Date(contract.tanggal_mulai);
    const endDate = new Date(contract.tanggal_selesai);
    const currentDate = new Date();
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - elapsedDays);
    const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
    
    return { progress, daysRemaining, totalDays, elapsedDays: Math.max(0, elapsedDays) };
  };

  const { progress, daysRemaining, totalDays, elapsedDays } = calculateDurationProgress();
  const isOverdue = progress > 100;
  const isCritical = progress >= 80;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Duration Progress Bar */}
      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-blue-600 font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Progress Durasi Kontrak
          </h4>
          <span className="text-sm font-medium text-gray-600">
            {elapsedDays} / {totalDays} hari
          </span>
        </div>
        <Progress 
          value={Math.min(100, progress)} 
          className="h-3 mb-3"
        />
        <div className="flex justify-between items-center text-sm">
          <span className={`font-medium ${
            isOverdue ? 'text-red-600' : 
            isCritical ? 'text-orange-600' : 
            'text-green-600'
          }`}>
            {isOverdue 
              ? `Terlambat ${Math.abs(daysRemaining)} hari` 
              : `Sisa ${daysRemaining} hari`
            }
          </span>
          <span className="text-gray-500">
            {Math.round(progress)}% selesai
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-500" />
            Tanggal Mulai
          </h4>
          <div className="flex items-center gap-2 text-gray-800">
            <span className="font-medium">{formatDate(contract.tanggal_mulai)}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-red-500" />
            Tanggal Selesai
          </h4>
          <div className="flex items-center gap-2 text-gray-800">
            <span className="font-medium">{formatDate(contract.tanggal_selesai)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
