// src/lib/groqParser.js

import Groq from "groq-sdk";

export const parseTexWithGroq = async (texContent, apiKey) => {
    const client = new Groq({ 
        apiKey: apiKey,
        dangerouslyAllowBrowser: true 
    });

    const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            {
                "role": "system",
                "content": "あなたは数学のLaTeXソースから問題を抽出する専門家です。レスポンスは必ず {'problems': [{'category': '...', 'problem': '...'}]} という純粋なJSON形式のみで行ってください。"
            },
            {
                "role": "user",
                "content": `以下のソースから数学の問題を抽出してください。
                
                【抽出ルール】
                1. 各問題について、単元名(category)と問題文(problem)を分けてください。
                2. "problem" の中身は、元のソースにある LaTeX コマンド（\\int, \\frac 等）を一切変更せず、そのまま抽出してください。
                3. 数式は $ で囲まれている必要はありません（こちらで付与します）。
                4. JSONを破壊するような特殊なエスケープ（\\f 等）を避けるため、数式のバックスラッシュはそのまま出力してください。

                ソース：
                ${texContent}`
            }
        ],
        response_format: { "type": "json_object" }
    });

    // AIからの回答を一度受け取る
    const rawContent = completion.choices[0].message.content;
    
    try {
        return JSON.parse(rawContent);
    } catch (e) {
        // もしバックスラッシュのせいでパースに失敗したら、エスケープを補完してリトライ
        const fixedContent = rawContent.replace(/\\/g, "\\\\");
        return JSON.parse(fixedContent);
    }
};