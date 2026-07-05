import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, TrendingUp, DollarSign, Calendar, Landmark, Plus } from 'lucide-react';
import type { Startup } from '../../types';
import { Button } from '../ui/Button';
import { StartupDiligenceFlow } from './StartupDiligenceFlow';

interface StartupDrawerProps {
  startup: Startup | null;
  onClose: () => void;
  onUpdateStartup: (updatedStartup: Startup) => void;
}

export const StartupDrawer: React.FC<StartupDrawerProps> = ({
  startup,
  onClose,
  onUpdateStartup,
}) => {
  const [newNote, setNewNote] = useState('');
  const [localNotes, setLocalNotes] = useState<string[]>([]);

  if (!startup) return null;

  const handleStatusChange = (status: Startup['status']) => {
    onUpdateStartup({
      ...startup,
      status,
    });
  };

  const handleRiskChange = (riskLevel: Startup['riskLevel']) => {
    onUpdateStartup({
      ...startup,
      riskLevel,
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setLocalNotes([...localNotes, newNote.trim()]);
    setNewNote('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop filter overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Panel body */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className="relative w-full max-w-3xl h-full bg-[var(--bg-surface)] backdrop-blur-md border-l border-[var(--border-color)] shadow-2xl flex flex-col z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-subtle)]">
            <div className="flex items-center space-x-3">
              <span className="text-3xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-color)]">
                {startup.logo}
              </span>
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">{startup.name}</h2>
                <p className="text-xs text-[var(--text-secondary)]">{startup.sector} • Investigated {startup.dateInvestigated}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Scroll Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Actions Board */}
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/20 space-y-3">
              <h4 className="text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                Auditor Action Committee Controls
              </h4>
              <div className="flex flex-wrap gap-4 items-center justify-between text-xs">
                {/* Status selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-[var(--text-secondary)]">Set Diligence Status:</span>
                  <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)]">
                    {(['Approved', 'Under Review', 'Flagged'] as Startup['status'][]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                          startup.status === st
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]/80 hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Risk Level Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-[var(--text-secondary)]">Audit Risk Tier:</span>
                  <div className="flex rounded-lg overflow-hidden border border-[var(--border-color)]">
                    {(['Low', 'Medium', 'High'] as Startup['riskLevel'][]).map((rk) => (
                      <button
                        key={rk}
                        onClick={() => handleRiskChange(rk)}
                        className={`px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                          startup.riskLevel === rk
                            ? rk === 'Low'
                              ? 'bg-emerald-600 text-white'
                              : rk === 'Medium'
                              ? 'bg-amber-600 text-white'
                              : 'bg-rose-600 text-white'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]/80 hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {rk}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Evaluation Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: 'Founders', val: startup.metrics.team },
                { name: 'Market Size', val: startup.metrics.marketSize },
                { name: 'Product/Tech', val: startup.metrics.product },
                { name: 'Financials', val: startup.metrics.financials },
              ].map((m, idx) => (
                <div key={idx} className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-xl text-center">
                  <span className="text-[10px] text-[var(--text-secondary)] font-medium block uppercase tracking-wider">
                    {m.name}
                  </span>
                  <span
                    className={`text-2xl font-bold font-display block mt-1 ${
                      m.val >= 80
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : m.val >= 60
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {m.val}
                    <span className="text-xs font-normal text-[var(--text-secondary)]">/100</span>
                  </span>
                </div>
              ))}
            </div>

            {/* React Flow diligence pipeline */}
            <StartupDiligenceFlow startup={startup} />

            {/* Executive Summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Diligence Summary</h3>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed bg-[var(--bg-subtle)] p-4 rounded-xl border border-[var(--border-color)]">
                {startup.details.summary}
              </p>
            </div>

            {/* Financial Snapshot */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Financial Diligence</h3>
              <div className="grid grid-cols-2 gap-4 bg-[var(--bg-subtle)] border border-[var(--border-color)] p-4 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">Current ARR</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {startup.details.financialSnapshot.revenue}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">Monthly Burn</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {startup.details.financialSnapshot.burnRate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">Runway</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {startup.details.financialSnapshot.runway}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="text-[10px] text-[var(--text-secondary)] block">Estimated Valuation</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      {startup.details.financialSnapshot.valuation}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Risks Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Key Strengths</h4>
                <ul className="space-y-2">
                  {startup.details.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-[var(--text-primary)]">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase text-rose-600 dark:text-rose-400 tracking-wider">Identified Risks</h4>
                <ul className="space-y-2">
                  {startup.details.risks.map((rsk, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-[var(--text-primary)]">
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                      <span>{rsk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Technical Detail Writeups */}
            <div className="space-y-4 pt-2">
              {/* Founder Background */}
              <div className="text-xs space-y-1">
                <span className="text-[var(--text-secondary)] font-semibold uppercase tracking-wider block">Founders Profile</span>
                <p className="text-[var(--text-primary)] leading-relaxed bg-[var(--bg-subtle)] p-3 rounded-lg border border-[var(--border-color)]">
                  {startup.details.founderBackground}
                </p>
              </div>

              {/* Market Opportunity */}
              <div className="text-xs space-y-1">
                <span className="text-[var(--text-secondary)] font-semibold uppercase tracking-wider block">Market TAM & Opportunity</span>
                <p className="text-[var(--text-primary)] leading-relaxed bg-[var(--bg-subtle)] p-3 rounded-lg border border-[var(--border-color)]">
                  {startup.details.marketOpportunity}
                </p>
              </div>

              {/* Tech Stack Risk */}
              <div className="text-xs space-y-1">
                <span className="text-[var(--text-secondary)] font-semibold uppercase tracking-wider block">Architecture & Technology Moat</span>
                <p className="text-[var(--text-primary)] leading-relaxed bg-[var(--bg-subtle)] p-3 rounded-lg border border-[var(--border-color)]">
                  {startup.details.techStackRisk}
                </p>
              </div>
            </div>

            {/* Notes Activity Feed */}
            <div className="space-y-3 border-t border-[var(--border-color)] pt-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Internal Analyst Notes</h3>
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Attach a note to this due diligence assessment..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <Button type="submit" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </form>

              <div className="space-y-2 mt-2">
                {localNotes.length === 0 ? (
                  <p className="text-xs text-[var(--text-secondary)] italic">No notes attached. Enter a comment above.</p>
                ) : (
                  localNotes.map((note, index) => (
                    <div key={index} className="p-3 bg-[var(--bg-subtle)] border border-[var(--border-color)] rounded-lg text-xs flex justify-between items-start">
                      <p className="text-[var(--text-primary)]">{note}</p>
                      <span className="text-[9px] text-[var(--text-secondary)] ml-2 whitespace-nowrap">Just now</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default StartupDrawer;
