import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set. Please set it in your environment.');
    }
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Category Detection API
app.post('/api/detect-category', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 15) {
      return res.json({ category: 'general' });
    }

    const ai = getGenAI();

    const systemInstruction = `You are an expert document classifier. Classify the user's provided text into exactly one of these five categories:
- 'medical' (medical bills, health summaries, patient notices, insurance statements, physician reports)
- 'legal' (court summons, lease clauses, indemnities, terms of service, legal contracts)
- 'government' (government benefits, tax letters, labor division papers, social security communications)
- 'financial' (banking statements, interest amendments, loans, credit terms, APR updates)
- 'general' (any other generic topic or when in doubt)`;

    const prompt = `Please classify the following document snippet:

"""
${text.trim().slice(0, 3000)}
"""`;

    // Resilient call with fallback models and retry logic
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.1,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    description: 'Strictly one of: legal, medical, government, financial, general',
                  },
                },
                required: ['category'],
              },
            },
          });
          if (response?.text) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          // Brief pause before retry
          await new Promise((r) => setTimeout(r, 600));
        }
      }
      if (response?.text) {
        break;
      }
    }

    if (!response?.text) {
      return res.json({ category: 'general' });
    }

    const contentText = response.text;
    if (contentText) {
      const parsed = JSON.parse(contentText);
      const category = parsed.category ? parsed.category.toLowerCase().trim() : 'general';
      const allowed = ['legal', 'medical', 'government', 'financial', 'general'];
      if (allowed.includes(category)) {
        return res.json({ category });
      }
    }
    return res.json({ category: 'general' });
  } catch (error) {
    console.error('Error in category detection:', error);
    // Silent failover to general so the user has no interrupted experience
    return res.json({ category: 'general' });
  }
});

// Translation / Simplification API
app.post('/api/read-file', async (req, res) => {
  try {
    const { fileData, mimeType } = req.body;

    if (!fileData || !mimeType) {
      return res.status(400).json({ error: 'Please provide base64 file data and a valid mimeType.' });
    }

    const ai = getGenAI();

    const systemInstruction = `You are an expert document reader and text extractor.
Analyze the provided document (which could be a PDF, a photo, or a scan).
Your task is to:
1. Extract all text content from the document with high fidelity, preserving readable paragraphs and formatting. Keep it in natural flowing text.
2. Classify the document's category into one of: 'medical', 'legal', 'government', 'financial', or 'general'.

Return your output in strict JSON format:
{
  "extractedText": "Extracted plain text of the document...",
  "category": "medical" | "legal" | "government" | "financial" | "general"
}`;

    const documentPart = {
      inlineData: {
        mimeType,
        data: fileData,
      },
    };

    const promptPart = {
      text: 'Please extract the text and classify the category of this uploaded document.',
    };

    // Resilient call with fallback models and retry logic
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: [documentPart, promptPart],
            config: {
              systemInstruction,
              temperature: 0.1,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  extractedText: {
                    type: Type.STRING,
                    description: 'The high fidelity extracted text of the document',
                  },
                  category: {
                    type: Type.STRING,
                    description: 'Strictly one of: legal, medical, government, financial, general',
                  },
                },
                required: ['extractedText', 'category'],
              },
            },
          });
          if (response?.text) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          // Brief pause before retry
          await new Promise((r) => setTimeout(r, 600));
        }
      }
      if (response?.text) {
        break;
      }
    }

    if (!response?.text) {
      throw lastError || new Error('Unable to extract text from document right now due to high demand. Please try again in a few moments.');
    }

    const contentText = response.text;
    if (contentText) {
      const parsed = JSON.parse(contentText);
      return res.json({
        extractedText: parsed.extractedText || '',
        category: parsed.category || 'general',
      });
    }

    throw new Error('Could not parse text from document.');
  } catch (error: any) {
    console.error('Error reading document:', error);
    res.status(500).json({ error: error.message || 'Error occurred while processing the file.' });
  }
});

// Translation / Simplification API
app.post('/api/simplify', async (req, res) => {
  try {
    const { text, category, language } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide text to simplify.' });
    }

    if (text.length > 20000) {
      return res.status(400).json({ error: 'Text is too long. Please provide up to 20,000 characters.' });
    }

    const ai = getGenAI();

    const categoryContext = category && category !== 'general'
      ? `The input text belongs to the ${category.toUpperCase()} domain.`
      : '';

    const languageMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      bn: 'Bengali (বাংলা)',
      mr: 'Marathi (मराठी)',
      te: 'Telugu (తెలుగు)',
      ta: 'Tamil (தமிழ்)',
      gu: 'Gujarati (ગુજરાતી)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ml: 'Malayalam (മലയാളം)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      ur: 'Urdu (اردو)'
    };
    const targetLanguageName = languageMap[language as string] || 'English';

    const systemInstruction = `You are 'Clear-Speak', an accessibility assistant designed for social good, especially designed to help citizens (including Indian citizens with diverse language requirements).
Your job is to take complex, jargon-filled text (legal, medical, government, or financial) and translate it into plain, compassionate, and easy-to-understand language.

You MUST write and generate all text fields (including shortVersion, whatThisMeans bullet points, nextSteps, disclaimer, term names, simple meanings, suggestedQuestions, and highlights) in ${targetLanguageName}. If the target language is not English, ensure you write in high-quality, readable, and highly accessible phrasing of ${targetLanguageName} that avoids overly formal literary jargon. Use standard everyday words.

Always structure your response exactly like this:
1. The Short Version: (1-2 sentences summarizing the core message in ${targetLanguageName}).
2. What This Means for You: (2-3 bullet points breaking down the details simply in ${targetLanguageName}).
3. Next Steps: (What the person actually needs to do, or 'No action needed' in ${targetLanguageName}).

Important constraints:
- Keep the tone supportive, encouraging, and kind.
- Do not use complex, intimidating words. Use clear, everyday words that are very easy to read and understand for anyone.
- Always include a brief disclaimer at the very end stating that you are an AI explaining text, not a doctor or lawyer. Ensure the disclaimer is in ${targetLanguageName}.
- Make sure the 3 numbered sections, bullets, suggested questions, key terms, and highlights strictly adhere to the exact format and are written in ${targetLanguageName}.`;

    const prompt = `${categoryContext}

Please simplify and translate the following complex text according to the Clear-Speak instructions:

"""
${text.trim()}
"""`;

    const requestConfig = {
      systemInstruction,
      temperature: 0.2,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          shortVersion: {
            type: Type.STRING,
            description: '1-2 sentences summarizing the core message in simple, easy-to-understand language',
          },
          whatThisMeans: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: '2-3 bullet points breaking down the details simply in compassionate, easy-to-read language',
          },
          nextSteps: {
            type: Type.STRING,
            description: 'What the person actually needs to do, or explicitly "No action needed"',
          },
          disclaimer: {
            type: Type.STRING,
            description: 'Brief disclaimer stating you are an AI explaining text, not a doctor or lawyer',
          },
          originalGradeLevelEstimate: {
            type: Type.STRING,
            description: 'Estimated readability/complexity level of the input text (e.g. "High Complexity", "Technical / Formal", "Standard Jargon")',
          },
          keyTermsExplained: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING, description: 'The difficult jargon word found in original' },
                simpleMeaning: { type: Type.STRING, description: 'What it means in everyday words' },
              },
              required: ['term', 'simpleMeaning'],
            },
            description: 'Up to 3 complex jargon terms found in the text with simple definitions',
          },
          suggestedQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: '3 common, highly specific questions based on the content of the document that a user might want to ask',
          },
          highlights: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
            description: '3-4 critical specific figures, hard deadlines, amounts, or key highlights found in the document',
          },
        },
        required: ['shortVersion', 'whatThisMeans', 'nextSteps', 'disclaimer', 'suggestedQuestions', 'highlights'],
      },
    };

    // Resilient call with low thinking latency and silent fallback
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      const configForModel: any = { ...requestConfig };
      if (modelName === 'gemini-flash-latest') {
        delete configForModel.thinkingConfig;
      }
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: configForModel,
          });
          if (response?.text) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          // Brief pause before retry
          await new Promise((r) => setTimeout(r, 600));
        }
      }
      if (response?.text) {
        break;
      }
    }

    if (!response?.text) {
      throw lastError || new Error('Unable to contact AI model right now. Please try again in a few moments.');
    }

    const responseText = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', responseText, parseError);
      return res.status(500).json({ error: 'Failed to generate a clean structured explanation. Please try again.' });
    }

    const shortVersion = parsedData.shortVersion || '';
    const whatThisMeans = Array.isArray(parsedData.whatThisMeans) ? parsedData.whatThisMeans : [];
    const nextSteps = parsedData.nextSteps || 'No action needed.';
    const disclaimer = parsedData.disclaimer || 'Disclaimer: I am an AI explaining text, not a doctor or lawyer.';
    const originalGradeLevel = parsedData.originalGradeLevelEstimate || 'Advanced / Professional';

    // Construct the standard canonical formatted text exactly adhering to user's specification:
    // 1. The Short Version: ...
    // 2. What This Means for You:
    // - ...
    // 3. Next Steps: ...
    // Disclaimer: ...
    const fullFormattedText = `1. The Short Version: ${shortVersion}

2. What This Means for You:
${whatThisMeans.map((item: string) => `• ${item}`).join('\n')}

3. Next Steps: ${nextSteps}

${disclaimer}`;

    const originalWordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const simplifiedWordCount = fullFormattedText.trim().split(/\s+/).filter(Boolean).length;

    return res.json({
      shortVersion,
      whatThisMeans,
      nextSteps,
      disclaimer,
      fullFormattedText,
      category: category || 'general',
      originalGradeLevel,
      wordCountOriginal: originalWordCount,
      wordCountSimplified: simplifiedWordCount,
      keyTermsExplained: parsedData.keyTermsExplained || [],
      suggestedQuestions: parsedData.suggestedQuestions || [],
      highlights: parsedData.highlights || [],
    });
  } catch (error: any) {
    console.error('Error in /api/simplify:', error);
    return res.status(500).json({
      error: error?.message || 'An error occurred while simplifying the text. Please check your connection and try again.',
    });
  }
});

// Ask Question API
app.post('/api/ask-question', async (req, res) => {
  try {
    const { originalText, question, category, language } = req.body;

    if (!originalText || typeof originalText !== 'string' || originalText.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide original document text.' });
    }

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a question.' });
    }

    const ai = getGenAI();

    const languageMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      bn: 'Bengali (বাংলা)',
      mr: 'Marathi (मराठी)',
      te: 'Telugu (తెలుగు)',
      ta: 'Tamil (தமிழ்)',
      gu: 'Gujarati (ગુજરાતી)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ml: 'Malayalam (മലയാളം)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      ur: 'Urdu (اردو)'
    };
    const targetLanguageName = languageMap[language as string] || 'English';

    const systemInstruction = `You are 'Clear-Speak Q&A', a compassionate, simple, and supportive AI document guide.
The user has provided a complex document (classified in the "${category || 'general'}" category) and has a question.

Your task:
1. Provide a direct, reassuring, and completely easy-to-understand answer to their question.
2. Ground your answer strictly in the facts and details present in the original document. If the answer cannot be found in the document, explain that gently but offer helpful, safe, next-step ideas.
3. Keep the language extremely simple (aim for highly accessible terms) and compassionate. Keep the response to 2 to 4 concise sentences or simple, easy-to-read bullet points.
4. Avoid any difficult jargon or intimidating corporate/legal speak.
5. You MUST write your answer in ${targetLanguageName}.

Original Document Text:
"""
${originalText}
"""`;

    const prompt = `User's Question: "${question}"`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let response: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.2,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  answer: {
                    type: Type.STRING,
                    description: 'A simple, direct, compassionate, and easy-to-read answer to the question',
                  },
                },
                required: ['answer'],
              },
            },
          });
          if (response?.text) {
            break;
          }
        } catch (err: any) {
          lastError = err;
          await new Promise((r) => setTimeout(r, 600));
        }
      }
      if (response?.text) {
        break;
      }
    }

    if (!response?.text) {
      throw lastError || new Error('Could not get an answer from the AI right now. Please try again.');
    }

    const responseText = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse ask-question response as JSON:', responseText, parseErr);
      return res.status(500).json({ error: 'Failed to generate a clean explanation format.' });
    }

    return res.json({
      answer: parsedData.answer || 'I am sorry, I was not able to generate an answer. Please try asking again.',
    });
  } catch (error: any) {
    console.error('Error in /api/ask-question:', error);
    return res.status(500).json({
      error: error?.message || 'An error occurred while answering your question. Please try again.',
    });
  }
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clear-Speak server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
