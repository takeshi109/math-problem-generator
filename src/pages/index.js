import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import ProblemCard from '../components/ProblemCard';
import { parseTexWithGroq } from '../lib/groqParser';
// DB保存用のクライアントを読み込み
import { dbClient } from '../lib/dbClient';

export default function Home() {
  const [problems, setProblems] = useState([]); 
  const [selectedIds, setSelectedIds] = useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [apiKey, setApiKey] = useState(''); 

  // LaTeXファイルのアップロードと解析
  const handleUpload = async (content) => {
    if (!apiKey) {
      alert("先にGroqのAPIキーを入力してください");
      return;
    }
    setIsLoading(true);
    try {
      const data = await parseTexWithGroq(content, apiKey);
      if (data && data.problems) {
        setProblems(data.problems);
        setSelectedIds([]); // 新しいファイルが来たら選択をリセット
      } else {
        alert("AIからのデータ形式が想定と異なります。");
      }
    } catch (error) {
      console.error(error);
      alert("解析に失敗しました。APIキーを確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  // 問題の選択/解除を切り替える（トグル）
 const toggleSelect = (problemId) => {
    setSelectedIds(prev =>
        // problemId を使ってチェック・追加・削除を行う
        prev.includes(problemId) 
            ? prev.filter(id => id !== problemId) 
            : [...prev, problemId]
    );
};
  // 選択した問題をDB(TinyDB)に保存する
  const handleSave = async () => {
    const selectedProblems = problems.filter((p) => selectedIds.includes(p.id));
    
    if (selectedProblems.length === 0) {
      alert("保存したい問題を選択してください");
      return;
    }

    setIsLoading(true);
    try {
      const response = await dbClient.save(selectedProblems);
      if (response.status === "success") {
        alert(`${response.count} 問をデータベース（TinyDB）に保存しました！`);
        // 保存済みのものを画面から消す、あるいは選択をクリアする
        setProblems(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      }
    } catch (error) {
      console.error("保存失敗:", error);
      alert("DBへの保存に失敗しました。Pythonサーバーが起動しているか確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}> 数学問題 抽出・蓄積システム</h1>

      {/* ページ上部のナビゲーション */}
      <nav style={{ textAlign: 'right', marginBottom: '20px' }}>
        <a href="/library" style={{ 
          textDecoration: 'none', 
          color: '#0070f3', 
          fontWeight: 'bold',
          padding: '8px 16px',
          border: '1px solid #0070f3',
          borderRadius: '20px'
        }}>
          Libraryを開く →
        </a>
      </nav>

      <section style={{ marginBottom: '30px', background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>1. APIキー設定</p>
        <input 
          type="password" 
          placeholder="Groq API Key (gsk_...)" 
          value={apiKey} 
          onChange={(e) => setApiKey(e.target.value)}
          style={{ width: '100%', padding: '12px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      </section>

      <section style={{ marginBottom: '30px' }}>
        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>2. TeXファイルを読み込んで解析</p>
        <FileUploader onUpload={handleUpload} />
      </section>

      {isLoading && <p style={{ textAlign: 'center', color: '#0070f3', fontWeight: 'bold' }}>✨ 処理中...</p>}

      <div style={{ margin: '20px 0' }}>
        {problems.map((p, idx) => (
          <ProblemCard 
            key={p.id || idx} 
            problem={p} 
            isSelected={selectedIds.includes(p.id)} 
            onToggle={() => toggleSelect(p.id)} 
          />
        ))}
      </div>

      {/* 問題が抽出されている時だけ「保存ボタン」を表示 */}
      {problems.length > 0 && (
        <button 
          onClick={handleSave}
          style={saveButtonStyle}
        >
          選択した {selectedIds.length} 問をDBに保存
        </button>
      )}
    </div>
  );
}

// 保存ボタンのスタイル（目立つように緑色にしています）
const saveButtonStyle = {
  position: 'fixed', 
  bottom: '20px', 
  right: '20px',
  padding: '15px 40px', 
  fontSize: '1.2rem',
  backgroundColor: '#28a745', // 保存をイメージする緑
  color: '#fff',
  border: 'none', 
  borderRadius: '30px', 
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(40,167,69,0.39)',
  fontWeight: 'bold', 
  zIndex: 100
};