import type { Evidence } from './investigationTypes';
import { getStringHash } from './mockGenerator';

export const CompetitionAnalyzer = {
  async analyze(name: string, sector: string): Promise<{
    score: number;
    strengths: string[];
    risks: string[];
    evidence: Evidence[];
  }> {
    const seed = getStringHash(name);
    const score = 72 + ((seed >> 8) % 23); // 72 - 94
    
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
