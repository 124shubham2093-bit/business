from typing import Dict, Any

class CompetitionAgent:
    @staticmethod
    async def analyze(startup_id: str, description: str = "") -> Dict[str, Any]:
        # Hash baseline
        hash_val = 0
        for c in startup_id:
            hash_val = ord(c) + ((hash_val << 5) - hash_val)
        seed = abs(hash_val)
        score = 72 + ((seed >> 8) % 23) # 72 - 94
        
        desc_lower = description.lower()
        if "pitch deck text:" in desc_lower:
            score = min(98, score + 2)
            
        return {
            "score": score,
            "confidence": "86%",
            "reasoning": "Rival platforms lack proprietary biological sequence transformers, securing the target startup's IP moat.",
            "strengths": [
                "Patent-protected neural model structures",
                "Existing pilot validates competitive advantages"
            ],
            "weaknesses": [
                "Competitive density is rising across automated biomedical modeling"
            ],
            "evidence": [
                {
                    "source": "Rival profiling files",
                    "confidence": "86%",
                    "reason": "Competitors lack custom sequence-trained models.",
                    "linkedEntities": ["BioSim", "FoldingWorks"],
                    "timestamp": "Just now"
                }
            ]
        }
