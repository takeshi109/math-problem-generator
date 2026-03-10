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
            const data = await dbClient.fetchAll();
            setAllProblems(data);
        } catch (error) {
            console.error("DB読み込み失敗:", error);
        } finally {
            setLoading(false);
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

    // --- 【新規追加】削除処理 ---
    const handleDelete = async () => {
        if (selectedIds.length === 0) return alert("消したい問題を選んでください");
        
        const ok = window.confirm(`選択した ${selectedIds.length} 件の問題を削除しますか？`);
        if (!ok) return;

        try {
            // Python側の /api/delete を叩く
            const response = await fetch('http://localhost:5000/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }) // IDのリストを送信
            });

            if (response.ok) {
                alert("削除しました");
                // 画面上のリストを更新（再読み込み）
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
                <h1> 問題バンク (TinyDB)</h1>
                <p>蓄積数: {allProblems.length} 問 / 選択中: {selectedIds.length} 問</p>
                
                {/* ボタンエリア */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button onClick={handlePrint} style={buttonStyle}>
                         PDFを作成 (印刷)
                    </button>
                    
                    <button onClick={handleDelete} style={deleteButtonStyle}>
                         選択した問題を削除
                    </button>
                </div>

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
                                <MathPreview tex={prob.formula_latex || prob.problem} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- 印刷用エリアは変更なし --- */}
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
                                        <MathPreview tex={prob.formula_latex || prob.problem} />
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
                    body { background: white; font-family: "MS Mincho", "Hiragino Mincho ProN", serif; }
                }
                .print-only { display: none; }
            `}</style>
        </div>
    );
}

// スタイル定義
const buttonStyle = {
    padding: '12px 24px', backgroundColor: '#007bff', color: 'white', 
    border: 'none', borderRadius: '30px', fontWeight: 'bold',
    cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const deleteButtonStyle = {
    padding: '12px 24px', backgroundColor: '#dc3545', color: 'white', 
    border: 'none', borderRadius: '30px', fontWeight: 'bold',
    cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const printHeaderStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottom: '2px solid black', paddingBottom: '5px', marginBottom: '20px'
};

const columnContainerStyle = {
    columnCount: 2, columnGap: '40px', columnRule: '1px solid #ccc'
};

const problemWrapperStyle = {
    marginBottom: '25px', pageBreakInside: 'avoid', breakInside: 'avoid', display: 'block'
};

const answerSpaceStyle = {
    height: '80px', borderBottom: '1px dashed #ddd', marginTop: '10px', marginLeft: '25px'
};