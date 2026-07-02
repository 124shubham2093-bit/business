import type { GeneratedScores, InvestigationStats } from './investigationTypes';

export function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function generateScores(name: string, _sector: string): GeneratedScores {
  const seed = getStringHash(name);
  
  const founder = 80 + (seed % 16); // 80 - 95
  const technology = 75 + ((seed >> 2) % 21); // 75 - 95
  const market = 78 + ((seed >> 4) % 18); // 78 - 95
  const finance = 70 + ((seed >> 6) % 26); // 70 - 95
  const competition = 72 + ((seed >> 8) % 23); // 72 - 94
  const risk = 12 + ((seed >> 10) % 24); // 12 - 35
  
  const total = founder + technology + market + finance + competition;
  const avg = Math.round(total / 5);
  const investmentScore = Math.max(10, Math.min(98, avg - Math.round(risk / 5)));
  
  let recommendation: 'INVEST' | 'UNDER REVIEW' | 'PASS' = 'UNDER REVIEW';
  if (investmentScore >= 80) {
    recommendation = 'INVEST';
  } else if (investmentScore < 60) {
    recommendation = 'PASS';
  }
  
  return {
    investmentScore,
    founder,
    technology,
    market,
    finance,
    competition,
    risk,
    recommendation,
  };
}

export function generateStats(name: string): InvestigationStats {
  const seed = getStringHash(name + 'stats');
  
  const entities = 30 + (seed % 25); // 30 - 54
  const relationships = 110 + ((seed >> 2) % 120); // 110 - 229
  const documents = 6 + ((seed >> 4) % 6); // 6 - 11
  const signals = 35 + ((seed >> 6) % 35); // 35 - 69
  const confidence = `${88 + ((seed >> 8) % 9)}%`; // 88% - 96%
  
  return {
    entities,
    relationships,
    documents,
    signals,
    confidence,
  };
}
