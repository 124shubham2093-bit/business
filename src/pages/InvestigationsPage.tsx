import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpRight, Trash2 } from 'lucide-react';
import type { Startup } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface InvestigationsPageProps {
  startups: Startup[];
  searchQuery: string;
  onSelectStartup: (startup: Startup) => void;
  onDeleteStartup?: (id: string) => Promise<void> | void;
}

export const InvestigationsPage: React.FC<InvestigationsPageProps> = ({
  startups,
  searchQuery,
  onSelectStartup,
  onDeleteStartup,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Approved' | 'Under Review' | 'Flagged'>('All');
  const [startupToDelete, setStartupToDelete] = useState<Startup | null>(null);

  // Combined filters
  const filtered = useMemo(() => {
    return startups.filter((s) => {
      // Name, Pitch or Sector search
      const term = (localSearch || searchQuery).toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(term) ||
        s.sector.toLowerCase().includes(term) ||
        s.elevatorPitch.toLowerCase().includes(term);

      const matchesRisk = selectedRisk === 'All' || s.riskLevel === selectedRisk;
      const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;

      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [startups, localSearch, searchQuery, selectedRisk, selectedStatus]);

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold font-display tracking-tight text-[var(--text-primary)] m-0">
              Due Diligence Investigations
            </h1>
            <Badge variant="default" className="text-xs font-mono">
              {filtered.length} targets
            </Badge>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Browse due diligence investigations, founder assessments, and multi-agent risk reviews.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 sm:p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search startup, sector, or investment thesis..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 text-xs">
          {/* Risk Dropdown */}
          <div className="flex items-center space-x-1.5 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg px-3 py-1.5">
            <span className="text-[var(--text-secondary)] font-medium text-[11px]">Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as any)}
              className="bg-transparent text-[var(--text-primary)] font-medium text-xs outline-none cursor-pointer"
            >
              <option value="All" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">All Tiers</option>
              <option value="Low" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Low Risk</option>
              <option value="Medium" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Medium Risk</option>
              <option value="High" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">High Risk</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-1.5 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg px-3 py-1.5">
            <span className="text-[var(--text-secondary)] font-medium text-[11px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-transparent text-[var(--text-primary)] font-medium text-xs outline-none cursor-pointer"
            >
              <option value="All" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">All Statuses</option>
              <option value="Approved" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Approved</option>
              <option value="Under Review" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Under Review</option>
              <option value="Flagged" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Flagged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Startup Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl">
            <p className="text-sm font-medium">No investigations match the selected filters.</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Try resetting the search query or risk filters.</p>
          </div>
        ) : (
          filtered.map((startup) => (
            <motion.div key={startup.id} variants={cardVariants} className="h-full">
              <Card className="flex flex-col h-full overflow-hidden group border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-indigo-500/40 hover:shadow-md transition-all duration-200">
                {/* Header */}
                <CardHeader className="relative p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                      {startup.logo}
                    </span>
                    <div className="flex space-x-1.5">
                      <Badge
                        variant={
                          startup.riskLevel === 'Low'
                            ? 'success'
                            : startup.riskLevel === 'Medium'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {startup.riskLevel} Risk
                      </Badge>
                      <Badge
                        variant={
                          startup.status === 'Approved'
                            ? 'success'
                            : startup.status === 'Under Review'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {startup.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3.5">
                    <CardTitle className="text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {startup.name}
                    </CardTitle>
                    <p className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider mt-1">
                      {startup.sector}
                    </p>
                  </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="px-5 py-2 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {startup.elevatorPitch}
                  </p>

                  {/* Summary progress metric indicators */}
                  <div className="space-y-1.5 mt-4 pt-3 border-t border-[var(--border-color)]">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[var(--text-secondary)]">Diligence Score</span>
                      <span className="font-bold font-mono text-[var(--text-primary)]">{startup.investmentScore}/100</span>
                    </div>
                    <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          startup.investmentScore >= 80
                            ? 'bg-emerald-500'
                            : startup.investmentScore >= 60
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${startup.investmentScore}%` }}
                      />
                    </div>
                  </div>
                </CardContent>

                {/* Footer action */}
                <div className="p-4 px-5 mt-3 flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-subtle)]/40">
                  <span className="text-[11px] text-[var(--text-secondary)] font-mono">Runway: {startup.details.financialSnapshot.runway}</span>
                  <div className="flex items-center space-x-2">
                    {onDeleteStartup && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStartupToDelete(startup);
                        }}
                        className="h-8 py-1 px-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                        title="Delete Investigation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onSelectStartup(startup)}
                      className="h-8 py-1 px-3 text-xs"
                    >
                      View Diligence Report
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      {startupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text-primary)]">Delete Investigation</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Are you sure you want to delete the investigation for <strong className="text-[var(--text-primary)]">{startupToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStartupToDelete(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  if (onDeleteStartup) {
                    await onDeleteStartup(startupToDelete.id);
                  }
                  setStartupToDelete(null);
                }}
                className="text-xs bg-rose-600 hover:bg-rose-700 text-white border-rose-600"
              >
                Delete Investigation
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
export default InvestigationsPage;
