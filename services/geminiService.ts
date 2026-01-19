
import { GoogleGenAI } from "@google/genai";
import { ICard, IUser } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCardFlavor = async (card: ICard, user: IUser): Promise<string> => {
  try {
    const userGenderInfo = user.gender ? `(Género: ${user.gender})` : '';
    const partnerGenderInfo = user.partnerGender ? `(Género: ${user.partnerGender})` : '';

    const prompt = `
      Actúa como el "Maestro del Juego" de una app de parejas llamada LoveDeck.
      
      La carta jugada es: "${card.title}"
      Descripción: "${card.description}"
      Jugador (Lanzador): ${user.name} ${userGenderInfo}
      Receptor (Pareja): ${user.partnerName} ${partnerGenderInfo}

      Genera un texto breve (máximo 2 frases), ingenioso y divertido que anuncie que esta carta se ha jugado.
      Adapta el tono y los pronombres según los géneros proporcionados si es necesario.
      Debe sentirse como una notificación de un juego de rol o un comentario de narrador deportivo.
      Incluye una sugerencia muy breve de cómo el receptor puede reaccionar.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Fast response needed
      }
    });

    return response.text || "¡Carta jugada! El destino ha hablado.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `¡${user.name} ha jugado una carta legendaria! ${user.partnerName}, es tu turno de brillar.`;
  }
};
