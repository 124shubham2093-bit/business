import type { Decision, Evidence } from './investigationTypes';

export const DecisionBuilder = {
  async build(analyses: {
    founder: { score: number; strengths: string[]; risks: string[]; evidence: Evidence[] };
    tech: { score: number; strengths: string[]; risks: string[]; evidence: Evidence[] };
    finance: { score: number; strengths: string[]; risks: string[]; evidence: Evidence[] };
    market: { score: number; strengths: string[]; risks: string[]; evidence: Evidence[] };
    competition: { score: number; strengths: string[]; risks: string[]; evidence: Evidence[] };
    legal: { score: number; strengths: string[]; risks: string[]; evidence: Evidence[] };
  }): Promise<Decision> {
    const { founder, tech, finance, market, competition, legal } = analyses;
    
    // Calculate final investment index
    const total = founder.score + tech.score + finance.score + market.score + competition.score;
    const avgScore = Math.round(total / 5);
    const investmentScore = Math.max(10, Math.min(98, avgScore - Math.round(legal.score / 10)));
    
    let recommendation: 'INVEST' | 'UNDER REVIEW' | 'PASS' = 'UNDER REVIEW';
    if (investmentScore >= 80) {
      recommendation = 'INVEST';
    } else if (investmentScore < 60) {
      recommendation = 'PASS';
    }

    const confidence = '90%';
    const reasoning = `Diligence assessment completes with an investment score of ${investmentScore}/100. Core strengths and risk factors synthesized across founder, technical, financial, market, competitive, and legal dimensions.`;

    const supportingEvidence: Evidence[] = [
      ...founder.evidence,
      ...tech.evidence,
      ...finance.evidence,
      ...market.evidence,
      ...competition.evidence,
      ...legal.evidence,
    ];

    const riskFactors = [
      ...founder.risks,
      ...tech.risks,
      ...finance.risks,
      ...market.risks,
      ...competition.risks,
      ...legal.risks,
    ];

    const strengths = [
      ...founder.strengths,
      ...tech.strengths,
      ...finance.strengths,
      ...market.strengths,
      ...competition.strengths,
      ...legal.strengths,
    ];

    const weaknesses = riskFactors;

    return {
      recommendation,
      confidence,
      reasoning,
      supportingEvidence,
      riskFactors,
      strengths,
      weaknesses,
    };
  }
};
export default DecisionBuilder;
