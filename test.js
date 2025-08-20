// test-groq.js
const axios = require("axios");
const { GROQ_API_KEY, MODEL_NAME } = require("./config");

async function testGroqAPI() {
  try {
    console.log("Testing Groq API connection...");
    console.log("Model:", MODEL_NAME);
    
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: MODEL_NAME,
        messages: [{ role: "user", content: "Hello, can you respond with just 'API working'?" }],
        max_tokens: 10
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );
    
    console.log("✅ API Response:", response.data.choices[0].message.content);
    console.log("✅ Connection successful!");
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.log("❌ DNS Error: Cannot resolve api.groq.com");
    } else if (error.response) {
      console.log("❌ API Error:", error.response.status, error.response.data);
    } else {
      console.log("❌ Network Error:", error.message);
    }
  }
}

testGroqAPI();