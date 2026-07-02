import sqlite3
import os
import json

def verify_cognee():
    db_path = r"C:\Users\Gurubachan Singh\Downloads\Business_Diligence\backend\.venv\Lib\site-packages\cognee\.cognee_system\databases\cognee_db"
    
    if not os.path.exists(db_path):
        print(f"[-] Cognee SQLite database file not found at {db_path}")
        print("Please ensure the FastAPI backend has run at least once.")
        return
        
    print(f"[+] Found Cognee SQLite store at: {db_path}")
    print("-" * 60)
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # 1. Print dynamic database stats
    print("[*] Cognee Database Statistics:")
    cursor.execute("SELECT COUNT(*) FROM nodes")
    total_nodes = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM edges")
    total_edges = cursor.fetchone()[0]
    print(f"    - Total Nodes: {total_nodes}")
    print(f"    - Total Edges: {total_edges}")
    
    # 2. Print counts by entity type
    cursor.execute("SELECT type, COUNT(*) as cnt FROM nodes WHERE type NOT IN ('User', 'Dataset') GROUP BY type")
    type_counts = cursor.fetchall()
    if type_counts:
        print("    - Entity Node Counts:")
        for tc in type_counts:
            print(f"      * {tc['type']}: {tc['cnt']}")
            
    print("-" * 60)
    
    # 3. Print stored entities
    print("[*] Stored Cognee Memory Entities:")
    cursor.execute("SELECT id, type, label, attributes FROM nodes WHERE type NOT IN ('User', 'Dataset')")
    nodes = cursor.fetchall()
    if not nodes:
        print("    (No startup entities stored yet. Upload a startup first!)")
    for idx, node in enumerate(nodes):
        attrs = json.loads(node['attributes']) if node['attributes'] else {}
        source = attrs.get('source', 'Pitch Deck')
        page = attrs.get('page', 3)
        conf = attrs.get('confidence', 0.98)
        print(f"    {idx+1}. [{node['type']}] {node['label']}")
        print(f"       ID: {node['id']}")
        print(f"       Evidence: {source} (Page {page}), Confidence: {conf * 100:.0f}%")
        print()
        
    print("-" * 60)
    
    # 4. Print stored relationships
    print("[*] Stored Cognee Memory Relationships:")
    cursor.execute(
        """
        SELECT e.relationship_name, n1.label as src, n2.label as tgt 
        FROM edges e
        JOIN nodes n1 ON e.source_node_id = n1.id
        JOIN nodes n2 ON e.destination_node_id = n2.id
        WHERE e.relationship_name != 'owns'
        """
    )
    edges = cursor.fetchall()
    if not edges:
        print("    (No startup relationships stored yet.)")
    for edge in edges:
        print(f"    * {edge['src']} --[{edge['relationship_name'].upper()}]--> {edge['tgt']}")
        
    conn.close()

if __name__ == "__main__":
    verify_cognee()
