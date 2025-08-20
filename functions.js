const JOKES = [
  "Why don’t skeletons fight each other? They don’t have the guts.",
  "I told my computer I needed a break, and it said: 'No problem — I’ll go to sleep.'",
  "Why did the function break up with the loop? It needed some space."
];

const QUOTES = [
  "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill",
  "The only way to do great work is to love what you do. – Steve Jobs",
  "Whether you think you can, or you think you can't—you're right. – Henry Ford"
];

function tellJoke() {
  return JOKES[Math.floor(Math.random() * JOKES.length)];
}

function getMotivationalQuote() {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

function summarize(text, maxChars = 220) {
  if (!text) return "No text provided to summarize.";
  return text.length > maxChars ? text.slice(0, maxChars) + "…" : text;
}

module.exports = { tellJoke, getMotivationalQuote, summarize };
