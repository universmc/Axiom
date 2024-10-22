
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function initiateProc() {
  const messages = [
    { role: "system", name: "introduction_event", content: "Gemini, tu es invitée à participer à un défi spécial d'intelligence artificielle. Serais-tu intéressée ?" },
    { role: "user", name: "gemini_accept", content: "Je suis prête à relever le défi ! Peux-tu m'en dire plus ?" },
    { role: "assistant", name: "description_event", content: "Le défi est de produire une vidéo de 68 secondes basée sur 15 séquences." },
    { role: "user", name: "criteria_question", content: "Quels seront les critères d'évaluation ?" },
    { role: "system", name: "evaluation_criteria", content: "Les critères incluent l'efficacité, la rapidité, et la pertinence des résultats." },
    { role: "assistant", name: "ready_confirmation", content: "Je suis prête à commencer." }
  ];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: "gemma2-9b-it",
      temperature: 0.7,
      max_tokens: 2048
    });

    const completionText = chatCompletion.choices[0]?.message?.content || "Pas de réponse générée";
    console.log("Réponse générée par l'assistant :", completionText);
  } catch (error) {
    console.error("Erreur lors de la génération de la complétion :", error.message);
  }
}

initiateProc();
