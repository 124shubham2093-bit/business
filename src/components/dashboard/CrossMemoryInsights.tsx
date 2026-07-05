import React, { useState, useEffect, useMemo } from 'react';
import { Network, Share2, Code2, User, Building, Coins, Loader2, TrendingUp, Lightbulb } from 'lucide-react';
import { getCrossMemoryInsights, type CrossMemoryInsight } from '../../services/investigation/BackendInvestigationService';
import { Card } from '../ui/Card';

// ─── Category Classification ─────────────────────────────────────────────────

type EntityCategory = 'Technology' | 'Investor' | 'Founder' | 'Company';

interface CategorizedInsight extends CrossMemoryInsight {
  category: EntityCategory;
}

const classifyCategory = (item: CrossMemoryInsight): EntityCategory => {
  const l = item.label.toLowerCase();
  const r = item.relationship.toLowerCase();
  const t = item.type.toLowerCase();

  if (r === 'uses' || l.includes('react') || l.includes('fastapi') || l.includes('cuda') || l.includes('tensorflow') || l.includes('python') || l.includes('tech') || t.includes('tech')) {
    return 'Technology';
  }
  if (t.includes('founder') || r.includes('found') || l.includes('sharma') || l.includes('jenkins') || l.includes('rivera') || l.includes('dr.')) {
    return 'Founder';
  }
  if (t.includes('investor') || r.includes('invest') || l.includes('venture') || l.includes('combinator') || l.includes('capital') || l.includes('fund') || l.includes('peak')) {
    return 'Investor';
  }
  return 'Company';
};

// ─── Garbage Filter ───────────────────────────────────────────────────────────

const isGarbageLabel = (label: string): boolean => {
  const l = label.trim().toLowerCase();
  if (l.length < 3) return true;

  const garbagePatterns = [
    'fdh', 'fggv', 'test', 'asdf', 'qwerty', 'abc', 'xyz', 'demo',
    'sample', 'dummy', 'hfdg', 'hyt', 'foo', 'bar', 'baz', 'temp', 'untitled'
  ];
  if (garbagePatterns.some(p => l.includes(p))) return true;
  if (/^[bcdfghjklmnpqrstvwxyz]{5,}$/i.test(l)) return true;

  return false;
};

// ─── Wording per Category ─────────────────────────────────────────────────────

const getSourceWording = (category: EntityCategory, count: number): string => {
  const plural = count === 1 ? 'investigation' : 'investigations';
  switch (category) {
    case 'Technology':
      return `Referenced across ${count} startup ${plural}`;
    case 'Investor':
      return `Participated in ${count} ${plural}`;
    case 'Founder':
      return `Appears in ${count} startup ${plural}`;
    case 'Company':
      return `Evaluated across ${count} ${plural}`;
  }
};

// ─── Section Config ───────────────────────────────────────────────────────────

interface SectionConfig {
  title: string;
  icon: React.ReactNode;
  accentClass: string;
  badgeClass: string;
}

const SECTION_CONFIG: Record<EntityCategory, SectionConfig> = {
  Technology: {
    title: 'Technology Trends',
    icon: <Code2 className="w-4 h-4" />,
    accentClass: 'text-cyan-600 dark:text-cyan-400',
    badgeClass: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40',
  },
  Investor: {
    title: 'Investor Trends',
    icon: <Coins className="w-4 h-4" />,
    accentClass: 'text-amber-600 dark:text-amber-400',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
  },
  Founder: {
    title: 'Founder Trends',
    icon: <User className="w-4 h-4" />,
    accentClass: 'text-indigo-600 dark:text-indigo-400',
    badgeClass: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
  },
  Company: {
    title: 'Company Trends',
    icon: <Building className="w-4 h-4" />,
    accentClass: 'text-emerald-600 dark:text-emerald-400',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
  },
};

const SECTION_ORDER: EntityCategory[] = ['Technology', 'Investor', 'Founder', 'Company'];

// ─── Deterministic AI Portfolio Insight Generator ─────────────────────────────

const generatePortfolioInsights = (grouped: Record<EntityCategory, CategorizedInsight[]>): string[] => {
  const insights: string[] = [];

  // Technology concentration
  const techHighFreq = grouped.Technology.filter(t => t.sourceCount >= 3);
  if (techHighFreq.length >= 2) {
    const names = techHighFreq.slice(0, 3).map(t => t.label).join(' and ');
    insights.push(`Technology concentration detected around ${names} across the portfolio.`);
  } else if (techHighFreq.length === 1) {
    insights.push(`${techHighFreq[0].label} is a dominant technology dependency across ${techHighFreq[0].sourceCount} investigations.`);
  }

  // Investor recurrence
  const investorHighFreq = grouped.Investor.filter(i => i.sourceCount >= 2);
  if (investorHighFreq.length >= 2) {
    const names = investorHighFreq.slice(0, 2).map(i => i.label).join(' and ');
    insights.push(`Recurring investor participation identified: ${names} appear across multiple investigations.`);
  } else if (investorHighFreq.length === 1) {
    insights.push(`${investorHighFreq[0].label} has been identified across ${investorHighFreq[0].sourceCount} portfolio investigations.`);
  }

  // Founder overlap
  const founderHighFreq = grouped.Founder.filter(f => f.sourceCount >= 2);
  if (founderHighFreq.length >= 1) {
    const names = founderHighFreq.slice(0, 2).map(f => f.label).join(' and ');
    insights.push(`Founder overlap detected: ${names} appears across multiple startup investigations.`);
  }

  // Company breadth
  const totalEntities = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
  if (totalEntities >= 6) {
    insights.push(`Portfolio knowledge graph contains ${totalEntities} cross-referenced entities, enabling pattern-based due diligence.`);
  }

  return insights;
};

// ─── Component ────────────────────────────────────────────────────────────────

export const CrossMemoryInsights: React.FC = () => {
  const [insights, setInsights] = useState<CrossMemoryInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        const data = await getCrossMemoryInsights();
        if (isMounted) {
          setInsights(data);
        }
      } catch (err) {
        if (isMounted) {
          setInsights([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInsights();
    return () => {
      isMounted = false;
    };
  }, []);

  // Classify, filter, sort
  const categorized: CategorizedInsight[] = useMemo(() => {
    return insights
      .filter(item => !isGarbageLabel(item.label))
      .map(item => ({ ...item, category: classifyCategory(item) }))
      .sort((a, b) => b.sourceCount - a.sourceCount);
  }, [insights]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<EntityCategory, CategorizedInsight[]> = {
      Technology: [],
      Investor: [],
      Founder: [],
      Company: [],
    };
    for (const item of categorized) {
      groups[item.category].push(item);
    }
    return groups;
  }, [categorized]);

  // Only sections that have data
  const activeSections = useMemo(() => {
    return SECTION_ORDER.filter(cat => grouped[cat].length > 0);
  }, [grouped]);

  // Deterministic portfolio insights
  const portfolioInsights = useMemo(() => {
    return generatePortfolioInsights(grouped);
  }, [grouped]);

  const totalConnections = categorized.length;

  return (
    <Card className="border border-[var(--border-color)] bg-[var(--bg-subtle)] overflow-hidden shadow-sm">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="p-5 border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg-surface)]">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold font-display text-[var(--text-primary)] m-0 tracking-tight">
                Cross-Investigation Intelligence
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Cognee Memory
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1 m-0">
              Recurring entities identified across all startup investigations by the Cognee knowledge graph.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-center">
          <span className="text-xs font-mono font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-lg border border-[var(--border-color)] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>{isLoading ? 'Scanning...' : `${totalConnections} Cross-Referenced Entities`}</span>
          </span>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-xs text-[var(--text-secondary)] space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span>Querying Cognee knowledge graph memory...</span>
          </div>
        ) : totalConnections === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-surface)]">
            <Share2 className="w-8 h-8 mx-auto text-[var(--text-secondary)] opacity-40 mb-2" />
            <p className="text-xs font-semibold text-[var(--text-primary)] m-0">
              No cross-investigation patterns detected yet.
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 max-w-md mx-auto m-0">
              Run additional startup investigations to allow Cognee to identify shared entities across your portfolio.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ── Grouped Sections ──────────────────────────────────────────── */}
            {activeSections.map(category => {
              const config = SECTION_CONFIG[category];
              const items = grouped[category];

              return (
                <div key={category}>
                  {/* Section Header */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={config.accentClass}>{config.icon}</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] m-0">
                      {config.title}
                    </h4>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">
                      {items.length}
                    </span>
                  </div>

                  {/* Entity Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {items.map((item, idx) => (
                      <div
                        key={`${category}-${idx}`}
                        className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-indigo-500/30 transition-all duration-200 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className={`p-1.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] flex-shrink-0 ${config.accentClass}`}>
                            {config.icon}
                          </div>
                          <p className="text-xs font-semibold text-[var(--text-primary)] m-0 truncate capitalize font-sans">
                            {item.label}
                          </p>
                        </div>

                        <span className={`px-2 py-1 rounded-lg border font-mono text-[10px] font-bold flex-shrink-0 whitespace-nowrap ${config.badgeClass}`}>
                          {getSourceWording(category, item.sourceCount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* ── AI Portfolio Insight ──────────────────────────────────────── */}
            {portfolioInsights.length > 0 && (
              <div className="mt-2 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 m-0">
                    AI Portfolio Insight
                  </h4>
                </div>
                <ul className="space-y-2 m-0 p-0 list-none">
                  {portfolioInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-indigo-500 dark:text-indigo-400 mt-0.5 flex-shrink-0 text-[10px]">●</span>
                      <p className="text-xs text-[var(--text-primary)] m-0 leading-relaxed">
                        {insight}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
