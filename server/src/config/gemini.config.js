// ============================================
// gemini.config.js — Uses REST API directly
// (avoids SDK version compatibility issues)
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash';
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

const generateContent = async (prompt) => {
  try {
    const response = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
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
      const errMsg = errBody?.error?.message || response.statusText;
      throw new Error(`Gemini API failed: ${errMsg}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Gemini returned an empty response');
    }

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw new Error(`Gemini API failed: ${error.message}`);
  }
};

export { MODEL_NAME, generateContent };