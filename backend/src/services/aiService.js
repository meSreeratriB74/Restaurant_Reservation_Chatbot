import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const getAIResponse = async (message) => {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",   // ✅ UPDATED MODEL
      messages: [
        {
          role: "system",
          content:
            "You are a smart restaurant assistant. Help users book tables, check availability, and answer politely.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.4,
    });

    return {
      reply: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error(
      "❌ GROQ ERROR:",
      error.status,
      error.response?.data || error.message
    );

    return {
      reply: "⚠️ AI service is temporarily unavailable.",
    };
  }
};
