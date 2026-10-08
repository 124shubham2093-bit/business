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
      revenue: 'Requires verification',
      burnRate: 'Requires verification',
      runway: 'Requires verification',
      valuation: 'Requires verification',
    };

    const hasFinancials = description && (description.toLowerCase().includes('financial') || description.toLowerCase().includes('.xlsx') || description.toLowerCase().includes('.pdf'));

    const strengths = hasFinancials ? [
      'Financial documentation and diligence overview submitted for review.',
      `Target capitalization stage declared as ${fundingStage}.`
    ] : [
      `Target funding stage declared as ${fundingStage} in diligence intake.`
    ];

    const risks = [
      'Private-company financial performance is not publicly verified.',
      'Revenue, burn rate, and cash runway were not established from reviewed evidence.',
      'Customer contracts, subscription invoicing, and bank records require verification.'
    ];
    
    const evidence: Evidence[] = [
      {
        source: 'Financial Intake Submission',
        confidence: '85%',
        reason: 'Preliminary financial profile recorded; formal audit reconciliation required.',
        linkedEntities: [fundingStage],
        timestamp: new Date().toISOString(),
      }
    ];

    return { score, snapshot, strengths, risks, evidence };
  }
};
export default FinancialAnalyzer;
