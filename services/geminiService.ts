import { GoogleGenAI, Type, Chat } from "@google/genai";
import { ChatMode, Day, Task, QuizQuestion, JournalEntry } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Chat Session Singleton
let chatSession: Chat | null = null;
let currentMode: ChatMode = 'STANDARD';

export const getChatSession = (mode: ChatMode = 'STANDARD'): Chat => {
  // If the mode changes, or session doesn't exist, create a new one
  if (!chatSession || currentMode !== mode) {
    let model = 'gemini-3-pro-preview';
    let config: any = {
      systemInstruction: "You are an expert Product Management coach and mentor located on a sci-fi mission control station. Help the user with their study plan, explain complex concepts (SQL, Jira, Strategy, Metrics) simply, and provide motivation. Keep responses concise, practical, and in-character as a supportive AI officer.",
    };

    if (mode === 'THINKING') {
      model = 'gemini-3-pro-preview';
      // Increased thinking budget for complex tasks
      config.thinkingConfig = { thinkingBudget: 32768 };
      // System instruction might be less effective or overwritten in thinking mode, but keeping it for context
    } else if (mode === 'SEARCH') {
      model = 'gemini-2.5-flash';
      // Enable Google Search tool
      config.tools = [{ googleSearch: {} }];
      // Flash works best without system instruction conflicts when using tools, 
      // but we'll keep a simpler one or rely on the tool.
      config.systemInstruction = "You are a helpful assistant. Use Google Search to find the most recent and accurate information.";
    }

    chatSession = ai.chats.create({
      model,
      config
    });
    currentMode = mode;
  }
  
  return chatSession;
};

export const breakDownTaskWithAI = async (taskTitle: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a strict Product Management coach. Break down the following study task into exactly 3 concise, actionable sub-tasks. Return ONLY a JSON array of strings. Task: "${taskTitle}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return ["Analyze the requirements", "Draft the solution", "Review and refine"];
    
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Gemini Breakdown Error:", error);
    return ["Plan the approach", "Execute the task", "Review output"]; // Fallback
  }
};

export const getAiCoachingMessage = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "You are a sci-fi spaceship commander talking to a pilot (the user). The pilot just finished a 25-minute intensive focus session on technical product management. Generate a single, short (max 20 words), high-energy, encouraging transmission. Use space/tech metaphors.",
    });

    return response.text || "Systems nominal. Great focus session complete.";
  } catch (error) {
    console.error("Gemini Coaching Error:", error);
    return "Connection lost... but great work on the focus session!";
  }
};

export const generateCurriculum = async (focus: string): Promise<Day[]> => {
  const prompt = `
    You are a specialized curriculum planner for a Product Management academy. 
    Create a custom 7-day intensive study plan focusing on: "${focus}".
    
    Requirements:
    1. 7 Days total.
    2. Each day must have exactly 4 tasks.
    3. Strictly use these 4 time slots for every day: "08:00 - 10:00", "10:30 - 12:30", "13:30 - 15:30", "16:00 - 17:00".
    4. Categories MUST be one of: "SQL", "AGILE", "STRATEGY", "EXCEL". Distribute them reasonably.
    5. XP should vary between 30 and 100 based on task complexity.
    6. Task IDs must be unique strings (e.g., "new-d1-t1").
    7. Completed must be false.
    
    Return a JSON array of 7 Day objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              title: { type: Type.STRING },
              theme: { type: Type.STRING },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    completed: { type: Type.BOOLEAN },
                    xp: { type: Type.INTEGER },
                    time: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ["SQL", "AGILE", "STRATEGY", "EXCEL"] }
                  },
                  required: ["id", "title", "completed", "xp", "time", "category"]
                }
              }
            },
            required: ["id", "title", "theme", "tasks"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Day[];
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Curriculum Generation Error:", error);
    throw error;
  }
};

// --- New Feature Services ---

export const generateDailyQuiz = async (tasks: Task[]): Promise<QuizQuestion[]> => {
  const taskSummary = tasks.map(t => t.title).join(", ");
  const prompt = `
    Create 3 short multiple-choice questions to test a student who just studied: ${taskSummary}.
    Return a JSON array of objects with 'id', 'question', 'options' (array of 4 strings), and 'correctAnswerIndex' (0-3).
    Keep it strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER }
            },
            required: ["id", "question", "options", "correctAnswerIndex"]
          }
        }
      }
    });
    
    if (response.text) return JSON.parse(response.text) as QuizQuestion[];
    return [];
  } catch (e) {
    console.error("Quiz Gen Error", e);
    return [];
  }
};

export const generateTemplate = async (topic: string, type: string): Promise<string> => {
  const prompt = `
    You are a specialized "Artifact Fabricator" for Product Managers.
    Create a professional, well-structured Markdown template for a "${type}" regarding "${topic}".
    Use headers, bullet points, and placeholder text like [Insert Here].
    Do not include conversational filler. Just the template.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "## Template Generation Failed";
  } catch (e) {
    console.error("Template Gen Error", e);
    return "Error generating template.";
  }
};

export const summarizeJournal = async (text: string): Promise<JournalEntry['summary']> => {
  const prompt = `
    Summarize the following journal entry into 3 short, actionable bullet points:
    1. Key Insight
    2. Action Item
    3. Concept to Review
    Return purely JSON.
    Entry: "${text}"
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            action: { type: Type.STRING },
            concept: { type: Type.STRING }
          },
          required: ["insight", "action", "concept"]
        }
      }
    });
    
    if (response.text) return JSON.parse(response.text);
    return { insight: "Analysis failed", action: "Retry", concept: "N/A" };
  } catch (e) {
    return { insight: "Error processing", action: "Check connection", concept: "System offline" };
  }
};

// --- Career Console Services ---

export const optimizeResumeBullet = async (bullet: string): Promise<{ critique: string; rewrite: string }> => {
  const prompt = `
    Analyze the following resume bullet point for a Google Product Manager role.
    Critique it based on Google's "XYZ Formula" (Accomplished [X] as measured by [Y], by doing [Z]).
    Then, provide a rewritten, stronger version strictly following that formula.
    
    Bullet: "${bullet}"
    
    Return purely JSON.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            critique: { type: Type.STRING },
            rewrite: { type: Type.STRING }
          },
          required: ["critique", "rewrite"]
        }
      }
    });
    
    if (response.text) return JSON.parse(response.text);
    return { critique: "Analysis failed", rewrite: bullet };
  } catch (e) {
    return { critique: "Error optimizing bullet.", rewrite: bullet };
  }
};

export const getInterviewQuestion = async (attribute: string): Promise<string> => {
  const prompt = `
    Generate a challenging Google Product Manager interview question focusing on: "${attribute}".
    (Attributes examples: General Cognitive Ability, Role-Related Knowledge, Leadership, Googleyness).
    Return just the question text.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "Explain a time you led a team through a crisis.";
  } catch (e) {
    return "Error generating question.";
  }
};

export const evaluateInterviewAnswer = async (question: string, answer: string): Promise<string> => {
  const prompt = `
    You are a Google Interview Bar Raiser. Evaluate this answer to the question: "${question}".
    Answer: "${answer}"
    
    Provide concise feedback:
    1. Strengths (Did they use STAR method?)
    2. Weaknesses (Was it too vague? Lacking data?)
    3. A "Googleyness" score (1-10).
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "Evaluation unavailable.";
  } catch (e) {
    return "Error evaluating answer.";
  }
};