import type { Evidence } from './investigationTypes';
import { getStringHash } from './mockGenerator';

export const FounderAnalyzer = {
  async analyze(name: string, founderName: string, description?: string): Promise<{
    score: number;
    background: string;
    strengths: string[];
    risks: string[];
    evidence: Evidence[];
  }> {
    const seed = getStringHash(name);
    let score = 80 + (seed % 16); // 80 - 95
    if (description && (description.toLowerCase().includes('pitch deck') || description.toLowerCase().includes('.pdf') || description.length > 200)) {
      score = Math.min(98, score + 2);
    }
    
    const background = `${founderName} is the declared executive lead and founder.`;
    const strengths = [
      `Declared founder leadership: ${founderName}.`,
      'Executive leadership profile submitted in diligence materials.'
    ];
    const risks = [
      'Founder professional track record and credentials require independent verification.',
      'Key-person operational dependency on core founding team.'
    ];
    
    const evidence: Evidence[] = [
      {
        source: 'Founder Intake Submission',
        confidence: '90%',
        reason: `Declared executive identity (${founderName}) recorded in diligence intake.`,
        linkedEntities: [founderName],
        timestamp: new Date().toISOString(),
      }
    ];

    return { score, background, strengths, risks, evidence };
  }
};
export default FounderAnalyzer;
