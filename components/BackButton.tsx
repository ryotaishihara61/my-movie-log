// components/BackButton.tsx

"use client";

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="text-blue-400 hover:text-blue-300 transition-colors"
    >
      &larr; 前のページに戻る
    </button>
  );
}