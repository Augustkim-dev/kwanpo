import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "인사 게시판",
  description: "누구나 부담 없이 인사를 남길 수 있는 공간",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}
