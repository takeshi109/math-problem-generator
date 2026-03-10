import React, { useCallback } from 'react';

// 先生が直感的に操作できる「ドロップエリア」を作ります
const FileUploader = ({ onUpload }) => {
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    // 日本語のTeXファイル（Shift-JIS）にも対応できるよう読み込みます
    reader.onload = (event) => {
      const content = event.target.result;
      onUpload(content); // 読み込んだ中身を親（index.js）に渡す
    };

    // まずはUTF-8で試みて、失敗を考慮するならここを拡張します
    reader.readAsText(file, "Shift_JIS"); 
  };

  return (
    <div style={dropZoneStyle}>
      <input 
        type="file" 
        accept=".tex" 
        onChange={handleFileChange} 
        id="file-input"
        style={{ display: 'none' }} 
      />
      <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
        <h3> ここをクリックするか、TeXファイルをドロップ</h3>
        <p>（ .tex ファイルを選択してください）</p>
      </label>
    </div>
  );
};

// 見た目を整えるためのデザイン（CSS）
const dropZoneStyle = {
  border: '2px dashed #0070f3',
  borderRadius: '10px',
  padding: '40px',
  textAlign: 'center',
  backgroundColor: '#f0f7ff',
  margin: '20px 0'
};

export default FileUploader;