const dotenv = require("dotenv");
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = "llama3-8b-8192"; // Force Groq model, ignore env vars
const TEMPERATURE = parseFloat(process.env.TEMPERATURE) || 0.2;
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS) || 400;

module.exports = { GROQ_API_KEY, MODEL_NAME, TEMPERATURE, MAX_TOKENS };
