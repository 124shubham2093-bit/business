import type { Evidence } from './investigationTypes';
import { getStringHash } from './mockGenerator';

export const CompetitionAnalyzer = {
  async analyze(name: string, sector: string, description?: string): Promise<{
    score: number;
    strengths: string[];
    risks: string[];
    evidence: Evidence[];
  }> {
    const seed = getStringHash(name);
    let score = 72 + ((seed >> 8) % 23); // 72 - 94
    if (description && (description.toLowerCase().includes('pitch deck') || description.toLowerCase().includes('.pdf') || description.length > 200)) {
      score = Math.min(98, score + 2);
    }
    
    const strengths = [
      `Differentiated product value proposition defined for ${sector} domain.`,
      'Target competitive positioning defined in submission materials.'
    ];
    const risks = [
      `Competitive position within ${sector} requires additional market diligence against alternative solutions.`,
      'Defensibility of proprietary IP and customer retention moats requires formal validation.'
    ];
    
    const evidence: Evidence[] = [
      {
        source: 'Competitive Landscape Review',
        confidence: '80%',
        reason: 'Market differentiation claims assessed against sector alternatives.',
        linkedEntities: [sector],
        timestamp: new Date().toISOString(),
      }
    ];

    return { score, strengths, risks, evidence };
  }
};
export default CompetitionAnalyzer;
