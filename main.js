const readlineSync = require("readline-sync");
const axios = require("axios");
const { GROQ_API_KEY, MODEL_NAME, TEMPERATURE, MAX_TOKENS } = require("./config");
const { simpleRetrieve } = require("./utils/rag");
const { tellJoke, getMotivationalQuote, summarize } = require("./functions");

// Zero-shot routing instructions
const ROUTER_INSTRUCTIONS = `
You are an intent router for ChatGPT-Lite.
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
`;

// Answering instructions
const ANSWER_INSTRUCTIONS = `
You are ChatGPT-Lite answering a factual question briefly and accurately.
You get CONTEXT facts from the knowledge base:
- Only use them, never invent.
- If answer not in context, say "I don't know."
Answer in 1–2 sentences.
`;

// Call Groq API
async function callLLM(messages) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: MODEL_NAME,
        messages,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000 // 30 second timeout
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Network error: Unable to reach Groq API. Please check your internet connection.');
    } else if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
    } else {
      throw new Error(`Request failed: ${error.message}`);
    }
  }
}

// Zero-shot router
async function zeroShotRoute(userMessage) {
  const messages = [
    { role: "system", content: ROUTER_INSTRUCTIONS },
    { role: "user", content: userMessage }
  ];
  const raw = await callLLM(messages);
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error(`Router returned bad JSON: ${raw}`);
  return JSON.parse(raw.slice(start, end + 1));
}

// Answer factual questions with RAG
async function answerFact(userMessage) {
  const context = simpleRetrieve(userMessage, 3);
  const contextBlock = context.length ? context.map(c => `- ${c}`).join("\n") : "- (no facts found)";
  const messages = [
    { role: "system", content: ANSWER_INSTRUCTIONS },
    { role: "user", content: `CONTEXT:\n${contextBlock}\n\nQUESTION: ${userMessage}` }
  ];
  return await callLLM(messages);
}

// Handle user input
async function handleUserInput(userMessage) {
  const route = await zeroShotRoute(userMessage);
  const action = route.action;
  const args = route.arguments || {};

  if (action === "TELL_JOKE") return tellJoke();
  if (action === "MOTIVATIONAL_QUOTE") return getMotivationalQuote();
  if (action === "SUMMARIZE") return summarize(args.text || userMessage);
  return await answerFact(userMessage);
}

// Main chat loop
(async () => {
  console.log("🤖 ChatGPT-Lite (Groq REST) — type 'exit' to quit.");
  while (true) {
    try {
      const user = readlineSync.question("\nYou: ").trim();
      if (user.toLowerCase() === "exit") {
        console.log("Bye!");
        break;
      }
      const reply = await handleUserInput(user);
      console.log(`Bot: ${reply}`);
    } catch (err) {
      console.log("[Error]", err.message);
    }
  }
})();
