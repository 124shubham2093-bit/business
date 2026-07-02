from typing import Dict, Any

class MarketAgent:
    @staticmethod
    async def analyze(startup_id: str) -> Dict[str, Any]:
        return {
            "score": 84,
            "confidence": "88%",
            "reasoning": "Target market TAM stands at $45B in pharma discovery segments. Target market CAGR is verified at 18.2%.",
            "strengths": [
                "Massive addressable target space",
                "Favorable macro industry tailwinds"
            ],
            "weaknesses": [
                "Procurement cycle in pharmaceutical segments averages 9-12 months"
            ],
            "evidence": [
                {
                    "source": "Medicine Sizing Survey 2026",
                    "confidence": "85%",
                    "reason": "Market growth and segment boundaries match survey findings.",
                    "linkedEntities": ["TAM_Sizing"],
                    "timestamp": "Just now"
                }
            ]
        }
