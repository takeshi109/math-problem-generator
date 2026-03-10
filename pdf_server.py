from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from tinydb import TinyDB, Query  # Query を追加
import os
import uuid

app = Flask(__name__)
CORS(app)

# データベースの準備
db = TinyDB('problem_bank.json')

# --- 解析した問題をDBに保存 ---
@app.route('/api/save', methods=['POST'])
def save_problems():
    try:
        data = request.json
        problems = data.get('problems', [])
        
        for p in problems:
            if 'id' not in p:
                p['id'] = str(uuid.uuid4())[:8]
        
        if problems:
            db.insert_multiple(problems)
            print(f" {len(problems)} 問を保存しました。")
            return jsonify({"status": "success", "count": len(problems)})
        
        return jsonify({"status": "error", "message": "データが空です"}), 400
    except Exception as e:
        print(f" 保存エラー: {e}")
        return jsonify({"error": str(e)}), 500

# --- DBに溜まった全問題を返す ---
@app.route('/api/problems', methods=['GET'])
def get_problems():
    try:
        all_data = db.all()
        return jsonify(all_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- 【修正ポイント！】問題を削除する窓口 ---
@app.route('/api/delete', methods=['POST']) # URLを /api/delete に変更
def delete_problems():
    try:
        data = request.json
        ids_to_delete = data.get('ids', []) # 変数名を統一
        
        if not ids_to_delete:
            return jsonify({"status": "error", "message": "IDが指定されていません"}), 400
        
        Problem = Query()
        db.remove(Problem.id.one_of(ids_to_delete))
        
        print(f" {len(ids_to_delete)} 件の問題を削除しました")
        return jsonify({"status": "success", "message": "Deleted successfully"})

    except Exception as e:
        print(f" 削除エラー: {e}")
        return jsonify({"error": str(e)}), 500

# --- PDF(Tex)生成 ---
@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    try:
        data = request.json
        tex_content = data.get('tex', '')
        file_path = "math_print.tex"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(tex_content)
        return send_file(file_path, as_attachment=True, download_name="math_print.tex", mimetype='text/plain')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print(" サーバーが 5000 番ポートで起動しました。")
    app.run(port=5000, debug=True) # debug=Trueにするとエラーが見やすくなります