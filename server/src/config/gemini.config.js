// ============================================
// gemini.config.js — Uses REST API directly
// ============================================

const MODEL_NAME = 'gemini-2.5-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

const generateContent = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY; // read at call time, not module load

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const response = await fetch(`${BASE_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: typeof prompt === 'string' ? prompt : JSON.stringify(prompt) }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const errMsg = errBody?.error?.message || `HTTP ${response.status}`;
    console.error('Gemini API Error:', errMsg);
    throw new Error(`Gemini API failed: ${errMsg}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  return text;
};

export { MODEL_NAME, generateContent };