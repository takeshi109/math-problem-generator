// components/MathPreview.js の例
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function MathPreview({ tex }) {
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkMath]} 
      rehypePlugins={[rehypeKatex]}
    >
      {/* 渡された文字列を $$ で囲って数式モードにする */}
      {`$$ ${tex} $$`}
    </ReactMarkdown>
  );
}