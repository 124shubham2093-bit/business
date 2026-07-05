import React, { useState, useEffect } from 'react';
import { Network, Share2, Code2, User, Building, Coins, Layers, Loader2, Sparkles } from 'lucide-react';
import { getCrossMemoryInsights, type CrossMemoryInsight } from '../../services/investigation/BackendInvestigationService';
import { Card } from '../ui/Card';

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

  const filteredInsights = insights
    .filter(item => !isGarbageLabel(item.label))
    .sort((a, b) => b.sourceCount - a.sourceCount)
    .slice(0, 6);

  const getDisplayCategory = (type: string, relationship: string, label: string): string => {
    const l = label.toLowerCase();
    const r = relationship.toLowerCase();
    const t = type.toLowerCase();

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

  const getIconForType = (category: string) => {
    if (category === 'Technology') {
      return <Code2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
    }
    if (category === 'Investor') {
      return <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
    if (category === 'Founder') {
      return <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    }
    if (category === 'Company') {
      return <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    return <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
  };

  const getBadgeStyle = (category: string) => {
    if (category === 'Technology') {
      return 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40';
    }
    if (category === 'Investor') {
      return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40';
    }
    return 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40';
  };

  return (
    <Card className="border border-[var(--border-color)] bg-[var(--bg-subtle)] overflow-hidden shadow-sm">
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
              Cognee continuously identifies recurring founders, technologies, investors, and companies across every investigation to surface portfolio-wide intelligence.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-center">
          <span className="text-xs font-mono font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-lg border border-[var(--border-color)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>{isLoading ? 'Scanning...' : `${filteredInsights.length} Shared Knowledge Connections`}</span>
          </span>
        </div>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-xs text-[var(--text-secondary)] space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span>Querying Cognee SQLite memory provenance graph...</span>
          </div>
        ) : filteredInsights.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-surface)]">
            <Share2 className="w-8 h-8 mx-auto text-[var(--text-secondary)] opacity-40 mb-2" />
            <p className="text-xs font-semibold text-[var(--text-primary)] m-0">
              No meaningful cross-investigation patterns have been discovered yet.
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] mt-1 max-w-md mx-auto m-0">
              Upload additional startup investigations to allow Cognee to build cross-document intelligence.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredInsights.map((item, idx) => {
              const category = getDisplayCategory(item.type, item.relationship, item.label);
              const badgeStyle = getBadgeStyle(category);
              const sourceWording = category === 'Technology' 
                ? `Used by ${item.sourceCount} ${item.sourceCount === 1 ? 'Investigation' : 'Investigations'}`
                : `Appears in ${item.sourceCount} ${item.sourceCount === 1 ? 'Investigation' : 'Investigations'}`;

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-indigo-500/40 transition-all duration-200 flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] flex-shrink-0 mt-0.5">
                      {getIconForType(category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[var(--text-primary)] m-0 truncate capitalize font-sans">
                        {item.label}
                      </p>
                      <div className="mt-1">
                        <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                          {category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`px-2 py-1 rounded-lg border font-mono text-[11px] font-bold flex-shrink-0 whitespace-nowrap shadow-2xs ${badgeStyle}`}>
                    {sourceWording}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

