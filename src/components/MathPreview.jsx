import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // これを忘れると数式が崩れます！

const MathPreview = ({ tex }) => {
  // AIが返してきた文字列が空の場合は何も出さない
  if (!tex) return null;

  const formattedTex = tex.startsWith('$') ? tex : `$$${tex}$$`;

  return (
    <div className="math-preview" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {tex}
      </ReactMarkdown>
    </div>
  );
};

export default MathPreview;