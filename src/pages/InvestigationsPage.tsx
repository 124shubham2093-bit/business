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
          <h1 className="text-3xl font-bold font-display tracking-tight text-white m-0">
            Due Diligence Explorer
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Browse corporate filings, founder background checks, and automated tech audits.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-white/5 bg-white/2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search startup investigations..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white/5 border border-white/5 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/50 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {/* Risk Dropdown */}
          <div className="flex items-center space-x-1.5 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5">
            <span className="text-gray-400">Risk Tier:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as any)}
              className="bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="All" className="bg-dark-bg text-white">All Tiers</option>
              <option value="Low" className="bg-dark-bg text-white">Low Risk</option>
              <option value="Medium" className="bg-dark-bg text-white">Medium Risk</option>
              <option value="High" className="bg-dark-bg text-white">High Risk</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center space-x-1.5 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5">
            <span className="text-gray-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="All" className="bg-dark-bg text-white">All Statuses</option>
              <option value="Approved" className="bg-dark-bg text-white">Approved</option>
              <option value="Under Review" className="bg-dark-bg text-white">Under Review</option>
              <option value="Flagged" className="bg-dark-bg text-white">Flagged</option>
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
                    <span className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/5">
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
                    <CardTitle className="text-base group-hover:text-brand-purple-light transition-colors duration-200">
                      {startup.name}
                    </CardTitle>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-1">
                      {startup.sector}
                    </p>
                  </div>
                </CardHeader>

                {/* Content */}
                <CardContent className="px-5 py-2 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                    {startup.elevatorPitch}
                  </p>

                  {/* Summary progress metric indicators */}
                  <div className="space-y-2 mt-4 pt-3 border-t border-white/5">
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Evaluation Index Rating</span>
                      <span className="font-bold text-white">{startup.investmentScore}/100</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-purple-light h-full rounded-full"
                        style={{ width: `${startup.investmentScore}%` }}
                      />
                    </div>
                  </div>
                </CardContent>

                {/* Footer action */}
                <div className="p-5 pt-0 mt-4 flex items-center justify-between border-t border-white/5 bg-white/1">
                  <span className="text-[10px] text-gray-500">Runway: {startup.details.financialSnapshot.runway}</span>
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
