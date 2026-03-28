import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { getSystemPrompt } from '@/lib/prompts';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Initialize Groq AI (Free, Fast, Llama-3, No Geo-blocks)
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, data } = await req.json();

    // 取得前端傳來的情境資料
    const parity = data?.parity || 'primipara'; 
    const anxiety = data?.anxiety || 'medium';

    // 呼叫 Groq API (Llama-3.1-70B) 取得 Streaming Response
    const result = await streamText({
      model: groq('llama-3.1-70b-versatile'), // 最強大的免費 Llama-3.1-70B 模型
      system: getSystemPrompt(parity, anxiety), 
      messages: messages, // Llama-3 接受所有的角色，包含 assistant 開頭
      temperature: 0.7, 
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
