import { useState, useEffect } from 'react';
import { dbClient } from '../lib/dbClient';
import MathPreview from '../components/MathPreview';

export default function Library() {
    const [allProblems, setAllProblems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);

    // データの読み込み
    const loadData = async () => {
        setLoading(true);
        try {
            // 修正箇所1: getAll() に名称変更
            const response = await dbClient.fetchAll();
            setAllProblems(response.data || []); // main.py の返却形式 {"data": [...]} に合わせる
        } catch (error) {
            console.error("DB読み込み失敗:", error);
        } finally {
            setLoading(false);
        }
    };

    // 全選択 / 全解除を切り替える関数
     const toggleAll = () => {
       if (selectedIds.length === allProblems.length) {
         // すべて選択済みなら、全解除
         setSelectedIds([]);
       } else {
         // そうでなければ、全問題のIDをセット
         setSelectedIds(allProblems.map(p => p.id));
       }
     };  

    useEffect(() => {
        loadData();
    }, []);

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(idRef => idRef !== id) : [...prev, id]
        );
    };

    const handlePrint = () => {
        if (selectedIds.length === 0) return alert("プリントしたい問題を選んでください");
        window.print();
    };

    // --- 削除処理 ---
    const handleDelete = async () => {
        if (selectedIds.length === 0) return alert("消したい問題を選んでください");
        
        const ok = window.confirm(`選択した ${selectedIds.length} 件の問題を削除しますか？`);
        if (!ok) return;

        try {
            // 修正箇所2: dbClient.delete を使って 8000 番ポートへ通信
            const response = await dbClient.delete(selectedIds);

            if (response.status === "success") {
                alert("削除しました");
                await loadData();
                setSelectedIds([]);
            } else {
                alert("削除に失敗しました");
            }
        } catch (error) {
            console.error("削除エラー:", error);
            alert("サーバーとの通信に失敗しました");
        }
    };

    if (loading) return <div className="no-print">読み込み中...</div>;

    const selectedProblems = allProblems.filter(p => selectedIds.includes(p.id));

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            
            <div className="no-print">
                <h1> 問題バンク (SQLite)</h1>
                <p>蓄積数: {allProblems.length} 問 / 選択中: {selectedIds.length} 問</p>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={handlePrint} style={buttonStyle}>
                         PDFを作成 (印刷)
                    </button>
                    
                    <button onClick={handleDelete} style={deleteButtonStyle}>
                         選択した問題を削除
                    </button>
                </div>
        {allProblems.length > 0 && (
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <button onClick={toggleAll} style={subButtonStyle}>
              {selectedIds.length === allProblems.length ? "全解除" : "全選択"}
            </button>
          </div>
        )}
                <div style={{ display: 'grid', gap: '15px', marginBottom: '50px' }}>
                    {allProblems.map((prob, index) => (
                        <div key={prob.id || index} 
                             style={{ 
                                border: `2px solid ${selectedIds.includes(prob.id) ? '#0070f3' : '#eee'}`, 
                                padding: '15px', borderRadius: '8px', display: 'flex', gap: '15px', 
                                alignItems: 'flex-start', cursor: 'pointer',
                                background: selectedIds.includes(prob.id) ? '#f0f7ff' : 'white'
                             }} 
                             onClick={() => toggleSelect(prob.id)}>
                            <input type="checkbox" checked={selectedIds.includes(prob.id)} readOnly style={{ width: '20px', height: '20px' }} />
                            <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>[{prob.category}]</span>
                                {/* 修正箇所3: DBのカラム名に合わせて prob.problem_latex を優先 */}
                                <MathPreview tex={prob.problem_latex || prob.problem} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 印刷用エリア */}
            <div className="print-only">
                <div style={printHeaderStyle}>
                    <h2 style={{ margin: 0 }}>数学 演習プリント</h2>
                    <div style={{ fontSize: '1.1rem' }}>氏名：__________________________</div>
                </div>
                <div style={columnContainerStyle}>
                    {selectedProblems.map((prob, index) => (
                        <div key={index} style={problemWrapperStyle}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ fontWeight: 'bold' }}>({index + 1})</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.95rem' }}>
                                        <MathPreview tex={prob.problem_latex || prob.problem} />
                                    </div>
                                </div>
                            </div>
                            <div style={answerSpaceStyle}></div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    @page { size: A4; margin: 15mm; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { 
                        background: white; 
                        /* 数式がきれいに見えるように明朝体系を設定 */
                        font-family: "Times New Roman", "MS Mincho", serif; 
                    }
                    /* KaTeXのフォントが円記号に化けないように強制する */
                    .katex { font-family: KaTeX_Main, Times New Roman, serif !important; }
                }
                .print-only { display: none; }
            `}</style>
        </div>
    );
}

// スタイル定義（変更なし）
const buttonStyle = { padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const deleteButtonStyle = { padding: '12px 24px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const printHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid black', paddingBottom: '5px', marginBottom: '20px' };
const columnContainerStyle = { columnCount: 2, columnGap: '40px', columnRule: '1px solid #ccc' };
const problemWrapperStyle = { marginBottom: '25px', pageBreakInside: 'avoid', breakInside: 'avoid', display: 'block' };
const answerSpaceStyle = { height: '80px', borderBottom: '1px dashed #ddd', marginTop: '10px', marginLeft: '25px' };
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