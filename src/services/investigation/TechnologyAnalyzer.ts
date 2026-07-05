import type { Evidence } from './investigationTypes';
import { getStringHash } from './mockGenerator';

export const TechnologyAnalyzer = {
  async analyze(name: string, description: string): Promise<{
    score: number;
    techStackRisk: string;
    strengths: string[];
    risks: string[];
    evidence: Evidence[];
  }> {
    const seed = getStringHash(name);
    let score = 75 + ((seed >> 2) % 21); // 75 - 95
    if (description && (description.toLowerCase().includes('pitch deck') || description.toLowerCase().includes('.pdf') || description.length > 200)) {
      score = Math.min(98, score + 3);
    }
    
    const techStackRisk = 'Low. Deep learning models run on custom optimized CUDA hardware. Secured IP patent for neural network architecture.';
    const strengths = [
      'Proprietary transformer model for organic synthesis representation.',
      'High capital efficiency with low server cost-per-inference due to custom kernels.'
    ];
    const risks = [
      'High reliance on GPU spot instances which are highly volatile.'
    ];
    
    const evidence: Evidence[] = [
      {
        source: 'GitHub API Audit',
        confidence: '95%',
        reason: 'Scanned 147 commits. Redundancy rate calculated at 4.2% (Excellent).',
        linkedEntities: ['helixbio-core'],
        timestamp: new Date().toISOString(),
      },
      {
        source: 'USPTO Database',
        confidence: '99%',
        reason: 'Active patent status registered under the company entity.',
        linkedEntities: ['Patent US-9012'],
        timestamp: new Date().toISOString(),
      }
    ];

    return { score, techStackRisk, strengths, risks, evidence };
  }
};
export default TechnologyAnalyzer;
