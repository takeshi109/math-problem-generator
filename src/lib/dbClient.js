const API_BASE = "http://localhost:5000/api";

export const dbClient = {
    // 1. 解析した問題をDBに保存
    save: async (problems) => {
        const res = await fetch(`${API_BASE}/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problems })
        });
        return res.json();
    },

    // 2. DBに溜まった全問題を取得
    fetchAll: async () => {
        const res = await fetch(`${API_BASE}/problems`);
        return res.json();
    },

    // 3. 指定したIDの問題をDBから削除
    delete: async (ids) => {
        const res = await fetch(`${API_BASE}/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }) // Python側の ids = data.get('ids') と一致
        });
        return res.json();
    }
};