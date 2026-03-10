from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
import subprocess
import os
import uuid

app = FastAPI()

# リクエストのデータ構造を定義
class TexData(BaseModel):
    tex: str

@app.post("/generate-pdf")
async def generate_pdf(data: TexData):
    # 1. 一時的なファイル名を生成（同時アクセス対策）
    job_id = str(uuid.uuid4())
    tex_filename = f"{job_id}.tex"
    pdf_filename = f"{job_id}.pdf"

    try:
        # 2. TeXソースをファイルに書き出す
        with open(tex_filename, "w", encoding="utf-8") as f:
            f.write(data.tex)

        # 3. XeLaTeXコマンドを実行
        # -interaction=nonstopmode でエラー時も止まらないようにする
        result = subprocess.run(
            ["xelatex", "-interaction=nonstopmode", tex_filename],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        if not os.path.exists(pdf_filename):
            raise HTTPException(status_code=500, detail="PDFの生成に失敗しました。")

        # 4. 生成されたPDFをクライアントに返却
        return FileResponse(
            path=pdf_filename,
            media_type='application/pdf',
            filename="math_print.pdf"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # 最後に掃除（作成した中間ファイルを消す処理をここに入れるのが理想）