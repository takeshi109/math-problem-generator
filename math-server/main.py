from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import json
import sqlite3

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DB ----------------
def save_to_db(problems):
    conn = sqlite3.connect("math_app.db")
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS problems (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            problem_latex TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    for p in problems:
        cur.execute(
            "INSERT INTO problems (category, problem_latex) VALUES (?, ?)",
            (p["category"], p["problem"])
        )

    conn.commit()
    conn.close()


# ---------------- EXTRACT ----------------
@app.post("/extract-problems")
async def extract_problems(
    api_key: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        content = await file.read()
        tex_content = content.decode("utf-8", errors="ignore")

        client = Groq(api_key=api_key)

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
  "role": "system",
  "content": """
You are a strict LaTeX generator.

You MUST output valid LaTeX only.

CRITICAL RULES:
- NEVER use Unicode math symbols (∫ √ × ÷ ∞ etc.)
- ALWAYS use LaTeX commands:
  - integral → \\int
  - square root → \\sqrt{}
  - sin → \\sin
  - cos → \\cos
  - tan → \\tan
- DO NOT translate or simplify math
- DO NOT add words like "Calculate", "Find"
- DO NOT explain anything

OUTPUT FORMAT (strict JSON):
{
  "problems": [
    {
      "category": "integration",
      "problem": "\\int x \\sin(x) \\,dx"
    }
  ]
}
"""
},
                {
                    "role": "user",
                    "content": f"""
Extract ONLY math problems from this LaTeX:

{tex_content}
"""
                }
            ],
            response_format={"type": "json_object"}
        )

        parsed = json.loads(completion.choices[0].message.content)

        return {
            "status": "success",
            "problems": parsed["problems"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- GET ----------------
@app.get("/problems")
async def get_problems():
    conn = sqlite3.connect("math_app.db")
    cur = conn.cursor()

    cur.execute("SELECT id, category, problem_latex FROM problems")
    rows = cur.fetchall()
    conn.close()

    return {
        "data": [
            {"id": r[0], "category": r[1], "problem": r[2]}
            for r in rows
        ]
    }


# ---------------- SAVE ----------------
class Problem(BaseModel):
    category: str
    problem: str


@app.post("/api/save")
async def save_problems(problems: list[Problem]):
    try:
        save_to_db([p.dict() for p in problems])
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- DELETE ----------------
class DeleteRequest(BaseModel):
    ids: list[int]


@app.post("/api/delete")
async def delete_problems(request: DeleteRequest):
    try:
        conn = sqlite3.connect("math_app.db")
        cur = conn.cursor()

        placeholders = ",".join(["?"] * len(request.ids))
        cur.execute(f"DELETE FROM problems WHERE id IN ({placeholders})", request.ids)

        conn.commit()
        conn.close()

        return {"status": "success"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- RUN ----------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)