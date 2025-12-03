
import { GoogleGenAI, Type } from "@google/genai";
import { PlanPreferences, ChatMessage, FoodAnalysisResult } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const getFitnessAdvice = async (history: ChatMessage[], context?: string): Promise<string> => {
  if (!apiKey) {
    return "I'm sorry, I'm currently offline (API Key missing). Please check the app configuration.";
  }

  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are "FitCoach", an expert AI fitness and nutrition assistant within the 'FitSpot' app.
    Your goal is to help users find the right workouts, understand gym equipment, and stay motivated.
    
    Context about the user's current view: ${context || 'General chat context.'}
    
    Keep your answers concise, encouraging, and action-oriented. Use emojis occasionally.
    If asked about specific studios, suggest looking at the verified studios in the list.`;

    // Convert app ChatMessage objects to Gemini API Content format
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I couldn't generate a response right now. Try again!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my fitness database. Please try again later.";
  }
};

export const generateAIPlan = async (prefs: PlanPreferences): Promise<string> => {
  if (!apiKey) {
    return "Error: API Key missing.";
  }

  try {
    const model = 'gemini-2.5-flash';

    // Construct a detailed prompt based on available data
    let userDetails = `
    - Goal: ${prefs.goal}
    - Level: ${prefs.level}
    - Equipment: ${prefs.equipment}
    - Days/Week: ${prefs.daysPerWeek}
    - Diet: ${prefs.dietaryRestrictions}`;

    // Add optional bio-metrics if they exist
    if (prefs.age) userDetails += `\n    - Age: ${prefs.age}`;
    if (prefs.height) userDetails += `\n    - Height: ${prefs.height}`;
    if (prefs.currentWeight) userDetails += `\n    - Current Weight: ${prefs.currentWeight}`;
    if (prefs.targetWeight) userDetails += `\n    - Target Weight: ${prefs.targetWeight}`;
    if (prefs.medicalConditions) userDetails += `\n    - Medical Conditions/Allergies: ${prefs.medicalConditions}`;

    const prompt = `Create a comprehensive fitness and nutrition plan for a user with these details:${userDetails}

    Generate the response strictly in JSON format matching the schema provided. 
    Ensure the nutrition plan and advice specifically addresses their weight/medical constraints if provided.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planName: { type: Type.STRING, description: "A catchy title for the plan" },
            overview: { type: Type.STRING, description: "A 2-sentence motivating summary" },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "e.g., Day 1, Day 2" },
                  focus: { type: Type.STRING, description: "e.g., Chest & Triceps, Rest, Cardio" },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.STRING },
                        reps: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                dailyCalories: { type: Type.STRING },
                macros: { type: Type.STRING, description: "e.g. 40% Carb / 30% Protein / 30% Fat" },
                mealPlan: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING, description: "Example meal name" }
                }
              }
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      },
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Gemini Plan Error:", error);
    return "{}";
  }
};

export const analyzeFoodImage = async (imageBase64: string): Promise<string> => {
  if (!apiKey) {
    return "Error: API Key missing.";
  }

  try {
    const model = 'gemini-1.5-flash';

    const prompt = `Analyze this image of food. Identify the main dish and estimate the nutritional content.
    Return a JSON object with the following structure:
    {
      "name": "Name of the dish",
      "calories": 0, // Total estimated calories
      "protein": 0, // grams
      "carbs": 0, // grams
      "fat": 0, // grams
      "items": ["List", "of", "detected", "ingredients"]
    }
    Ensure the JSON is valid and numeric values are integers.`;

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
          ]
        }
      ],
      config: {
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.INTEGER },
            protein: { type: Type.INTEGER },
            carbs: { type: Type.INTEGER },
            fat: { type: Type.INTEGER },
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "{}";
  }
};

export const getNutritionSuggestions = async (goal: string): Promise<string> => {
  if (!apiKey) return "[]";

  try {
    const model = 'gemini-1.5-flash';
    const prompt = `Suggest 3 healthy food items for a user with the goal: "${goal}".
    Return a JSON array with objects:
    [
      {
        "name": "Food Name",
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "reason": "Why this is good"
      }
    ]
    Ensure valid JSON.`;

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });

    return response.text || "[]";
  } catch (error) {
    console.error("Gemini Suggestions Error:", error);
    return "[]";
  }
};
