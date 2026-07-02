import asyncio
from app.agents.founder_agent import FounderAgent
from app.agents.technology_agent import TechnologyAgent
from app.agents.financial_agent import FinancialAgent
from app.agents.market_agent import MarketAgent
from app.agents.competition_agent import CompetitionAgent
from app.agents.legal_agent import LegalAgent
from app.agents.decision_agent import DecisionAgent
from typing import Dict, Any

class InvestigationEngine:
    @staticmethod
    async def run_diligence(startup_id: str) -> Dict[str, Any]:
        # Run all agent assessments in parallel
        results = await asyncio.gather(
            FounderAgent.analyze(startup_id),
            TechnologyAgent.analyze(startup_id),
            FinancialAgent.analyze(startup_id),
            MarketAgent.analyze(startup_id),
            CompetitionAgent.analyze(startup_id),
            LegalAgent.analyze(startup_id)
        )

        analyses = {
            "founder": results[0],
            "tech": results[1],
            "finance": results[2],
            "market": results[3],
            "competition": results[4],
            "legal": results[5],
        }

        # Aggregate analyses into final report
        decision = await DecisionAgent.compile_decision(startup_id, analyses)
        return {
            "analyses": analyses,
            "decision": decision
        }
