# 產程衛教聊天機器人 (Labor Education Chatbot)

這是一個以 Next.js (App Router) 與 Vercel AI SDK 建構的產房衛教聊天機器人專案。此專案專門設計用來提供孕產婦情緒支持與衛教資訊，並具備安全警示機制。

## 功能特點

1. **三階段體驗**：免責聲明 -> 情境選擇 (初產/經產, 焦慮程度) -> AI 諮詢。
2. **安全機制**：內建危險關鍵字過濾，一旦偵測到大出血、破水等字眼，會立刻阻斷 AI 回覆並強制提醒緊急就醫。
3. **溫馨視覺**：採用 TailwindCSS 實作暖橘色、杏色等醫療安心感設計。
4. **快速對答**：提供快捷問答按鈕。
5. **本地儲存**：將對話紀錄與免責聲明狀態直接存在瀏覽器 `localStorage`，重新整理不遺失。

## Vercel 部署步驟 (Deployment)

本專案支援一鍵部署至 Vercel 平台。

1. **上傳至 GitHub**
   將這個資料夾內的檔案全部推播 (Commit & Push) 到你個人的 GitHub 儲存庫 (Repository)。
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的帳號/你的Repo.git
   git push -u origin main
   ```

2. **匯入 Vercel**
   - 登入 [Vercel](https://vercel.com)。
   - 點擊 **Add New...** -> **Project**。
   - 連結你剛剛建立的 GitHub Repository，點擊 **Import**。

3. **設定環境變數**
   在部署畫面的 **Environment Variables** 區域中，新增一組設定：
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-...(你的 OpenAI API 金鑰)`

4. **完成部署**
   點擊 **Deploy**，等待約 1~2 分鐘，你的產程衛教機器人就上線了🎉！

## 本地開發 (Local Development)

若要在本地端測試與開發：

1. 安裝環境相依套件：
   ```bash
   npm install
   ```
2. 建立本地環境變數檔案 `.env.local` 並加入您的 OpenAI API key：
   ```text
   OPENAI_API_KEY=sk-your-openai-key-here
   ```
3. 啟動開發伺服器：
   ```bash
   npm run dev
   ```
   現在可以在瀏覽器中開啟 [http://localhost:3000](http://localhost:3000) 檢視專案。
