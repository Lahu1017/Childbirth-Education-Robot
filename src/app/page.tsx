"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { Stethoscope, Send, AlertTriangle, User, ArrowRight, Activity, Smile, Frown, Sparkles } from "lucide-react";

type AppStep = "disclaimer" | "setup" | "chat";

const DANGER_KEYWORDS = ["出血", "鮮血", "劇烈痛", "一直痛", "破水", "陰道流血", "大出血", "異常"];
const QUICK_QUESTIONS = [
  "我怎麼分辨真假陣痛？",
  "現在痛起來可以怎麼呼吸？",
  "第一產程大概會痛多久？",
  "有沒有什麼減痛的方法？",
  "什麼時候該去醫院報到？"
];

export default function ChatPage() {
  const [step, setStep] = useState<AppStep>("disclaimer");
  const [parity, setParity] = useState<"primipara" | "multipara">("primipara");
  const [anxiety, setAnxiety] = useState<"low" | "medium" | "high">("medium");

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading } = useChat({
    api: "/api/chat",
    body: { data: { parity, anxiety } }
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      if (messages.length > 0) {
        localStorage.setItem("labor-chatbot-history", JSON.stringify(messages));
      }
    }
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem("labor-chatbot-history");
    const disclaimerSeen = localStorage.getItem("labor-chatbot-disclaimer");
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    if (disclaimerSeen === "true") { setStep("setup"); }
  }, [setMessages]);

  const handleDisclaimerAccept = () => {
    localStorage.setItem("labor-chatbot-disclaimer", "true");
    setStep("setup");
  };

  const handleStartChat = () => {
    if (messages.length === 0) {
      setMessages([{ id: "welcome", role: "assistant", content: "您好！我是您的專屬護理師。懷孕與待產的過程十分辛苦，不管您現在覺得害怕、緊張或是痛楚，我都會在這裡陪著您。請問目前有什麼狀況或疑問嗎？" }]);
    }
    setStep("chat");
  };

  const handleQuickQuestion = (q: string) => { handleFormSubmit(new Event('submit') as any, q); };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, overrideInput?: string) => {
    e.preventDefault();
    const targetText = overrideInput || input;
    if (!targetText.trim()) return;
    const hasDanger = DANGER_KEYWORDS.some(k => targetText.includes(k));
    if (hasDanger) {
      setMessages([...messages,
        { id: Date.now().toString(), role: "user", content: targetText },
        { id: (Date.now() + 1).toString(), role: "assistant", content: "⚠️ **請立即聯絡醫療人員或前往醫院！**\n\n您提到的狀況可能是緊急醫療徵兆，請為了寶寶和您的安全，馬上聯絡產房或前往急診，不要再繼續等待了！" }
      ]);
      handleInputChange({ target: { value: "" } } as any);
      return;
    }
    if (overrideInput) {
      handleSubmit(e, { data: { parity, anxiety } });
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
      handleInputChange({ target: { value: overrideInput } } as any);
      setTimeout(() => handleSubmit(fakeEvent), 50);
    } else {
      handleSubmit(e, { data: { parity, anxiety } });
    }
  };

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto shadow-2xl overflow-hidden relative sm:border-x border-rose-50">
      <header className="sticky top-0 glass-panel border-b border-rose-100 z-20 px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#f8c3bb] to-[#fb9285] p-2.5 rounded-2xl shadow-md text-white">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-rose-500 tracking-wide">產房小幫手</h1>
            <p className="text-xs text-rose-400 opacity-90">溫柔護理師 24h 陪伴您</p>
          </div>
        </div>
        {step === "chat" && (
          <button onClick={() => setStep("setup")} className="text-xs font-semibold text-rose-500 bg-white/60 hover:bg-white border border-rose-100 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md">
            調整狀態
          </button>
        )}
      </header>

      {step === "disclaimer" && (
        <div className="flex-1 flex flex-col justify-center p-6">
          <div className="glass-panel p-8 rounded-[2rem] shadow-xl">
            <div className="flex justify-center mb-6 text-rose-400">
              <div className="bg-rose-50 p-4 rounded-full border border-rose-100">
                <AlertTriangle size={42} strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-5 text-rose-600">醫療免責聲明</h2>
            <div className="text-sm leading-relaxed text-gray-600 space-y-4 mb-8 bg-white/40 p-5 rounded-2xl border border-white/50">
              <p>本「產房小幫手」的目的僅為提供衛教資訊與情緒支持，陪您度過焦慮的待產時刻。</p>
              <p className="text-rose-500 font-bold bg-rose-50 p-2 rounded-lg text-center">⚠️ 不能取代專業醫師的臨床診斷。</p>
              <p>若您出現以下情況：<strong>大出血、破水、無法忍受的劇痛、胎動明顯減少</strong>，請立即前往急診就醫。</p>
            </div>
            <button onClick={handleDisclaimerAccept} className="w-full bg-gradient-to-r from-[#f8c3bb] to-[#fb9285] text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg hover:-translate-y-1 transition-all">
              我了解並同意 <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {step === "setup" && (
        <div className="flex-1 overflow-y-auto p-6 pb-10">
          <h2 className="text-2xl font-bold text-rose-600 mb-8 flex items-center gap-3">
            <div className="bg-rose-100 p-2 rounded-xl"><User className="text-rose-500" size={24}/></div>
            告訴我您的狀況
          </h2>
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-[2rem]">
              <label className="block text-base font-bold text-rose-500 mb-4 pb-2 border-b border-rose-100/50">生產經驗</label>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setParity("primipara")} className={`p-4 rounded-2xl border-2 text-[15px] font-bold transition-all ${parity === "primipara" ? "border-rose-300 bg-rose-50 text-rose-600 scale-105" : "border-transparent bg-white/70 text-gray-500 hover:scale-105"}`}>
                  <span className="block text-2xl mb-1">🤰</span> 第一次生產
                </button>
                <button onClick={() => setParity("multipara")} className={`p-4 rounded-2xl border-2 text-[15px] font-bold transition-all ${parity === "multipara" ? "border-rose-300 bg-rose-50 text-rose-600 scale-105" : "border-transparent bg-white/70 text-gray-500 hover:scale-105"}`}>
                  <span className="block text-2xl mb-1">👩‍👧</span> 不是第一次
                </button>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-[2rem]">
              <label className="block text-base font-bold text-rose-500 mb-4 pb-2 border-b border-rose-100/50">目前的焦慮或疼痛程度</label>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setAnxiety("low")} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${anxiety === "low" ? "border-green-300 bg-green-50 text-green-700 scale-105" : "border-transparent bg-white/70 text-gray-400 hover:scale-105"}`}>
                  <Smile size={28} /><span className="text-sm font-bold">還能放鬆</span>
                </button>
                <button onClick={() => setAnxiety("medium")} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${anxiety === "medium" ? "border-orange-300 bg-orange-50 text-orange-700 scale-105" : "border-transparent bg-white/70 text-gray-400 hover:scale-105"}`}>
                  <Activity size={28} /><span className="text-sm font-bold">稍微緊張</span>
                </button>
                <button onClick={() => setAnxiety("high")} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${anxiety === "high" ? "border-rose-300 bg-rose-50 text-rose-600 scale-105" : "border-transparent bg-white/70 text-gray-400 hover:scale-105"}`}>
                  <Frown size={28} /><span className="text-sm font-bold">非常害怕</span>
                </button>
              </div>
            </div>
            <button onClick={handleStartChat} className="w-full bg-gradient-to-r from-[#fb9285] to-[#f43f5e] text-white font-bold py-4 rounded-2xl shadow-xl text-lg flex justify-center items-center gap-2 hover:-translate-y-1 transition-all">
              開始與護理師對話 <Stethoscope size={22} />
            </button>
          </div>
        </div>
      )}

      {step === "chat" && (
        <div className="flex-1 relative flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 pb-44">
            {messages.map((m, index) => (
              <div key={m.id || index} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-4 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm
                  ${m.role === "user"
                    ? "bg-gradient-to-br from-[#ffd6d0] to-[#fbb5ab] text-stone-800 rounded-[2rem] rounded-tr-md"
                    : m.content.includes("⚠️")
                      ? "bg-rose-50 border border-rose-300 text-rose-700 rounded-[2rem] rounded-tl-md"
                      : "glass-panel text-gray-700 rounded-[2rem] rounded-tl-md"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass-panel text-rose-400 rounded-[2rem] rounded-tl-md p-4 shadow-sm flex gap-1.5 items-center">
                  <span className="animate-bounce inline-block w-2 h-2 bg-rose-300 rounded-full" style={{animationDelay:'0ms'}}></span>
                  <span className="animate-bounce inline-block w-2 h-2 bg-rose-300 rounded-full" style={{animationDelay:'150ms'}}></span>
                  <span className="animate-bounce inline-block w-2 h-2 bg-rose-400 rounded-full" style={{animationDelay:'300ms'}}></span>
                </div>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 w-full px-4 pb-6 flex flex-col gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none'}}>
              {QUICK_QUESTIONS.map(q => (
                <button key={q} onClick={() => handleQuickQuestion(q)} disabled={isLoading}
                  className="whitespace-nowrap px-4 py-2 bg-white/80 backdrop-blur-md text-rose-600 border border-white/50 rounded-full text-sm font-bold hover:bg-rose-50 transition-all shadow-sm disabled:opacity-50">
                  {q}
                </button>
              ))}
            </div>
            <div className="glass-panel shadow-2xl rounded-[2rem] p-2">
              <form onSubmit={(e) => handleFormSubmit(e)} className="flex items-center gap-2">
                <input
                  className="flex-1 bg-transparent text-gray-800 text-base px-4 py-3 outline-none placeholder:text-gray-400/80"
                  value={input} onChange={handleInputChange}
                  placeholder="想問些什麼呢？..." disabled={isLoading} autoComplete="off"
                />
                <button type="submit" disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-[#fb9285] to-[#f43f5e] disabled:from-gray-300 disabled:to-gray-200 text-white rounded-full p-3 transition-all shadow-md active:scale-95 flex-shrink-0 mr-1">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
