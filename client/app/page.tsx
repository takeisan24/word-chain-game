'use client';

import React from 'react';
import GameBoard from './components/GameBoard';
import DictionaryTool from './components/DictionaryTool';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 py-10">
      
      {/* Khối Game chính */}
      <GameBoard />

      {/* Khối Công cụ quản trị bên dưới */}
      <DictionaryTool />

    </main>
  );
}