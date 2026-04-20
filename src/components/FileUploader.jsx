import React from 'react';

const FileUploader = ({ onUpload }) => {
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ★ここが重要：Fileそのものを渡す
    onUpload(file);
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
        <h3>クリックしてTeXファイルを選択</h3>
        <p>（.texファイル）</p>
      </label>
    </div>
  );
};

const dropZoneStyle = {
  border: '2px dashed #0070f3',
  borderRadius: '10px',
  padding: '40px',
  textAlign: 'center',
  backgroundColor: '#f0f7ff',
  margin: '20px 0'
};

export default FileUploader;