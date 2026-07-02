from pypdf import PdfReader
import io

class PDFParser:
    @staticmethod
    def extract_text(file_bytes: bytes) -> str:
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text.strip()
        except Exception as e:
            return f"Error parsing PDF: {str(e)}"
