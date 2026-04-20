import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import ProblemCard from '../components/ProblemCard';
import { dbClient } from '../lib/dbClient';

export default function Home() {
  const [problems, setProblems] = useState([]); 
  const [selectedIds, setSelectedIds] = useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [apiKey, setApiKey] = useState(''); 

  // --- Pythonの解析APIを叩く ---
  const handleUpload = async (file) => {
    console.log("file:", file);
    console.log("type:", typeof file);
    console.log("instanceof File:", file instanceof File);
    if (!apiKey) return alert("先にGroqのAPIキーを入力してください");
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);

    try {
      const response = await fetch('http://127.0.0.1:8000/extract-problems', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("解析失敗");
      const data = await response.json();

      if (data && data.problems) {
        const problemsWithId = data.problems.map((p, index) => ({
          ...p,
          id: `temp-${Date.now()}-${index}` 
        }));
        setProblems(problemsWithId);
        setSelectedIds([]); 
        alert("抽出完了！保存したい問題を選択してください。");
      }
    } catch (error) {
      console.error(error);
      alert("Pythonサーバーとの通信に失敗しました。127.0.0.1:8000を確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (problemId) => {
    setSelectedIds(prev =>
      prev.includes(problemId) ? prev.filter(id => id !== problemId) : [...prev, problemId]
    );
  };

  const handleSave = async () => {
    const selectedProblems = problems.filter((p) => selectedIds.includes(p.id));
    if (selectedProblems.length === 0) return alert("問題を選択してください");

    setIsLoading(true);
    try {
      const response = await dbClient.save(selectedProblems);
      if (response.status === "success") {
        alert("DBに保存しました");
        setProblems(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      }
    } catch (error) {
      alert("保存失敗");
    } finally {
      setIsLoading(false);
    }
  };

  // 全選択 / 全解除を切り替える関数
  const toggleAll = () => {
    if (selectedIds.length === problems.length) {
      // すべて選択済みなら、全解除
      setSelectedIds([]);
    } else {
      // そうでなければ、全問題のIDをセット
      setSelectedIds(problems.map(p => p.id));
    }
  };  


  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>数学問題 抽出システム</h1>
      
      <nav style={{ textAlign: 'right', marginBottom: '20px' }}>
        <a href="/library" style={linkStyle}>Libraryを開く →</a>
      </nav>

      <section style={sectionStyle}>
        <p>1. APIキー設定</p>
        <input 
          type="password" 
          placeholder="Groq API Key" 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)}
          style={inputStyle}
        />
      </section>
      

      <section style={{ marginBottom: '30px' }}>
        <p>2. TeXファイルを読み込んで解析</p>
        <FileUploader onUpload={handleUpload} />
      </section>

      {problems.length > 0 && (
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <button onClick={toggleAll} style={subButtonStyle}>
            {selectedIds.length === problems.length ? "全解除" : "全選択"}
          </button>
        </div>
      )}

      {isLoading && <p style={{ textAlign: 'center', color: '#0070f3' }}>✨ 処理中...</p>}

      <div style={{ margin: '20px 0' }}>
        {problems.map((p) => (
          <ProblemCard 
            key={p.id} 
            problem={p} 
            isSelected={selectedIds.includes(p.id)} 
            onToggle={() => toggleSelect(p.id)} 
          />
        ))}
      </div>

      {problems.length > 0 && (
        <button onClick={handleSave} style={saveButtonStyle}>
          選択した {selectedIds.length} 問をDBに保存
        </button>
      )}
    </div>
  );
}

const linkStyle = { textDecoration: 'none', color: '#0070f3', fontWeight: 'bold', padding: '8px 16px', border: '1px solid #0070f3', borderRadius: '20px' };
const sectionStyle = { marginBottom: '30px', background: '#f8f9fa', padding: '20px', borderRadius: '10px' };
const inputStyle = { width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' };
const saveButtonStyle = { position: 'fixed', bottom: '20px', right: '20px', padding: '15px 40px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', zIndex: 100 };
const subButtonStyle = {
  padding: '8px 16px',
  backgroundColor: '#6c757d', // 控えめなグレー
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold'
};