import { FounderAnalyzer } from './FounderAnalyzer';
import { TechnologyAnalyzer } from './TechnologyAnalyzer';
import { FinancialAnalyzer } from './FinancialAnalyzer';
import { MarketAnalyzer } from './MarketAnalyzer';
import { CompetitionAnalyzer } from './CompetitionAnalyzer';
import { LegalAnalyzer } from './LegalAnalyzer';
import { DecisionBuilder } from './DecisionBuilder';
import type { Startup } from './investigationTypes';

export const InvestigationEngine = {
  async runDiligence(formData: {
    name: string;
    founderName: string;
    sector: string;
    fundingStage: string;
    websiteUrl: string;
    githubUrl: string;
    description: string;
  }): Promise<{ startup: Startup }> {
    // Run all analyzers in parallel
    const [founder, tech, finance, market, competition, legal] = await Promise.all([
      FounderAnalyzer.analyze(formData.name, formData.founderName),
      TechnologyAnalyzer.analyze(formData.name, formData.description),
      FinancialAnalyzer.analyze(formData.name, formData.fundingStage),
      MarketAnalyzer.analyze(formData.name, formData.sector),
      CompetitionAnalyzer.analyze(formData.name, formData.sector),
      LegalAnalyzer.analyze(formData.name, formData.description),
    ]);

    // Build the final verdict decision
    const decision = await DecisionBuilder.build({
      founder,
      tech,
      finance,
      market,
      competition,
      legal,
    });

    // Derive scores for backward compatibility with React UI pages
    const total = founder.score + tech.score + finance.score + market.score + competition.score;
    const avgScore = Math.round(total / 5);
    const investmentScore = Math.max(10, Math.min(98, avgScore - Math.round(legal.score / 10)));
    const riskLevel = legal.score < 70 ? 'High' : legal.score < 85 ? 'Medium' : 'Low';

    const startup: Startup = {
      id: `st-${Date.now()}`,
      name: formData.name,
      logo: '🚀',
      elevatorPitch: formData.description,
      sector: formData.sector,
      investmentScore,
      riskLevel: riskLevel as any,
      status: decision.recommendation === 'INVEST' ? 'Approved' : decision.recommendation === 'PASS' ? 'Flagged' : 'Under Review',
      dateInvestigated: new Date().toISOString().split('T')[0],
      metrics: {
        financials: finance.score,
        marketSize: market.score,
        team: founder.score,
        product: tech.score,
      },
      details: {
        summary: decision.reasoning,
        strengths: decision.strengths,
        risks: decision.riskFactors,
        founderBackground: founder.background,
        financialSnapshot: finance.snapshot,
        marketOpportunity: market.opportunity,
        techStackRisk: tech.techStackRisk,
        
        // Exposing rich Decision and Evidence models
        decision,
        evidenceList: decision.supportingEvidence,
      },
    };

    return { startup };
  }
};

export default InvestigationEngine;
