from app.repositories.CogneeRepository import CogneeRepository
from typing import Dict, Any

class MemoryManager:
    @staticmethod
    async def store_startup_memory(startup_id: str, data: Dict[str, Any]) -> None:
        # Commit primary info to Cognee repository
        await CogneeRepository.store_startup(startup_id, data)
        
        # Structure primary relational links
        entities = [
            {
                "source": "n-founder", 
                "target": "n-company", 
                "type": "FOUNDER_OF", 
                "reason": f"Founder {data.get('founder', 'Unknown')} registered as lead executive.",
                "confidence": "98%"
            },
            {
                "source": "n-company", 
                "target": "n-tech", 
                "type": "DEVELOPED", 
                "reason": f"Engineers built product using {', '.join(data.get('technology', []))}.",
                "confidence": "95%"
            },
            {
                "source": "n-company", 
                "target": "n-finance", 
                "type": "GENERATES", 
                "reason": f"Active commercial model producing {data.get('revenue', 'unknown revenue')}.",
                "confidence": "92%"
            }
        ]
        await CogneeRepository.store_entities(startup_id, entities)

    @staticmethod
    async def get_startup_memory(startup_id: str) -> Dict[str, Any]:
        return await CogneeRepository.retrieve_graph(startup_id)
