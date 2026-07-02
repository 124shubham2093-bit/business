import React, { useState, useMemo } from 'react';
import { Eye, ArrowUpDown } from 'lucide-react';
import type { Startup } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface StartupListProps {
  startups: Startup[];
  searchQuery: string;
  onSelectStartup: (startup: Startup) => void;
  newlyCreatedId?: string | null;
}

type SortField = 'name' | 'investmentScore' | 'dateInvestigated';
type SortOrder = 'asc' | 'desc';

export const StartupList: React.FC<StartupListProps> = ({
  startups,
  searchQuery,
  onSelectStartup,
  newlyCreatedId,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('investmentScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Sectors list for filter dropdown
  const sectors = useMemo(() => {
    const s = new Set(startups.map((item) => item.sector));
    return ['All', ...Array.from(s)];
  }, [startups]);

  // Handle header sorting click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter and sort startups list
  const filteredAndSortedStartups = useMemo(() => {
    let result = [...startups];

    // Filter by global search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.sector.toLowerCase().includes(q) ||
          s.elevatorPitch.toLowerCase().includes(q)
      );
    }

    // Filter by sector
    if (selectedSector !== 'All') {
      result = result.filter((s) => s.sector === selectedSector);
    }

    // Filter by risk
    if (selectedRisk !== 'All') {
      result = result.filter((s) => s.riskLevel === selectedRisk);
    }

    // Filter by status
    if (selectedStatus !== 'All') {
      result = result.filter((s) => s.status === selectedStatus);
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });

    return result;
  }, [startups, searchQuery, selectedSector, selectedRisk, selectedStatus, sortField, sortOrder]);

  const getRiskBadge = (level: Startup['riskLevel']) => {
    switch (level) {
      case 'Low':
        return <Badge variant="success">Low</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'High':
        return <Badge variant="danger" glow>High</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: Startup['status']) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="success" glow>Approved</Badge>;
      case 'Under Review':
        return <Badge variant="warning">Under Review</Badge>;
      case 'Flagged':
        return <Badge variant="danger">Flagged</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle>Recent Due Diligence Audits</CardTitle>
          <p className="text-xs text-gray-400">Database of comprehensive startup security & financials assessments</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap gap-2 text-xs">
          {/* Sector Filter */}
          <div className="flex items-center space-x-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1.5">
            <span className="text-gray-400">Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer pr-1"
            >
              {sectors.map((sec) => (
                <option key={sec} value={sec} className="bg-dark-bg text-white">
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center space-x-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1.5">
            <span className="text-gray-400">Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer pr-1"
            >
              <option value="All" className="bg-dark-bg text-white">All</option>
              <option value="Low" className="bg-dark-bg text-white">Low</option>
              <option value="Medium" className="bg-dark-bg text-white">Medium</option>
              <option value="High" className="bg-dark-bg text-white">High</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 bg-white/5 border border-white/5 rounded-lg px-2 py-1.5">
            <span className="text-gray-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer pr-1"
            >
              <option value="All" className="bg-dark-bg text-white">All</option>
              <option value="Approved" className="bg-dark-bg text-white">Approved</option>
              <option value="Under Review" className="bg-dark-bg text-white">Under Review</option>
              <option value="Flagged" className="bg-dark-bg text-white">Flagged</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/2 text-gray-400 text-xs font-semibold select-none">
              <th
                onClick={() => handleSort('name')}
                className="py-3.5 px-6 cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-1">
                  <span>Startup Name</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-500" />
                </div>
              </th>
              <th className="py-3.5 px-6">Vertical</th>
              <th
                onClick={() => handleSort('investmentScore')}
                className="py-3.5 px-6 cursor-pointer hover:text-white transition-colors text-center"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Investment Score</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-500" />
                </div>
              </th>
              <th className="py-3.5 px-6 text-center">Risk Level</th>
              <th className="py-3.5 px-6 text-center">Committee Status</th>
              <th
                onClick={() => handleSort('dateInvestigated')}
                className="py-3.5 px-6 cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Investigated Date</span>
                  <ArrowUpDown className="w-3 h-3 text-gray-500" />
                </div>
              </th>
              <th className="py-3.5 px-6 text-center">Audit Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
            {filteredAndSortedStartups.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  No startup investigations matched your filter settings.
                </td>
              </tr>
            ) : (
              filteredAndSortedStartups.map((startup) => (
                <tr
                  key={startup.id}
                  onClick={() => onSelectStartup(startup)}
                  className={`hover:bg-brand-purple/5 transition-colors cursor-pointer group ${
                    newlyCreatedId === startup.id
                      ? 'bg-brand-purple/10 border-y border-brand-purple/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] animate-pulse'
                      : ''
                  }`}
                >
                  <td className="py-4 px-6 font-medium text-white">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/5">
                        {startup.logo}
                      </span>
                      <div>
                        <div className="font-semibold group-hover:text-brand-purple-light transition-colors flex items-center space-x-2">
                          <span>{startup.name}</span>
                          {newlyCreatedId === startup.id && (
                            <Badge
                              variant="info"
                              glow
                              className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider"
                            >
                              NEW
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 font-normal truncate max-w-xs md:max-w-md">
                          {startup.elevatorPitch}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-xs">{startup.sector}</td>
                  <td className="py-4 px-6 text-center font-bold">
                    <span
                      className={
                        startup.investmentScore >= 80
                          ? 'text-emerald-400'
                          : startup.investmentScore >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }
                    >
                      {startup.investmentScore}
                    </span>
                    <span className="text-[10px] text-gray-500">/100</span>
                  </td>
                  <td className="py-4 px-6 text-center">{getRiskBadge(startup.riskLevel)}</td>
                  <td className="py-4 px-6 text-center">{getStatusBadge(startup.status)}</td>
                  <td className="py-4 px-6 text-right text-gray-400 text-xs">
                    {startup.dateInvestigated}
                  </td>
                  <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectStartup(startup)}
                      className="opacity-70 group-hover:opacity-100 hover:text-brand-purple-light"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      View Audit
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
};
export default StartupList;
