class FounderProfileParser:
    @staticmethod
    def parse_profile(input_text: str) -> str:
        if not input_text:
            return "No profile bio or resume content provided."
        return input_text.strip()
