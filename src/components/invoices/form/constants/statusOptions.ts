
import { CheckCircle, Clock, AlertCircle, FileCheck, Send, Users, Shield, Eye, CreditCard } from 'lucide-react';

export const statusOptions = [
  { value: 'Punchlist', label: 'Punchlist', color: 'bg-red-100 text-red-800 border-red-300', icon: AlertCircle, step: 1 },
  { value: 'BAST/BAPP', label: 'BAST / BAPP', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: FileCheck, step: 2 },
  { value: 'Pengajuan', label: 'Pengajuan', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Send, step: 3 },
  { value: 'BAST I Vendor', label: 'BAST I Vendor', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Users, step: 4 },
  { value: 'SA', label: 'SA', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: Shield, step: 5 },
  { value: 'PA', label: 'PA', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Eye, step: 6 },
  { value: 'Verification', label: 'Verification', color: 'bg-pink-100 text-pink-800 border-pink-300', icon: CheckCircle, step: 7 },
  { value: 'Payment/Selesai', label: 'Payment / Selesai', color: 'bg-green-100 text-green-800 border-green-300', icon: CreditCard, step: 8 }
];
