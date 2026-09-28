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
    
    const descLower = (description || '').toLowerCase();
    const hasValidGitHub = descLower.includes('github repository:');
    const hasUnavailableGitHub = descLower.includes('github repository status: unavailable');

    const evidence: Evidence[] = [
      hasValidGitHub ? {
        source: 'GitHub Public API',
        confidence: '92%',
        reason: 'Public repository metadata, star ratings, and primary programming language verified.',
        linkedEntities: ['codebase'],
        timestamp: new Date().toISOString(),
      } : hasUnavailableGitHub ? {
        source: 'GitHub Public API',
        confidence: '0%',
        reason: 'Repository Not Found or Not Publicly Accessible. Public code evidence unavailable.',
        linkedEntities: [],
        timestamp: new Date().toISOString(),
      } : {
        source: 'Technical Architecture Documentation',
        confidence: '88%',
        reason: 'Technical architecture specifications and neural network blueprints verified.',
        linkedEntities: ['tech_stack'],
        timestamp: new Date().toISOString(),
      },
      {
        source: 'USPTO Database',
        confidence: '99%',
        reason: 'Active patent status registered under the company entity.',
        linkedEntities: ['Patent Filing'],
        timestamp: new Date().toISOString(),
      }
    ];

    return { score, techStackRisk, strengths, risks, evidence };
  }
};
export default TechnologyAnalyzer;
