import asyncio
import cognee
import sqlite3
import os

# Set mock embedding environment variable
os.environ["MOCK_EMBEDDING"] = "true"

async def test():
    # Make sure we apply patch if needed, but let's see what happens without it first
    # Let's import the patch to mock LLM calls so we don't need real OpenAI API keys or spend tokens
    from app.memory.cognee_patch import patched_acreate_structured_output
    from cognee.infrastructure.llm.LLMGateway import LLMGateway
    LLMGateway.acreate_structured_output = patched_acreate_structured_output
    
    print("Resetting database...")
    db_path = r"C:\Users\Gurubachan Singh\Downloads\Business_Diligence\backend\.venv\Lib\site-packages\cognee\.cognee_system\databases\cognee_db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM edges")
    cursor.execute("DELETE FROM nodes")
    conn.commit()
    conn.close()
    
    print("Calling remember...")
    await cognee.remember("Startup: NeuroVision AI\nFounder: Rahul Sharma\nTechnology: TensorFlow\nInvestor: Peak Ventures\nDescription: Vision AI startup.")
    
    print("Calling cognify...")
    await cognee.cognify()
    
    print("Checking database...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM nodes")
    nodes_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM edges")
    edges_count = cursor.fetchone()[0]
    print(f"Nodes in DB: {nodes_count}, Edges in DB: {edges_count}")
    conn.close()

if __name__ == "__main__":
    asyncio.run(test())
