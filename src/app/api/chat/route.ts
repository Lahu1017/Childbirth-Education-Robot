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

    // 呼叫 Google Gemini API 取得 Streaming Response
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      system: getSystemPrompt(parity, anxiety), // <== 改用專屬的 system 參數
      messages: messages, // 這裡只放 user 跟 assistant 的純淨對話紀錄
      temperature: 0.7, 
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
