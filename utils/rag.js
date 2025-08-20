const fs = require("fs");
const path = require("path");

function simpleRetrieve(query, k = 3) {
  const kbPath = path.join(__dirname, "..", "knowledge_base", "facts.txt");
  if (!fs.existsSync(kbPath)) return [];

  const facts = fs.readFileSync(kbPath, "utf-8")
    .split("\n")
    .map(f => f.trim())
    .filter(f => f.length > 0);

  const matched = facts
    .filter(f => query.toLowerCase().split(" ").some(word => f.toLowerCase().includes(word)))
    .slice(0, k);

  return matched;
}

module.exports = { simpleRetrieve };
