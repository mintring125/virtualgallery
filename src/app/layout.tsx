import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "교실 3D 가상 갤러리",
  description: "학생 작품을 올리고 아바타로 함께 감상하는 교육용 3D 전시 웹앱"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
