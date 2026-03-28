import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, Message } from 'ai';
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

    // 取得前端傳來的情境資料（產婦類型、焦慮程度）
    const parity = data?.parity || 'primipara'; 
    const anxiety = data?.anxiety || 'medium';

    // 建立系統提示詞 (System Prompt)
    const systemPrompt: Message = {
      id: 'system',
      role: 'system',
      content: getSystemPrompt(parity, anxiety),
    };

    // 建立此次對話陣列，將系統提示詞置於首位
    const fullMessages = [systemPrompt, ...messages];

    // 呼叫 Google Gemini API 取得 Streaming Response
    const result = await streamText({
      model: google('gemini-1.5-flash'), // 使用 Gemini Flash
      messages: fullMessages,
      temperature: 0.7, 
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
