import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const allseto = localFont({
  src: "../fonts/cjkFonts_allseto_v1.11.ttf",
  variable: "--font-allseto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "產房小幫手",
  description: "以溫暖舒緩風格，專門陪伴孕產婦的貼心對話機器人。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${allseto.variable} font-sans tracking-wide`}>
        {children}
      </body>
    </html>
  );
}
