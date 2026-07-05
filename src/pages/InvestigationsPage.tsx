import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpRight } from 'lucide-react';
import type { Startup } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

interface InvestigationsPageProps {
  startups: Startup[];
  searchQuery: string;
  onSelectStartup: (startup: Startup) => void;
}

export const InvestigationsPage: React.FC<InvestigationsPageProps> = ({
  startups,
  searchQuery,
  onSelectStartup,
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Approved' | 'Under Review' | 'Flagged'>('All');

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
          <h1 className="text-3xl font-bold font-display tracking-tight text-[var(--text-primary)] m-0">
            Due Diligence Explorer
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Browse corporate filings, founder background checks, and automated tech audits.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search startup investigations..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* Risk Dropdown */}
          <div className="flex items-center space-x-1.5 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5">
            <span className="text-[var(--text-secondary)]">Risk Tier:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as any)}
              className="bg-transparent text-[var(--text-primary)] outline-none cursor-pointer"
            >
              <option value="All" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">All Tiers</option>
              <option value="Low" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Low Risk</option>
              <option value="Medium" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">Medium Risk</option>
              <option value="High" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">High Risk</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-1.5 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5">
            <span className="text-[var(--text-secondary)]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-transparent text-[var(--text-primary)] outline-none cursor-pointer"
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
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-500">
            No audits matched your exploration filters.
          </div>
        ) : (
          filtered.map((startup) => (
            <motion.div key={startup.id} variants={cardVariants} className="h-full">
              <Card glow className="flex flex-col h-full overflow-hidden group">
                {/* Header */}
                <CardHeader className="relative p-5">
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
                        glow={startup.status === 'Approved'}
                      >
                        {startup.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4">
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
                  <div className="space-y-2 mt-4 pt-3 border-t border-[var(--border-color)]">
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                      <span>Evaluation Index Rating</span>
                      <span className="font-bold text-[var(--text-primary)]">{startup.investmentScore}/100</span>
                    </div>
                    <div className="w-full bg-[var(--bg-subtle)] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full"
                        style={{ width: `${startup.investmentScore}%` }}
                      />
                    </div>
                  </div>
                </CardContent>

                {/* Footer action */}
                <div className="p-5 pt-0 mt-4 flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-subtle)]/50">
                  <span className="text-[10px] text-[var(--text-secondary)]">Runway: {startup.details.financialSnapshot.runway}</span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onSelectStartup(startup)}
                    className="h-8 py-1 px-3 text-xs"
                  >
                    Explore Audit
                    <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
};
export default InvestigationsPage;
