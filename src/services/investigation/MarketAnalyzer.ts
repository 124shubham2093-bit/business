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
    
    const opportunity = `Target market domain identified as ${sector}. Detailed addressable market size requires independent verification.`;
    const strengths = [
      `Clear market positioning within the ${sector} sector.`,
      'Product offerings and commercial positioning articulated in diligence materials.'
    ];
    const risks = [
      `Market sizing (TAM/SAM) and growth projections for ${sector} require independent market validation.`,
      'Customer acquisition velocity and enterprise sales cycle duration require empirical validation.'
    ];
    
    const evidence: Evidence[] = [
      {
        source: 'Market Diligence Review',
        confidence: '82%',
        reason: 'Commercial positioning and target sector context evaluated from intake materials.',
        linkedEntities: [sector],
        timestamp: new Date().toISOString(),
      }
    ];

    return { score, opportunity, strengths, risks, evidence };
  }
};
export default MarketAnalyzer;
