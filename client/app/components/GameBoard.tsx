'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'bot' | 'system';
};

const GameBoard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previousWord, setPreviousWord] = useState<string>('');
  const [isGameOver, setIsGameOver] = useState(false);
  
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const getUsedWords = useCallback(() => messages
    .filter(m => m.sender !== 'system')
    .map(msg => msg.text.toLowerCase()), [messages]);

  const startGame = useCallback(async () => {
    setLoading(true);
    setIsGameOver(false);
    setMessages([]);
    setPreviousWord('');
    setError('');
    
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/game/bot-answer`, {
        lang: 'vn',
        usedWords: [] 
      });

      if (res.data.success) {
        const botWord = res.data.word;
        setMessages([{ id: 1, text: botWord, sender: 'bot' }]);
        setPreviousWord(botWord);
      }
    } catch (error) {
      console.error('Start game error:', error);
      setError('Lỗi kết nối Server!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAddMissingWord = useCallback(async () => {
    if (!inputValue.trim()) return;
    const wordToAdd = inputValue.trim();

    try {
      setLoading(true);
      // API PUT: Thêm nhanh
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/dict/${encodeURIComponent(wordToAdd)}`, {
        lang: 'vn'
      });
      window.alert(`Đã thêm từ "${wordToAdd}" thành công!`);
      setError('');
    } catch (error) {
      console.error('Add word error:', error);
      window.alert('Lỗi khi thêm từ!');
    } finally {
      setLoading(false);
    }
  }, [inputValue]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isGameOver) return;
    
    const currentWord = inputValue.trim();
    const usedWordsList = getUsedWords(); 

    setError('');
    setLoading(true);

    try {
      // 1. Check User
      const checkRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/game/check`, {
        currentWord: currentWord,
        previousWord: previousWord,
        lang: 'vn',
        usedWords: usedWordsList
      });

      if (!checkRes.data.valid) {
        setError(checkRes.data.message);
        setLoading(false);
        return;
      }

      const newMessages = [...messages, { id: Date.now(), text: currentWord, sender: 'user' } as Message];
      setMessages(newMessages);
      setInputValue('');
      setPreviousWord(currentWord);

      if (checkRes.data.isEndGame) {
        setMessages(prev => [...prev, { id: Date.now()+9, text: `🏆 ${checkRes.data.message}`, sender: 'system' }]);
        setIsGameOver(true);
        setLoading(false);
        return;
      }

      // 2. Check Bot
      const updatedUsedWords = [...usedWordsList, currentWord.toLowerCase()];
      const botRes = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/game/bot-answer`, {
        previousWord: currentWord,
        lang: 'vn',
        usedWords: updatedUsedWords
      });

      if (botRes.data.success) {
        const botWord = botRes.data.word;
        setMessages(prev => [...prev, { id: Date.now() + 1, text: botWord, sender: 'bot' }]);
        setPreviousWord(botWord);

        if (botRes.data.isEndGame) {
           setTimeout(() => {
             setMessages(prev => [...prev, { id: Date.now()+9, text: `💀 ${botRes.data.message}`, sender: 'system' }]);
             setIsGameOver(true);
           }, 500);
        }

      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, text: "🏳️ Bot hết vốn từ! Bạn thắng!", sender: 'system' }]);
        setIsGameOver(true);
      }

    } catch (error) {
      console.error('Send error:', error);
      setError('Lỗi kết nối!');
    } finally {
      setLoading(false);
    }
  }, [inputValue, isGameOver, getUsedWords, previousWord, messages]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  }, [handleSend]);

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-xl font-bold">Nối Từ Checkmate</h1>
            <p className="text-xs opacity-80">Đuổi cùng giết tận!</p>
          </div>
          <button 
            onClick={startGame}
            className="text-sm bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            Chơi ván mới
          </button>
        </div>

        {/* Chat Box */}
        <div 
          ref={chatBoxRef}
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 bg-slate-50"
        >
          {messages.length === 0 && loading && (
             <div className="text-center text-gray-500 mt-10 animate-bounce">Bot đang ra đề...</div>
          )}

          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center my-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold shadow ${
                    msg.text.includes('thắng') ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {msg.text}
                  </span>
                </div>
              );
            }
            return (
              <div 
                key={msg.id} 
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-base shadow-sm wrap-break-word ${
                  msg.sender === 'user' 
                    ? 'self-end bg-blue-500 text-white rounded-br-none' 
                    : 'self-start bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            );
          })}
          
          {messages.length > 0 && loading && !isGameOver && (
            <div className="self-start text-gray-400 text-sm italic animate-pulse ml-2">
              Bot đang suy nghĩ...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white shrink-0">
          {isGameOver ? (
            <div className="text-center">
              <p className="text-gray-500 mb-2">Ván đấu đã kết thúc.</p>
              <button 
                onClick={startGame}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 w-full"
              >
                Bắt đầu ván mới
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập từ nối tiếp..."
                  disabled={loading}
                  autoFocus
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  Gửi
                </button>
              </div>
              {error && (
                <div className="mt-2 text-center animate-bounce">
                  <p className="text-red-500 text-sm font-medium mb-1">⚠️ {error}</p>
                  {error.includes('không có trong từ điển') && (
                    <button
                      onClick={handleAddMissingWord}
                      className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200 hover:bg-green-200 transition"
                    >
                      ➕ Thêm từ này vào từ điển
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
    </div>
  );
};

export default GameBoard;