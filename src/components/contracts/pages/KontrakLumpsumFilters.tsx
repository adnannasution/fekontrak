
import { ContractsSearchFilter } from '../ContractsSearchFilter';

interface KontrakLumpsumFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  workDirectionFilter: string;
  setWorkDirectionFilter: (filter: string) => void;
  workDirectionOptions: string[];
  amendmentFilter: string;
  setAmendmentFilter: (filter: string) => void;
  viewMode: 'card' | 'list';
  onViewModeChange: (mode: 'card' | 'list') => void;
  summary: {
    total: number;
    active: number;
    pending: number;
    completed: number;
  };
}

export function KontrakLumpsumFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  workDirectionFilter,
  setWorkDirectionFilter,
  workDirectionOptions,
  amendmentFilter,
  setAmendmentFilter,
  viewMode,
  onViewModeChange,
  summary,
}: KontrakLumpsumFiltersProps) {
  return (
    <ContractsSearchFilter
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      summary={summary}
      workDirectionOptions={workDirectionOptions}
      workDirectionFilter={workDirectionFilter}
      setWorkDirectionFilter={setWorkDirectionFilter}
      amendmentFilter={amendmentFilter}
      setAmendmentFilter={setAmendmentFilter}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
    />
  );
}
