import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { getSystemPrompt } from '@/lib/prompts';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize Google Generative AI
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, data } = await req.json();

    // 取得前端傳來的情境資料
    const parity = data?.parity || 'primipara'; 
    const anxiety = data?.anxiety || 'medium';

    // Gemini 嚴格規定對話歷史「必須由 user 角色開頭」。
    // 前端預設產生的第一句歡迎詞是 assistant，會導致 Gemini 崩潰，因此在此將其過濾掉。
    let filteredMessages = [...messages];
    while (filteredMessages.length > 0 && filteredMessages[0].role !== 'user') {
      filteredMessages.shift();
    }

    // 呼叫 Google Gemini API 取得 Streaming Response
    const result = await streamText({
      model: google('gemini-1.5-pro'), // 穩定版 Pro 模型
      system: getSystemPrompt(parity, anxiety), 
      messages: filteredMessages,
      temperature: 0.7, 
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
