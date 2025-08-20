import os

KB_PATH = os.path.join("knowledge_base", "facts.txt")

def load_kb():
    if not os.path.exists(KB_PATH):
        return []
    with open(KB_PATH, "r", encoding="utf-8") as f:
        return [ln.strip() for ln in f if ln.strip()]

def simple_retrieve(query, k=3):
    facts = load_kb()
    if not facts:
        return []
    q_tokens = set(query.lower().split())
    def score(f):
        ft = set(f.lower().split())
        inter = len(q_tokens & ft)
        union = len(q_tokens | ft) or 1
        return inter / union
    return sorted(facts, key=score, reverse=True)[:k]
