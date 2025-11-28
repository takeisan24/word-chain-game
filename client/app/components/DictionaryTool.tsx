'use client';

import React, { useState, useCallback } from 'react';
import axios from 'axios';

// Định nghĩa kiểu dữ liệu cho Từ
interface WordData {
  _id?: string;
  text: string;
  lang: 'vn' | 'en';
  startKey: string;
}

const DictionaryTool = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Trạng thái cho chế độ chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ lang: 'vn' | 'en' }>({ lang: 'vn' });

  // 1. READ: Tra cứu từ
  const handleSearch = useCallback(async () => {
    const trimmedTerm = searchTerm.trim();
    if (!trimmedTerm) {
      setMsg({ text: '⚠️ Vui lòng nhập từ cần tra cứu!', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMsg(null);
    setWordData(null);
    setIsEditing(false);

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dict/${encodeURIComponent(trimmedTerm)}`);
      setWordData(res.data.data);
      setMsg({ text: '✅ Đã tìm thấy từ trong cơ sở dữ liệu.', type: 'success' });
    } catch (error) {
      console.error('Search error:', error);
      setMsg({ text: '❌ Từ này chưa có trong từ điển.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // 2. CREATE / UPDATE: Thêm mới hoặc Cập nhật
  const handleSave = useCallback(async () => {
    // Nếu đang edit thì lấy text từ wordData, nếu thêm mới thì lấy từ searchTerm
    const textToSave = isEditing && wordData ? wordData.text : searchTerm.trim();
    const langToSave = isEditing ? editForm.lang : 'vn'; // Mặc định thêm mới là VN, sửa thì theo form

    if (!textToSave) {
      setMsg({ text: '⚠️ Vui lòng nhập từ cần lưu!', type: 'error' });
      return;
    }
    setLoading(true);
    setMsg(null);

    try {
      // Gọi API PUT (Upsert - Có thì sửa, chưa có thì thêm)
      const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/dict/${encodeURIComponent(textToSave)}`, {
        lang: langToSave
      });

      setWordData(res.data.data);
      setMsg({ 
        text: isEditing ? '💾 Đã cập nhật thông tin thành công!' : '✨ Đã thêm từ mới thành công!', 
        type: 'success' 
      });
      setIsEditing(false); // Tắt chế độ sửa
    } catch (error) {
      console.error('Save error:', error);
      setMsg({ text: '⚠️ Lỗi khi lưu dữ liệu!', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [isEditing, wordData, searchTerm, editForm.lang]);

  // 3. DELETE: Xóa từ
  const handleDelete = useCallback(async () => {
    if (!wordData) return;
    if (!window.confirm(`Bạn chắc chắn muốn xóa từ "${wordData.text}" vĩnh viễn?`)) return;

    setLoading(true);
    setMsg(null);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/dict/${encodeURIComponent(wordData.text)}`);
      setWordData(null);
      setSearchTerm('');
      setMsg({ text: '🗑️ Đã xóa từ khỏi từ điển.', type: 'info' });
    } catch (error) {
      console.error('Delete error:', error);
      setMsg({ text: 'Lỗi khi xóa từ!', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [wordData]);

  // Bật chế độ sửa
  const startEdit = useCallback(() => {
    if (wordData) {
      setEditForm({ lang: wordData.lang });
      setIsEditing(true);
      setMsg(null);
    }
  }, [wordData]);

  // Hủy sửa
  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    if (wordData) {
      setEditForm({ lang: wordData.lang });
    }
  }, [wordData]);

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg mt-8 border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          🛠️ Quản trị Từ điển
        </h3>
        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Admin Mode</span>
      </div>
      
      <div className="p-6">
        {/* Thanh tìm kiếm */}
        <div className="flex gap-2 mb-4">
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Nhập từ cần tra soát hoặc thêm mới..."
            className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition-all"
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? '...' : '🔍 Tìm'}
          </button>
        </div>

        {/* Thông báo */}
        {msg && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-medium ${
            msg.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
            msg.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {msg.text}
          </div>
        )}

        {/* --- TRƯỜNG HỢP 1: TÌM THẤY TỪ (HIỆN THÔNG TIN & NÚT SỬA/XÓA) --- */}
        {wordData && (
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-2xl font-bold text-slate-800 mb-1">{wordData.text}</h4>
                <p className="text-slate-500 text-sm">ID: {wordData._id}</p>
                <div className="mt-2 inline-flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600">Ngôn ngữ:</span>
                    
                    {/* Nếu đang sửa thì hiện Select, không thì hiện Text */}
                    {isEditing ? (
                        <select 
                            value={editForm.lang}
                            onChange={(e) => setEditForm({ lang: e.target.value as 'vn' | 'en' })}
                            className="border border-blue-300 rounded px-2 py-1 text-sm bg-white text-black"
                        >
                            <option value="vn">Tiếng Việt (vn)</option>
                            <option value="en">Tiếng Anh (en)</option>
                        </select>
                    ) : (
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            wordData.lang === 'vn' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {wordData.lang}
                        </span>
                    )}
                </div>
              </div>

              {/* Nhóm nút hành động */}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button onClick={handleSave} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">💾 Lưu</button>
                    <button onClick={cancelEdit} className="bg-gray-400 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-500">❌ Hủy</button>
                  </>
                ) : (
                  <>
                    <button onClick={startEdit} className="bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-yellow-600">✏️ Sửa</button>
                    <button onClick={handleDelete} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600">🗑️ Xóa</button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TRƯỜNG HỢP 2: KHÔNG TÌM THẤY (HIỆN NÚT THÊM MỚI) --- */}
        {!wordData && msg?.type === 'error' && searchTerm && (
          <div className="text-center mt-4 p-6 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-500 mb-3">Từ <strong>&ldquo;{searchTerm}&rdquo;</strong> chưa có trong hệ thống.</p>
            <button 
                onClick={handleSave} // Ở đây handleSave sẽ đóng vai trò là hàm Create
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:bg-green-700 shadow-md transition-transform hover:scale-105"
            >
              ➕ Thêm &ldquo;{searchTerm}&rdquo; vào từ điển Tiếng Việt
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DictionaryTool;