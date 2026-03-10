// src/components/ProblemCard.jsx

import React from 'react';
import MathPreview from './MathPreview';

const ProblemCard = ({ problem, isSelected, onToggle }) => {
  // 安全策：もしデータが壊れていてもエラーにならないようにする
  if (!problem) return null;

  return (
    <div 
      onClick={onToggle}
      style={{
        border: isSelected ? '2px solid #0070f3' : '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '10px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#f0f7ff' : '#fff',
        transition: '0.2s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        {/* span を一行に繋げます */}
        <span style={badgeStyle}>{problem.category || "数学"}</span>
        <input type="checkbox" checked={isSelected} readOnly />
      </div>
      
      {/* p.problem ではなく problem.problem に修正 */}
      <MathPreview tex={problem.problem} />
    </div>
  );
};

const badgeStyle = {
  backgroundColor: '#0070f3',
  color: 'white',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: '0.8rem'
};

export default ProblemCard;