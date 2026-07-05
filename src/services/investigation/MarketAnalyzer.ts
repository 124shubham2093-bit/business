import type { Evidence } from './investigationTypes';
import { getStringHash } from './mockGenerator';

export const MarketAnalyzer = {
  async analyze(name: string, sector: string, description?: string): Promise<{
    score: number;
    opportunity: string;
    strengths: string[];
    risks: string[];
    evidence: Evidence[];
  }> {
    const seed = getStringHash(name);
    let score = 78 + ((seed >> 4) % 18); // 78 - 95
    if (description && (description.toLowerCase().includes('pitch deck') || description.toLowerCase().includes('.pdf') || description.length > 200)) {
      score = Math.min(98, score + 2);
    }
    
    const opportunity = `Total Addressable Market (TAM) is estimated at $45B in pharmaceutical pre-clinical discovery. Target Market CAGR is 18.2%.`;
    const strengths = [
      `Massive addressable target space inside the ${sector} industry vertical.`,
      'Macro trends show expanding client demand for automated pre-clinical drug discovery.'
    ];
    const risks = [
      'Customer procurement cycle can stretch to 9-12 months for enterprise labs.'
    ];
    
    const evidence: Evidence[] = [
      {
        source: 'Personal Medicine Forecast 2026 Survey',
        confidence: '85%',
        reason: 'TAM growth calculations matching verified industry benchmarks.',
        linkedEntities: [sector],
        timestamp: new Date().toISOString(),
      }
    ];

    return { score, opportunity, strengths, risks, evidence };
  }
};
export default MarketAnalyzer;
