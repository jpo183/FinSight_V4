const OpenAI = require('openai');

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Test OpenAI connection
const testConnection = async () => {
  try {
    await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: "Test connection" }],
      max_tokens: 5
    });
    console.log('✅ OpenAI connection successful');
  } catch (error) {
    console.error('❌ OpenAI connection failed:', error.message);
    process.exit(1);
  }
};

// Run test on startup
testConnection();

module.exports = { openai }; 