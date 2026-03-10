import React from 'react';

const ControlPanel = ({ selectedCount, onGenerate }) => {
  return (
    <div style={panelStyle}>
      <p style={{ margin: 0 }}>選択中の問題: <strong>{selectedCount}</strong> 問</p>
      <button 
        onClick={onGenerate}
        disabled={selectedCount === 0}
        style={{
          ...buttonStyle,
          backgroundColor: selectedCount === 0 ? '#ccc' : '#0070f3'
        }}
      >
        PDFプリントを作成
      </button>
    </div>
  );
};

const panelStyle = {
  position: 'fixed',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '90%',
  maxWidth: '600px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 25px',
  backgroundColor: '#fff',
  borderRadius: '50px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
  zIndex: 1000
};

const buttonStyle = {
  padding: '10px 20px',
  color: '#fff',
  border: 'none',
  borderRadius: '25px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: '0.2s'
};

export default ControlPanel;