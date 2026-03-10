// src/lib/texGenerator.js

/**
 * 選択された問題リストから完全なLaTeXソースを生成する
 * @param {Array} selectedProblems - 抽出された問題の配列
 * @param {string} title - プリントのタイトル（先生が入力したもの）
 * @returns {string} - 完成したTeXソースコード
 */
export const generateFullTex = (selectedProblems, title = "数学演習プリント") => {
  
  // 1. ヘッダー（型紙の冒頭部分）
  // 佐々木さんの論文に基づき、XeLaTeX + 日本語対応の構成にします
  const header = `\\documentclass[xelatex,ja=standard]{bxjsarticle}
\\usepackage{amsmath, amssymb}
\\usepackage[ipaex]{zxjafont}
\\usepackage{geometry}
\\geometry{left=20mm,right=20mm,top=20mm,bottom=20mm}

\\begin{document}

\\title{${title}}
\\author{数学問題自動作成ツール}
\\date{\\today}
\\maketitle

\\begin{enumerate}
`;

  // 2. ボディ（選択された問題を1つずつ \item に変換）
  const body = selectedProblems.map(p => {
    // 数式モードの重複を防ぎ、\displaystyle を付与する処理
    const cleanMath = p.problem.replace(/\\\(|\\\)|\\\[|\\\]|\$/g, "").trim();
    return `  \\item $\\displaystyle ${cleanMath}$`;
  }).join("\n");

  // 3. フッター（閉じタグ）
  const footer = `
\\end{enumerate}
\\end{document}`;

  return header + body + footer;
};