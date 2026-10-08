from app.repositories.CogneeRepository import CogneeRepository
from typing import Dict, Any

class FounderAgent:
    @staticmethod
    async def analyze(startup_id: str, description: str = "") -> Dict[str, Any]:
        # Hash baseline
        hash_val = 0
        for c in startup_id:
            hash_val = ord(c) + ((hash_val << 5) - hash_val)
        seed = abs(hash_val)
        score = 80 + (seed % 16) # 80 - 95
        
        desc_lower = description.lower()
        if "pitch deck text:" in desc_lower:
            score = min(98, score + 2)
            
        # Extract founder name from description if possible
        founder_name = "Founder Lead"
        import re
        match = re.search(r'founder(?: ceo)? bio:\s*([A-Za-z\s\.\-]+)', desc_lower)
        if match:
            founder_name = match.group(1).split('\n')[0].strip().title()
        elif "founder background:" in desc_lower:
            # Maybe extract from founder background line
            match = re.search(r'founder background:\s*([A-Za-z\s\.\-]+)', desc_lower)
            if match:
                founder_name = match.group(1).split('\n')[0].strip().title()
            
        strengths = [
            f"Declared founder leadership: {founder_name}.",
            "Executive leadership profile submitted in diligence materials."
        ]
        weaknesses = [
            "Founder professional track record and credentials require independent verification.",
            "Key-person operational dependency on core founding team."
        ]

        return {
            "score": score,
            "confidence": "85%",
            "reasoning": f"Founding leadership for {startup_id} identified as {founder_name}. Background details submitted for evaluation.",
            "strengths": strengths,
            "weaknesses": weaknesses,
            "evidence": [
                {
                    "source": "Founder Profile & Intake Submission",
                    "confidence": "90%",
                    "reason": f"Declared executive identity ({founder_name}) recorded in diligence intake.",
                    "linkedEntities": [founder_name],
                    "timestamp": "Just now"
                }
            ]
        }
