import type { Evidence, FinancialSnapshot } from './investigationTypes';
import { getStringHash } from './mockGenerator';

export const FinancialAnalyzer = {
  async analyze(name: string, fundingStage: string, description?: string): Promise<{
    score: number;
    snapshot: FinancialSnapshot;
    strengths: string[];
    risks: string[];
    evidence: Evidence[];
  }> {
    const seed = getStringHash(name);
    let score = 70 + ((seed >> 6) % 26); // 70 - 95
    if (description && (description.toLowerCase().includes('financial') || description.toLowerCase().includes('.xlsx') || description.toLowerCase().includes('.pdf') || description.length > 200)) {
      score = Math.min(98, score + 4);
    }
    
    const snapshot: FinancialSnapshot = {
      revenue: '$1.2M ARR',
      burnRate: '$90k/mo',
      runway: '24 months',
      valuation: '$22M Post-Money',
    };

    const strengths = [
      'SaaS customer invoice ledgers are clean and validated.',
      'Capital efficiency runway verified at 24 months.'
    ];
    const risks = [
      'Net monthly burn rate remains high relative to seed revenue baseline.'
    ];
    
    const evidence: Evidence[] = [
      {
        source: 'Audit Invoice Ledgers',
        confidence: '94%',
        reason: 'SaaS licensing contracts matched with bank deposit ledgers.',
        linkedEntities: ['ARR Revenue'],
        timestamp: new Date().toISOString(),
      },
      {
        source: 'Series A Term Sheet',
        confidence: '88%',
        reason: 'Investment targets and lead terms fully aligned.',
        linkedEntities: [fundingStage],
        timestamp: new Date().toISOString(),
      }
    ];

    return { score, snapshot, strengths, risks, evidence };
  }
};
export default FinancialAnalyzer;
