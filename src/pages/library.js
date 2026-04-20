import { useState, useEffect } from 'react';
import { dbClient } from '../lib/dbClient';
import MathPreview from '../components/MathPreview';

export default function Library() {
    const [allProblems, setAllProblems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("ALL");

    // データの読み込み
    const loadData = async () => {
        setLoading(true);
        try {
            const response = await dbClient.fetchAll();
            setAllProblems(response.data || []);
        } catch (error) {
            console.error("DB読み込み失敗:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // 絞り込み後の問題リスト
    const filteredProblems = selectedCategory === "ALL"
        ? allProblems
        : allProblems.filter(p => p.category === selectedCategory);

    // 表示されている問題のみを対象とした全選択 / 全解除
    const toggleAll = () => {
        const allFilteredSelected = filteredProblems.every(p => selectedIds.includes(p.id));

        if (allFilteredSelected) {
            // 表示中のIDを選択リストから除外
            const filteredIds = filteredProblems.map(p => p.id);
            setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            // 表示中のIDを選択リストに追加（重複排除）
            const newIds = [...new Set([...selectedIds, ...filteredProblems.map(p => p.id)])];
            setSelectedIds(newIds);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(idRef => idRef !== id) : [...prev, id]
        );
    };

    const handlePrint = () => {
        if (selectedIds.length === 0) return alert("プリントしたい問題を選んでください");
        window.print();
    };

    const handleDelete = async () => {
        if (selectedIds.length === 0) return alert("消したい問題を選んでください");
        
        const ok = window.confirm(`選択した ${selectedIds.length} 件の問題を削除しますか？`);
        if (!ok) return;

        try {
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

    // 実際にチェックが入っている問題（印刷用）
    const selectedProblemsForPrint = allProblems.filter(p => selectedIds.includes(p.id));

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* --- ブラウザ表示用（印刷時には隠す） --- */}
            <div className="no-print">
                <h1>問題バンク (SQLite)</h1>
                <p>蓄積数: {allProblems.length} 問 / 選択中: {selectedIds.length} 問</p>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={handlePrint} style={buttonStyle}>
                        PDFを作成 (印刷)
                    </button>
                    <button onClick={handleDelete} style={deleteButtonStyle}>
                        選択した問題を削除
                    </button>
                </div>

                {/* 絞り込み・全選択エリア */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px' }}>
                    <div style={{ textAlign: 'left' }}>
                        <span style={{ marginRight: '10px', fontSize: '0.9rem' }}>単元で絞り込み:</span>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{ padding: '5px', borderRadius: '5px', minWidth: '150px' }}
                        >
                            <option value="ALL">すべて表示</option>
                            {[...new Set(allProblems.map(p => p.category))].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {filteredProblems.length > 0 && (
                        <button onClick={toggleAll} style={subButtonStyle}>
                            {filteredProblems.every(p => selectedIds.includes(p.id)) ? "表示分を解除" : "表示分を全選択"}
                        </button>
                    )}
                </div>

                {/* 問題リスト表示（絞り込み後） */}
                <div style={{ display: 'grid', gap: '15px', marginBottom: '50px' }}>
                    {filteredProblems.map((prob, index) => {
                        const isSelected = selectedIds.includes(prob.id);
                        return (
                            <div key={prob.id || index} 
                                 style={{ 
                                    border: `2px solid ${isSelected ? '#0070f3' : '#eee'}`, 
                                    padding: '15px', borderRadius: '8px', display: 'flex', gap: '15px', 
                                    alignItems: 'flex-start', cursor: 'pointer',
                                    background: isSelected ? '#f0f7ff' : 'white'
                                 }} 
                                 onClick={() => toggleSelect(prob.id)}>
                                <input type="checkbox" checked={isSelected} readOnly style={{ width: '20px', height: '20px' }} />
                                <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>[{prob.category}]</span>
                                    <MathPreview tex={prob.problem_latex || prob.problem} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- 印刷用エリア（通常時は隠す） --- */}
            <div className="print-only">
                <div style={printHeaderStyle}>
                    <h2 style={{ margin: 0 }}>数学 演習プリント</h2>
                    <div style={{ fontSize: '1.1rem' }}>氏名：__________________________</div>
                </div>
                <div style={columnContainerStyle}>
                    {selectedProblemsForPrint.map((prob, index) => (
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
                        font-family: "Times New Roman", "MS Mincho", serif; 
                    }
                    .katex { font-family: KaTeX_Main, Times New Roman, serif !important; }
                }
                .print-only { display: none; }
            `}</style>
        </div>
    );
}

// --- スタイル定義 ---
const buttonStyle = { padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const deleteButtonStyle = { padding: '12px 24px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' };
const subButtonStyle = { padding: '8px 16px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' };
const printHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '2px solid black', paddingBottom: '5px', marginBottom: '20px' };
const columnContainerStyle = { columnCount: 2, columnGap: '40px', columnRule: '1px solid #ccc' };
const problemWrapperStyle = { marginBottom: '25px', pageBreakInside: 'avoid', breakInside: 'avoid', display: 'block' };
const answerSpaceStyle = { height: '80px', borderBottom: '1px dashed #ddd', marginTop: '10px', marginLeft: '25px' };