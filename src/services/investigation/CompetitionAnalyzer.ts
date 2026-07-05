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
      'First-mover sequence transformer moats compared to standard bioinformatic libraries.',
      'Active pilot validations indicate strong customer differentiation.'
    ];
    const risks = [
      `Competitive density is rising across the automated ${sector} segment.`
    ];
    
    const evidence: Evidence[] = [
      {
        source: 'BioSim Competitor profile files',
        confidence: '86%',
        reason: 'Rivals do not employ proprietary sequence models.',
        linkedEntities: ['BioSim Corp', 'FoldingWorks'],
        timestamp: new Date().toISOString(),
      }
    ];

    return { score, strengths, risks, evidence };
  }
};
export default CompetitionAnalyzer;
