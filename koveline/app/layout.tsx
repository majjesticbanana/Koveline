import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Koveline — Study Grade 9 Islam",
  description:
    "A warm study companion for Maldivian students. Reveal the answer, mark yourself, and watch your weak spots light up — quiz your Grade 9 Islam syllabus.",
  keywords: ["Koveline", "Maldives", "quizzes", "flashcards", "Grade 9", "Islam", "Dhivehi", "study"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=Noto+Sans+Thaana:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
