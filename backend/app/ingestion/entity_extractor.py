from app.services.llm_service import get_extractor
from typing import Dict, Any

class EntityExtractor:
    @staticmethod
    async def extract(text: str) -> Dict[str, Any]:
        extractor = get_extractor()
        return await extractor.extract_entities(text)
