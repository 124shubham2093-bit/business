import type { Evidence } from './investigationTypes';
import { getStringHash } from './mockGenerator';

export const LegalAnalyzer = {
  async analyze(name: string, description: string): Promise<{
    score: number;
    strengths: string[];
    risks: string[];
    evidence: Evidence[];
  }> {
    const seed = getStringHash(name);
    let score = 65 + ((seed >> 10) % 24); // 65 - 88
    if (description && (description.toLowerCase().includes('pitch deck') || description.toLowerCase().includes('.pdf') || description.length > 200)) {
      score = Math.min(98, score + 2);
    }
    
    const strengths = [
      'Corporate identity and declared business structure submitted for compliance review.',
      'Regulatory and commercial diligence profile noted.'
    ];
    const risks = [
      'Corporate legal registration, cap table, and IP assignment require formal verification.',
      'Regulatory compliance, data security certifications, and governance frameworks require documentation audit.'
    ];
    
    const evidence: Evidence[] = [
      {
        source: 'Corporate Compliance Intake',
        confidence: '85%',
        reason: 'Declared entity structure and commercial profile recorded for legal review.',
        linkedEntities: [name],
        timestamp: new Date().toISOString(),
      }
    ];

    return { score, strengths, risks, evidence };
  }
};
export default LegalAnalyzer;
