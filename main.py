import json
from typing import Dict, Any, Optional
from groq import Groq
from config import GROQ_API_KEY, MODEL_NAME, TEMPERATURE, MAX_TOKENS
from utils.rag import simple_retrieve
from functions import tell_joke, get_motivational_quote, summarize

# ✅ Ensure API key is set
if not GROQ_API_KEY:
    raise RuntimeError("Set GROQ_API_KEY in .env file or environment.")

# ✅ Create Groq client
client = Groq(api_key=GROQ_API_KEY)

# ✅ Router instructions
ROUTER_INSTRUCTIONS = """You are an intent router for ChatGPT-Lite.
Given a user message, decide the action with NO examples (zero-shot).
Return ONLY a JSON object like:
{
  "action": "ANSWER_FACT" | "TELL_JOKE" | "SUMMARIZE" | "MOTIVATIONAL_QUOTE",
  "arguments": { "text": "<optional text for summarize>" }
}
Rules:
- If user asks for a joke → TELL_JOKE.
- If user asks to summarize text → SUMMARIZE with arguments.text.
- If user asks for motivational/inspiring → MOTIVATIONAL_QUOTE.
- Otherwise → ANSWER_FACT.
"""

# ✅ Answering instructions
ANSWER_INSTRUCTIONS = """You are ChatGPT-Lite answering a factual question briefly and accurately.
You get CONTEXT facts from the knowledge base:
- Only use them, never invent.
- If answer not in context, say "I don't know."
Answer in 1–2 sentences.
"""

# ✅ Call LLM wrapper
def call_llm(messages, temperature=TEMPERATURE, max_tokens=MAX_TOKENS):
    resp = client.chat.completions.create(
        model=MODEL_NAME,
        temperature=temperature,
        max_tokens=max_tokens,
        messages=messages,
    )
    return resp.choices[0].message.content.strip()

# ✅ Zero-shot router
def zero_shot_route(user_message: str) -> Dict[str, Any]:
    messages = [
        {"role": "system", "content": ROUTER_INSTRUCTIONS},
        {"role": "user", "content": user_message}
    ]
    raw = call_llm(messages, temperature=0)
    start, end = raw.find("{"), raw.rfind("}")
    if start == -1 or end == -1:
        raise ValueError(f"Router returned bad JSON: {raw}")
    return json.loads(raw[start:end+1])

# ✅ Factual answering (with RAG)
def answer_fact(user_message: str) -> str:
    context = simple_retrieve(user_message, k=3)
    context_block = "\n".join(f"- {c}" for c in context) if context else "- (no facts found)"
    messages = [
        {"role": "system", "content": ANSWER_INSTRUCTIONS},
        {"role": "user", "content": f"CONTEXT:\n{context_block}\n\nQUESTION: {user_message}"}
    ]
    return call_llm(messages, temperature=0)

# ✅ Handle user input
def handle_user_input(user_message: str) -> str:
    route = zero_shot_route(user_message)
    action = route.get("action")
    args: Optional[Dict[str, Any]] = route.get("arguments") or {}

    if action == "TELL_JOKE":
        return tell_joke()
    elif action == "MOTIVATIONAL_QUOTE":
        return get_motivational_quote()
    elif action == "SUMMARIZE":
        return summarize(args.get("text") or user_message)
    else:
        return answer_fact(user_message)

# ✅ Entry point
if __name__ == "__main__":
    print("🤖 ChatGPT-Lite (Groq Edition) — type 'exit' to quit.")
    while True:
        try:
            user = input("\nYou: ").strip()
            if user.lower() in {"exit", "quit"}:
                print("Bye!")
                break
            reply = handle_user_input(user)
            print(f"Bot: {reply}")
        except Exception as e:
            print(f"[Error] {e}")
