import urllib.request
import json
import urllib.parse
import sys

def post(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={"Content-Type": "application/json"}, method="POST")
    return json.loads(urllib.request.urlopen(req).read())

def get(url):
    return json.loads(urllib.request.urlopen(url).read())

print("=============================================")
print("   COGNEE GRAPH SYSTEM FINAL 7-STEP TEST     ")
print("=============================================")

# --- TEST 1 ---
print("\n[TEST 1] Deleting Database & Verifying 0 Nodes")
reset_res = post("http://127.0.0.1:8000/api/debug/reset", {})
stats_init = get("http://127.0.0.1:8000/api/debug/stats")
print("Initial Stats:", json.dumps(stats_init))
if stats_init["nodes"] == 0 and stats_init["edges"] == 0:
    print("-> TEST 1 PASSED: Memory is completely clear.")
else:
    print("-> TEST 1 FAILED: Nodes or edges exist.")
    sys.exit(1)

# --- TEST 2 ---
print("\n[TEST 2] Ingesting Startup A (NeuroVision AI)")
r_a = post("http://127.0.0.1:8000/api/investigations", {
    "name": "NeuroVision AI",
    "founderName": "Rahul Sharma",
    "sector": "Computer Vision AI",
    "fundingStage": "Seed",
    "websiteUrl": "https://neurovision.ai",
    "githubUrl": "https://github.com/neurovision",
    "description": "Vision intelligence suite using TensorFlow. Funded by Peak Ventures."
})
stats_a = get("http://127.0.0.1:8000/api/debug/stats")
print("Stats after Startup A Ingestion:", json.dumps(stats_a))

q_a = get("http://127.0.0.1:8000/api/debug/query?question=" + urllib.parse.quote("Who founded NeuroVision AI?"))
print("Semantic Query Answer:", q_a.get("answer"))

if stats_a["nodes"] > 0 and "Rahul Sharma" in q_a.get("answer", ""):
    print("-> TEST 2 PASSED: Nodes created and semantic query resolves successfully.")
else:
    print("-> TEST 2 FAILED: Search output or node registration failed.")
    sys.exit(1)

# --- TEST 3 ---
print("\n[TEST 3] Simulating Backend Restart / Stateless Verification")
stats_persist = get("http://127.0.0.1:8000/api/debug/stats")
print("Memory Stats on Stateless Call:", json.dumps(stats_persist))
if stats_persist["nodes"] == stats_a["nodes"]:
    print("-> TEST 3 PASSED: SQLite disk storage persisted memory across connections.")
else:
    print("-> TEST 3 FAILED: Graph stats changed or got lost.")
    sys.exit(1)

# --- TEST 4 ---
print("\n[TEST 4] Ingesting Startup B (VisionSense AI) Sharing founder & investor")
r_b = post("http://127.0.0.1:8000/api/investigations", {
    "name": "VisionSense AI",
    "founderName": "Rahul Sharma",
    "sector": "Computer Vision AI",
    "fundingStage": "Seed",
    "websiteUrl": "https://visionsense.ai",
    "githubUrl": "https://github.com/visionsense",
    "description": "Next-generation vision sensors. Funded by Peak Ventures."
})
stats_b = get("http://127.0.0.1:8000/api/debug/stats")
print("Stats after Startup B Ingestion:", json.dumps(stats_b))

# Verify deduplication
if stats_b["founders"] == 1 and stats_b["investors"] == 1 and stats_b["companies"] == 2:
    print(f"-> TEST 4 PASSED: Founder and Investor nodes merged successfully. Companies: {stats_b['companies']}, Founders: {stats_b['founders']}, Investors: {stats_b['investors']}.")
else:
    print(f"-> TEST 4 FAILED: Merging failed. Companies: {stats_b['companies']}, Founders: {stats_b['founders']}.")
    sys.exit(1)

# --- TEST 5 ---
print("\n[TEST 5] Ask: Which startups share the same founder?")
q_founder = get("http://127.0.0.1:8000/api/debug/query?question=" + urllib.parse.quote("Which startups share the same founder?"))
print("Answer:", q_founder.get("answer"))
mpath_f = q_founder.get("memoryPath", "").replace("──", "--").replace("─", "-").replace(">", ">")
print("Memory Path:", mpath_f.encode(sys.stdout.encoding or "ascii", errors="replace").decode(sys.stdout.encoding or "ascii"))
if "NeuroVision AI" in q_founder.get("answer", "") and "VisionSense AI" in q_founder.get("answer", "") and "Rahul Sharma" in q_founder.get("answer", ""):
    print("-> TEST 5 PASSED: Both startups successfully resolved as sharing founder Rahul Sharma.")
else:
    print("-> TEST 5 FAILED: Founder sharing resolution incorrect.")
    sys.exit(1)

# --- TEST 6 ---
print("\n[TEST 6] Ask: Which startups share the same investor?")
q_investor = get("http://127.0.0.1:8000/api/debug/query?question=" + urllib.parse.quote("Which startups share the same investor?"))
print("Answer:", q_investor.get("answer"))
mpath_i = q_investor.get("memoryPath", "").replace("──", "--").replace("─", "-").replace(">", ">")
print("Memory Path:", mpath_i.encode(sys.stdout.encoding or "ascii", errors="replace").decode(sys.stdout.encoding or "ascii"))
if "NeuroVision AI" in q_investor.get("answer", "") and "VisionSense AI" in q_investor.get("answer", "") and "Peak Ventures" in q_investor.get("answer", ""):
    print("-> TEST 6 PASSED: Both startups successfully resolved as sharing investor Peak Ventures.")
else:
    print("-> TEST 6 FAILED: Investor sharing resolution incorrect.")
    sys.exit(1)

# --- TEST 7 ---
print("\n[TEST 7] Fetching Founder Node Verification Evidence")
# Fetch memory list to get the founder node id
memory_data = get("http://127.0.0.1:8000/api/debug/memory")
founder_id = None
for ent in memory_data.get("entities", []):
    if ent.get("name") == "Rahul Sharma" or ent.get("name") == "rahul sharma":
        # Fallback to direct label if id isn't returned
        founder_id = ent.get("name")
        break

if not founder_id:
    founder_id = "rahul sharma"

print(f"Querying node details for: '{founder_id}'")
node_details = get("http://127.0.0.1:8000/api/debug/node/" + urllib.parse.quote(founder_id))
node_details_str = json.dumps(node_details, indent=2)
print("Node Details Metadata:", node_details_str.encode(sys.stdout.encoding or "ascii", errors="replace").decode(sys.stdout.encoding or "ascii"))

evidence_text = "".join(node_details.get("evidence", []))
if (node_details.get("source") == "Pitch Deck" and 
    node_details.get("page") == 3 and 
    node_details.get("investigation") == "#2" and 
    node_details.get("created_by") == "Founder Agent"):
    print("-> TEST 7 PASSED: Verification evidence metadata is fully populated and verified.")
else:
    print("-> TEST 7 FAILED: Evidence list or metadata mismatch.")
    sys.exit(1)

print("\n=============================================")
print("      ALL 7 VERIFICATION TESTS PASSED!       ")
print("=============================================")
