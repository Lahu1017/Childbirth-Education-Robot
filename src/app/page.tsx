"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { Stethoscope, Send, AlertTriangle, User, ArrowRight, Activity, Smile, Frown } from "lucide-react";

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
    body: {
      data: { parity, anxiety }
    }
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      
      // Save to local storage
      if (messages.length > 0) {
        localStorage.setItem("labor-chatbot-history", JSON.stringify(messages));
      }
    }
  }, [messages]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("labor-chatbot-history");
    const disclaimerSeen = localStorage.getItem("labor-chatbot-disclaimer");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
    if (disclaimerSeen === "true") {
      setStep("setup");
    }
  }, [setMessages]);

  const handleDisclaimerAccept = () => {
    localStorage.setItem("labor-chatbot-disclaimer", "true");
    setStep("setup");
  };

  const handleStartChat = () => {
    if (messages.length === 0) {
      // 預設歡迎訊息
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "您好！我是您的專屬護理師。懷孕與待產的過程十分辛苦，不管您現在覺得害怕、緊張或是痛楚，我都會在這裡陪著您。請問目前有什麼狀況或疑問嗎？"
        }
      ]);
    }
    setStep("chat");
  };

  const handleQuickQuestion = (q: string) => {
    handleFormSubmit(new Event('submit') as any, q);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, overrideInput?: string) => {
    e.preventDefault();
    const targetText = overrideInput || input;
    if (!targetText.trim()) return;

    // 前端緊急關鍵字攔截：若包含危險關鍵字，直接顯示警告
    const hasDanger = DANGER_KEYWORDS.some(k => targetText.includes(k));
    if (hasDanger) {
      setMessages([
        ...messages,
        { id: Date.now().toString(), role: "user", content: targetText },
        { id: (Date.now() + 1).toString(), role: "assistant", content: "⚠️ **請立即聯絡醫療人員或前往醫院！**\n\n您提到的狀況可能是緊急醫療徵兆，請為了寶寶和您的安全，馬上聯絡產房或前往急診，不要再繼續等待了！" }
      ]);
      handleInputChange({ target: { value: "" } } as any); // Clear input
      return;
    }

    // 正常傳送
    if (overrideInput) {
      // If triggered by quick button, simulated event is passed but we need to update input state
      handleSubmit(e, { data: { parity, anxiety } });
      // Temporary workaround for AI SDK UseChat to submit custom text immediately
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
      handleInputChange({ target: { value: overrideInput } } as any);
      setTimeout(() => handleSubmit(fakeEvent), 50);
    } else {
      handleSubmit(e, { data: { parity, anxiety } });
    }
  };

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto bg-background shadow-xl sm:border-x border-gray-100 overflow-hidden relative">
      
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-full">
            <Stethoscope size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg">產房小幫手</h1>
            <p className="text-xs opacity-90">溫柔護理師 24h 陪伴您</p>
          </div>
        </div>
        {step === "chat" && (
          <button 
            onClick={() => setStep("setup")}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
          >
            調整情境
          </button>
        )}
      </header>

      {/* 步驟 1：免責聲明 */}
      {step === "disclaimer" && (
        <div className="flex-1 flex flex-col justify-center p-6 bg-orange-50/50">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-orange-100 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-center mb-4 text-warning">
              <AlertTriangle size={48} />
            </div>
            <h2 className="text-xl font-bold text-center mb-4 text-foreground">醫療免責聲明</h2>
            <div className="text-sm text-gray-600 space-y-3 mb-8">
              <p>本「產程衛教聊天機器人」的目的僅為提供衛教資訊與情緒支持。</p>
              <p className="text-warning font-semibold">⚠️ 機器人的回覆不能取代專業醫師、助產師或護理師的臨床診斷與建議。</p>
              <p>若您出現以下情況：<strong>大出血、破水、劇烈且無法忍受的腹痛、胎動明顯減少</strong>，請立即聯絡您的產檢醫院或前往急診就醫。</p>
            </div>
            <button 
              onClick={handleDisclaimerAccept}
              className="w-full bg-primary hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
            >
              我了解並同意 <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 步驟 2：情境設定 */}
      {step === "setup" && (
        <div className="flex-1 overflow-y-auto p-6 bg-orange-50/30">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User className="text-primary"/> 告訴我您的狀況
          </h2>
          
          <div className="space-y-8 animate-in fade-in zoom-in-95">
            {/* 產婦經驗 */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-3">生產經驗</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setParity("primipara")}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition ${parity === "primipara" ? "border-primary bg-orange-50 text-primary" : "border-gray-200 text-gray-500 hover:border-orange-200"}`}
                >
                  🤰 初產婦 (第一次)
                </button>
                <button
                  onClick={() => setParity("multipara")}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition ${parity === "multipara" ? "border-primary bg-orange-50 text-primary" : "border-gray-200 text-gray-500 hover:border-orange-200"}`}
                >
                  👩‍👧 經產婦 (有經驗)
                </button>
              </div>
            </div>

            {/* 焦慮程度 */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-700 mb-3">目前的焦慮或疼痛程度</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setAnxiety("low")}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition ${anxiety === "low" ? "border-green-400 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"}`}
                >
                  <Smile size={24} />
                  <span className="text-xs font-semibold">放鬆/穩定</span>
                </button>
                <button
                  onClick={() => setAnxiety("medium")}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition ${anxiety === "medium" ? "border-yellow-400 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-500"}`}
                >
                  <Activity size={24} />
                  <span className="text-xs font-semibold">有點痛/緊張</span>
                </button>
                <button
                  onClick={() => setAnxiety("high")}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition ${anxiety === "high" ? "border-red-400 bg-red-50 text-red-700" : "border-gray-200 text-gray-500"}`}
                >
                  <Frown size={24} />
                  <span className="text-xs font-semibold">非常痛/害怕</span>
                </button>
              </div>
            </div>

            <button 
              onClick={handleStartChat}
              className="w-full bg-primary hover:bg-orange-500 text-white font-bold py-4 rounded-xl transition shadow-lg text-lg flex justify-center items-center gap-2"
            >
              開始諮詢 <Stethoscope size={20} />
            </button>
          </div>
        </div>
      )}

      {/* 步驟 3：對話視窗 */}
      {step === "chat" && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 relative pb-32">
            {messages.map((m, index) => (
              <div key={m.id || index} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm/relaxed whitespace-pre-wrap
                  ${m.role === "user" 
                    ? "bg-secondary text-secondary-foreground rounded-tr-none" 
                    : m.content.includes("⚠️") 
                      ? "bg-red-50 border border-red-200 text-red-800 rounded-tl-none" 
                      : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"}`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 text-gray-500 rounded-2xl rounded-tl-none p-4 shadow-sm text-sm flex gap-1 items-center">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-0 w-full bg-white border-t border-gray-200 p-3 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
            {/* Quick Questions */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3 pb-1">
              {QUICK_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleQuickQuestion(q)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-4 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-medium hover:bg-orange-100 transition shadow-sm disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => handleFormSubmit(e)} className="flex items-center gap-2">
              <input
                className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 outline-none"
                value={input}
                onChange={handleInputChange}
                placeholder="請輸入您的問題或感受..."
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-primary hover:bg-orange-500 disabled:bg-gray-300 text-white rounded-xl p-3 transition shadow-md flex-shrink-0"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </>
      )}
    </main>
  );
}
