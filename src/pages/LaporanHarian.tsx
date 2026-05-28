import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ClipboardList, Filter, RefreshCw, Search } from 'lucide-react';
import { useDailyReport } from '@/hooks/useDailyReport';

const DISIPLIN_OPTIONS = ['Electrical', 'Instrument', 'Rotating', 'Stationary', 'Alat Berat'];
const KATEGORI_OPTIONS = ['Corrective Maintenance', 'Preventive Maintenance', 'Plant Patrol', 'Progress', 'Challenge Session'];
const STATUS_OPTIONS   = ['Done', 'In Progress', 'Waiting Material', 'Pending'];

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'done':             return 'bg-green-100 text-green-800 border-green-300';
    case 'in progress':      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'waiting material': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'pending':          return 'bg-gray-100 text-gray-800 border-gray-300';
    default:                 return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getKategoriColor = (kategori: string) => {
  switch (kategori) {
    case 'Corrective Maintenance':  return 'bg-red-100 text-red-700';
    case 'Preventive Maintenance':  return 'bg-blue-100 text-blue-700';
    case 'Plant Patrol':            return 'bg-purple-100 text-purple-700';
    case 'Progress':                return 'bg-green-100 text-green-700';
    case 'Challenge Session':       return 'bg-orange-100 text-orange-700';
    default:                        return 'bg-gray-100 text-gray-700';
  }
};

const LaporanHarian = () => {
  const [filters, setFilters] = useState({
    disiplin: '',
    kategori: '',
    status: '',
    tanggal_dari: '',
    tanggal_sampai: '',
  });
  const [search, setSearch] = useState('');

  const activeFilters = {
    disiplin:       filters.disiplin       || undefined,
    kategori:       filters.kategori       || undefined,
    status:         filters.status         || undefined,
    tanggal_dari:   filters.tanggal_dari   || undefined,
    tanggal_sampai: filters.tanggal_sampai || undefined,
  };

  const { reports, isLoading, refetch } = useDailyReport(activeFilters);

  const filtered = reports.filter(r =>
    !search || r.deskripsi?.toLowerCase().includes(search.toLowerCase())
  );

  const resetFilters = () => {
    setFilters({ disiplin: '', kategori: '', status: '', tanggal_dari: '', tanggal_sampai: '' });
    setSearch('');
  };

  const formatDate = (val: string) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Summary counts
  const summary = reports.reduce((acc, r) => {
    acc[r.disiplin] = (acc[r.disiplin] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ClipboardList className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Laporan Harian</h1>
            <p className="text-sm text-gray-500">Data laporan kegiatan maintenance harian via WhatsApp</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {DISIPLIN_OPTIONS.map(d => (
            <Card key={d} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setFilters(f => ({ ...f, disiplin: f.disiplin === d ? '' : d }))}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{summary[d] || 0}</p>
                <p className="text-xs text-gray-600 mt-1">{d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filter */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-base">Filter</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari deskripsi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filters.disiplin} onValueChange={v => setFilters(f => ({ ...f, disiplin: v === 'all' ? '' : v }))}>
              <SelectTrigger><SelectValue placeholder="Semua Disiplin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Disiplin</SelectItem>
                {DISIPLIN_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.kategori} onValueChange={v => setFilters(f => ({ ...f, kategori: v === 'all' ? '' : v }))}>
              <SelectTrigger><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {KATEGORI_OPTIONS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={v => setFilters(f => ({ ...f, status: v === 'all' ? '' : v }))}>
              <SelectTrigger><SelectValue placeholder="Semua Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input type="date" value={filters.tanggal_dari}
              onChange={e => setFilters(f => ({ ...f, tanggal_dari: e.target.value }))}
              placeholder="Dari tanggal" />

            <Input type="date" value={filters.tanggal_sampai}
              onChange={e => setFilters(f => ({ ...f, tanggal_sampai: e.target.value }))}
              placeholder="Sampai tanggal" />
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-gray-500">
              Menampilkan <span className="font-semibold">{filtered.length}</span> dari {reports.length} data
            </p>
            <Button variant="ghost" size="sm" onClick={resetFilters}>Reset Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada data laporan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-4 font-medium text-gray-600">Tanggal</th>
                    <th className="text-left p-4 font-medium text-gray-600">Disiplin</th>
                    <th className="text-left p-4 font-medium text-gray-600">Kategori</th>
                    <th className="text-left p-4 font-medium text-gray-600">Deskripsi</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                    <th className="text-left p-4 font-medium text-gray-600">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.idReport} className={`border-b hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                      <td className="p-4 text-gray-700 whitespace-nowrap">{formatDate(r.tanggalLaporan)}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs font-medium">{r.disiplin}</Badge>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getKategoriColor(r.kategori)}`}>
                          {r.kategori}
                        </span>
                      </td>
                      <td className="p-4 text-gray-800 max-w-xs">{r.deskripsi}</td>
                      <td className="p-4">
                        <Badge className={`text-xs ${getStatusColor(r.statusPekerjaan)}`}>
                          {r.statusPekerjaan || '-'}
                        </Badge>
                      </td>
                      <td className="p-4 text-gray-500 text-xs max-w-xs">{r.catatan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LaporanHarian;