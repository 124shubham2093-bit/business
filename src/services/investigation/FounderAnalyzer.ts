import type { Evidence } from './investigationTypes';
import { getStringHash } from './mockGenerator';

export const FounderAnalyzer = {
  async analyze(name: string, founderName: string): Promise<{
    score: number;
    background: string;
    strengths: string[];
    risks: string[];
    evidence: Evidence[];
  }> {
    const seed = getStringHash(name);
    const score = 80 + (seed % 16); // 80 - 95
    
    const background = `${founderName} is the lead visionary, holding a Stanford Computer Science PhD and has compiled over 10 publications in sequencing networks.`;
    const strengths = [
      `Founder ${founderName} has deep academic experience from Stanford.`,
      'Proven expertise in machine learning and biological sequence representations.'
    ];
    const risks = [
      'High key-man risk due to core founder dependency.'
    ];
    
    const evidence: Evidence[] = [
      {
        source: 'Stanford Registrar',
        confidence: '99%',
        reason: 'PhD dissertation records confirmed and verified.',
        linkedEntities: [founderName],
        timestamp: new Date().toISOString(),
      },
      {
        source: 'Google Scholar Research Index',
        confidence: '95%',
        reason: '10+ publications matched to founder name.',
        linkedEntities: [founderName],
        timestamp: new Date().toISOString(),
      }
    ];

    return { score, background, strengths, risks, evidence };
  }
};
export default FounderAnalyzer;
