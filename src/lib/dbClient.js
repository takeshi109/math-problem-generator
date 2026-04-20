const API_BASE = "http://localhost:8000";

export const dbClient = {
    save: async (problems) => {
        const res = await fetch(`${API_BASE}/api/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(problems)
        });
        return res.json();
    },

    fetchAll: async () => {
        const res = await fetch(`${API_BASE}/problems`); // ★ここ
        return res.json();
    },

    delete: async (ids) => {
        const res = await fetch(`${API_BASE}/api/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids })
        });
        return res.json();
    }
};